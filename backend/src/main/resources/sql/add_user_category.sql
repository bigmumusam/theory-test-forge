-- 为sys_user表添加人员类别字段
ALTER TABLE `sys_user` ADD COLUMN `user_category` varchar(20) DEFAULT '指挥管理军官' COMMENT '人员类别(指挥管理军官,专业技术军官,文职,军士,聘用制)' AFTER `department`;

-- 更新现有数据，设置默认值
UPDATE `sys_user` SET `user_category` = '指挥管理军官' WHERE `user_category` IS NULL;

-- 为exam_config表添加人员类别字段
ALTER TABLE `exam_config` ADD COLUMN `user_category` varchar(20) DEFAULT '指挥管理军官' COMMENT '人员类别(指挥管理军官,专业技术军官,文职,军士,聘用制)' AFTER `category_id`;

-- 更新现有数据，设置默认值
UPDATE `exam_config` SET `user_category` = '指挥管理军官' WHERE `user_category` IS NULL;

-- 已废弃：当前代码仍在使用 exam_question.score（题目分数筛选、导入），不要执行
-- ALTER TABLE `exam_question` DROP COLUMN `score`;
