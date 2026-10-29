-- =====================================================================
-- 生产库升级脚本：覆盖 2025-08 底升级之后的全部表结构变更
-- 来源提交：978163b(2025-09-05) 17a28a1(2025-09-10) e3e025c(2025-12-05)
--
-- 每一步都会先检查，确实缺失才执行，已存在则跳过；整个文件可直接执行，也可重复执行。
-- 执行前先切换到生产库：USE <生产库名>;
-- 注意：不要执行 add_user_category.sql 里的 DROP COLUMN score，当前代码仍在使用 exam_question.score
-- =====================================================================


-- 【第 1 步】sys_user.user_category 人员类别（978163b）
SET @exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_user' AND COLUMN_NAME = 'user_category');
SET @sql = IF(@exists = 0,
  'ALTER TABLE `sys_user` ADD COLUMN `user_category` varchar(20) DEFAULT ''指挥管理军官'' COMMENT ''人员类别(指挥管理军官,专业技术军官,文职,军士,聘用制)'' AFTER `department`',
  'SELECT ''第1步 sys_user.user_category 已存在，跳过'' AS 结果');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
UPDATE `sys_user` SET `user_category` = '指挥管理军官' WHERE `user_category` IS NULL;


-- 【第 2 步】sys_user.deleted 逻辑删除（978163b，此前无脚本；缺失会导致登录及所有用户查询报错）
SET @exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_user' AND COLUMN_NAME = 'deleted');
SET @sql = IF(@exists = 0,
  'ALTER TABLE `sys_user` ADD COLUMN `deleted` tinyint(1) DEFAULT 0 COMMENT ''是否删除''',
  'SELECT ''第2步 sys_user.deleted 已存在，跳过'' AS 结果');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
UPDATE `sys_user` SET `deleted` = 0 WHERE `deleted` IS NULL;


-- 【第 3 步】exam_config.user_category 人员类别，支持多选 varchar(200)（978163b + 17a28a1）
-- 缺失则新增；已存在但长度不是 varchar(200) 则扩长；已是 varchar(200) 则跳过
SET @col_type = (SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exam_config' AND COLUMN_NAME = 'user_category');
SET @sql = CASE
  WHEN @col_type IS NULL THEN
    'ALTER TABLE `exam_config` ADD COLUMN `user_category` varchar(200) DEFAULT ''指挥管理军官'' COMMENT ''人员类别(指挥管理军官,专业技术军官,文职,军士,聘用制)，多个类别用逗号分隔'' AFTER `category_id`'
  WHEN @col_type <> 'varchar(200)' THEN
    'ALTER TABLE `exam_config` MODIFY COLUMN `user_category` varchar(200) DEFAULT ''指挥管理军官'' COMMENT ''人员类别(指挥管理军官,专业技术军官,文职,军士,聘用制)，多个类别用逗号分隔'''
  ELSE
    'SELECT ''第3步 exam_config.user_category 已是 varchar(200)，跳过'' AS 结果'
END;
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
UPDATE `exam_config` SET `user_category` = '指挥管理军官' WHERE `user_category` IS NULL;


-- 【第 4 步】exam_category 树形分类字段（978163b；按 schema.sql 建库的通常已存在）
SET @exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exam_category' AND COLUMN_NAME = 'parent_id');
SET @sql = IF(@exists = 0,
  'ALTER TABLE `exam_category` ADD COLUMN `parent_id` bigint DEFAULT NULL COMMENT ''父级分类ID''',
  'SELECT ''第4步 exam_category.parent_id 已存在，跳过'' AS 结果');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exam_category' AND COLUMN_NAME = 'level');
SET @sql = IF(@exists = 0,
  'ALTER TABLE `exam_category` ADD COLUMN `level` int DEFAULT 1 COMMENT ''层级深度(1:一级分类,2:二级分类,3:三级分类)''',
  'SELECT ''第4步 exam_category.level 已存在，跳过'' AS 结果');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exam_category' AND COLUMN_NAME = 'sort_order');
SET @sql = IF(@exists = 0,
  'ALTER TABLE `exam_category` ADD COLUMN `sort_order` int DEFAULT 0 COMMENT ''排序顺序''',
  'SELECT ''第4步 exam_category.sort_order 已存在，跳过'' AS 结果');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- 【第 5 步】exam_force_retake 考生强制重考配置表（978163b，此前无脚本）
-- 未指定排序规则，沿用库默认值，避免与其他表的排序规则不一致
CREATE TABLE IF NOT EXISTS `exam_force_retake` (
  `force_retake_id` varchar(20) NOT NULL COMMENT '主键ID',
  `user_id` varchar(20) NOT NULL COMMENT '用户ID',
  `paper_id` varchar(20) NOT NULL COMMENT '试卷ID',
  `force_retake` int DEFAULT '1' COMMENT '强制重考标识(0:正常,1:管理员要求重考)',
  `create_by` varchar(20) DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` varchar(20) DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT '' COMMENT '备注',
  PRIMARY KEY (`force_retake_id`),
  UNIQUE KEY `uk_user_paper` (`user_id`,`paper_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_paper_id` (`paper_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='考生强制重考配置表';


-- 【第 6 步】删除 exam_paper.user_categories（17a28a1；人员类别改由 exam_config 关联获取，存在才删除）
SET @exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exam_paper' AND COLUMN_NAME = 'user_categories');
SET @sql = IF(@exists = 1,
  'ALTER TABLE `exam_paper` DROP COLUMN `user_categories`',
  'SELECT ''第6步 exam_paper.user_categories 不存在，跳过'' AS 结果');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- 【第 7 步】exam_record.deleted 逻辑删除（e3e025c，此前无脚本；缺失会导致开考、交卷、考试结果等全部报错）
SET @exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exam_record' AND COLUMN_NAME = 'deleted');
SET @sql = IF(@exists = 0,
  'ALTER TABLE `exam_record` ADD COLUMN `deleted` tinyint(1) DEFAULT 0 COMMENT ''逻辑删除标识(0:未删除,1:已删除)''',
  'SELECT ''第7步 exam_record.deleted 已存在，跳过'' AS 结果');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
UPDATE `exam_record` SET `deleted` = 0 WHERE `deleted` IS NULL;


-- 【最终检查】每项都应为"正常"
SELECT '1 sys_user.user_category' AS 项, IF(COUNT(*) = 1, '正常', '缺失') AS 状态 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_user' AND COLUMN_NAME = 'user_category'
UNION ALL SELECT '2 sys_user.deleted', IF(COUNT(*) = 1, '正常', '缺失') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'sys_user' AND COLUMN_NAME = 'deleted'
UNION ALL SELECT '3 exam_config.user_category varchar(200)', IF(COUNT(*) = 1, '正常', '缺失') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exam_config' AND COLUMN_NAME = 'user_category' AND COLUMN_TYPE = 'varchar(200)'
UNION ALL SELECT '4 exam_category 树形字段', IF(COUNT(*) = 3, '正常', '缺失') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exam_category' AND COLUMN_NAME IN ('parent_id', 'level', 'sort_order')
UNION ALL SELECT '5 exam_force_retake 表', IF(COUNT(*) = 1, '正常', '缺失') FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exam_force_retake'
UNION ALL SELECT '6 exam_paper.user_categories 已移除', IF(COUNT(*) = 0, '正常', '仍存在') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exam_paper' AND COLUMN_NAME = 'user_categories'
UNION ALL SELECT '7 exam_record.deleted', IF(COUNT(*) = 1, '正常', '缺失') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exam_record' AND COLUMN_NAME = 'deleted'
UNION ALL SELECT '* exam_question.score 保留', IF(COUNT(*) = 1, '正常', '缺失，需补回') FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'exam_question' AND COLUMN_NAME = 'score';
