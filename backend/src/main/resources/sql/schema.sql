
-- 医学理论考试系统数据库建表脚本

-- 用户表
CREATE TABLE `sys_user` (
  `user_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `id_number` varchar(18) NOT NULL COMMENT '身份证号',
  `user_name` varchar(30) NOT NULL COMMENT '用户姓名',
  `role` varchar(20) NOT NULL DEFAULT 'student' COMMENT '用户角色(admin:管理员,student:学员)',
  `department` varchar(50) DEFAULT NULL COMMENT '科室',
  `status` char(1) DEFAULT '1' COMMENT '账号状态（1正常 0停用）',
  `login_ip` varchar(128) DEFAULT '' COMMENT '最后登录IP',
  `login_date` datetime DEFAULT NULL COMMENT '最后登录时间',
  `create_dept` bigint(20) DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint(20) DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` bigint(20) DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT '' COMMENT '备注',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uk_id_number` (`id_number`),
  KEY `idx_role` (`role`),
  KEY `idx_department` (`department`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户信息表';

-- 科室表
CREATE TABLE `sys_department` (
  `dept_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '科室ID',
  `dept_name` varchar(50) NOT NULL COMMENT '科室名称',
  `dept_code` varchar(20) NOT NULL COMMENT '科室编码',
  `status` char(1) DEFAULT '1' COMMENT '科室状态（1正常 0停用）',
  `create_dept` bigint(20) DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint(20) DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` bigint(20) DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT '' COMMENT '备注',
  PRIMARY KEY (`dept_id`),
  UNIQUE KEY `uk_dept_code` (`dept_code`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='科室信息表';

-- 角色表
CREATE TABLE `sys_role` (
  `role_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `role_name` varchar(30) NOT NULL COMMENT '角色名称',
  `role_key` varchar(100) NOT NULL COMMENT '角色权限字符串',
  `role_sort` int(11) NOT NULL COMMENT '显示顺序',
  `status` char(1) NOT NULL DEFAULT '1' COMMENT '角色状态（1正常 0停用）',
  `create_dept` bigint(20) DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint(20) DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` bigint(20) DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT '' COMMENT '备注',
  PRIMARY KEY (`role_id`),
  UNIQUE KEY `uk_role_key` (`role_key`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色信息表';

-- 题目分类表
CREATE TABLE `exam_category` (
  `category_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `category_name` varchar(50) NOT NULL COMMENT '分类名称',
  `category_code` varchar(20) NOT NULL COMMENT '分类编码',
  `status` char(1) DEFAULT '1' COMMENT '状态（1正常 0停用）',
  `create_dept` bigint(20) DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint(20) DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` bigint(20) DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT '' COMMENT '备注',
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `uk_category_code` (`category_code`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='题目分类表';

-- 题库表
CREATE TABLE `exam_question` (
  `question_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '题目ID',
  `question_type` varchar(20) NOT NULL COMMENT '题目类型(choice:选择题,judgment:判断题)',
  `question_content` text NOT NULL COMMENT '题目内容',
  `question_options` text COMMENT '选择题选项(JSON格式)',
  `correct_answer` varchar(200) NOT NULL COMMENT '正确答案',
  `category_id` bigint(20) NOT NULL COMMENT '分类ID',
  `difficulty` varchar(20) DEFAULT 'medium' COMMENT '难度等级(easy:简单,medium:中等,hard:困难)',
  `score` int(11) DEFAULT 1 COMMENT '题目分值',
  `status` char(1) DEFAULT '1' COMMENT '状态（1正常 0停用）',
  `create_dept` bigint(20) DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint(20) DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` bigint(20) DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT '' COMMENT '备注',
  PRIMARY KEY (`question_id`),
  KEY `idx_category_id` (`category_id`) COMMENT '分类ID索引，用于加速基于分类ID的查询操作',
  KEY `idx_difficulty` (`difficulty`),
  KEY `idx_status` (`status`),
  KEY `idx_type` (`question_type`),
  CONSTRAINT `fk_question_category` FOREIGN KEY (`category_id`) REFERENCES `exam_category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='题库表';

-- 考试配置表
CREATE TABLE `exam_config` (
  `config_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `config_name` varchar(100) NOT NULL COMMENT '配置名称',
  `category_id` bigint(20) NOT NULL COMMENT '分类ID',
  `duration` int(11) NOT NULL COMMENT '考试时长(分钟)',
  `total_score` int(11) NOT NULL COMMENT '总分',
  `pass_score` int(11) DEFAULT 60 COMMENT '及格分数',
  `choice_count` int(11) DEFAULT 0 COMMENT '选择题数量',
  `judgment_count` int(11) DEFAULT 0 COMMENT '判断题数量',
  `choice_score` int(11) DEFAULT 2 COMMENT '选择题分值',
  `judgment_score` int(11) DEFAULT 1 COMMENT '判断题分值',
  `status` char(1) DEFAULT '1' COMMENT '状态（1正常 0停用）',
  `create_dept` bigint(20) DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint(20) DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` bigint(20) DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT '' COMMENT '备注',
  PRIMARY KEY (`config_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_config_category` FOREIGN KEY (`category_id`) REFERENCES `exam_category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='考试配置表';

-- 生成试卷表
CREATE TABLE `exam_paper` (
  `paper_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '试卷ID',
  `paper_name` varchar(100) NOT NULL COMMENT '试卷名称',
  `config_id` bigint(20) NOT NULL COMMENT '考试配置ID',
  `category_id` bigint(20) NOT NULL COMMENT '分类ID',
  `total_questions` int(11) NOT NULL COMMENT '题目总数',
  `total_score` int(11) NOT NULL COMMENT '总分',
  `duration` int(11) NOT NULL COMMENT '考试时长(分钟)',
  `usage_count` int(11) DEFAULT 0 COMMENT '使用次数',
  `status` char(1) DEFAULT '1' COMMENT '状态（1启用 0停用）',
  `create_dept` bigint(20) DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint(20) DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` bigint(20) DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT '' COMMENT '备注',
  PRIMARY KEY (`paper_id`),
  KEY `idx_config_id` (`config_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_paper_config` FOREIGN KEY (`config_id`) REFERENCES `exam_config` (`config_id`),
  CONSTRAINT `fk_paper_category` FOREIGN KEY (`category_id`) REFERENCES `exam_category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生成试卷表';

-- 试卷题目关联表
CREATE TABLE `exam_paper_question` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `paper_id` bigint(20) NOT NULL COMMENT '试卷ID',
  `question_id` bigint(20) NOT NULL COMMENT '题目ID',
  `question_order` int(11) NOT NULL COMMENT '题目顺序',
  `question_score` int(11) NOT NULL COMMENT '该题分值',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_paper_question` (`paper_id`, `question_id`),
  KEY `idx_paper_id` (`paper_id`),
  KEY `idx_question_id` (`question_id`),
  KEY `idx_question_order` (`question_order`),
  CONSTRAINT `fk_pq_paper` FOREIGN KEY (`paper_id`) REFERENCES `exam_paper` (`paper_id`),
  CONSTRAINT `fk_pq_question` FOREIGN KEY (`question_id`) REFERENCES `exam_question` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='试卷题目关联表';

-- 考试记录表
CREATE TABLE `exam_record` (
  `record_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `paper_id` bigint(20) NOT NULL COMMENT '试卷ID',
  `exam_name` varchar(100) NOT NULL COMMENT '考试名称',
  `start_time` datetime NOT NULL COMMENT '开始时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束时间',
  `duration` int(11) DEFAULT 0 COMMENT '实际用时(分钟)',
  `total_score` int(11) NOT NULL COMMENT '总分',
  `score` int(11) DEFAULT 0 COMMENT '得分',
  `pass_score` int(11) NOT NULL COMMENT '及格分数',
  `status` varchar(20) DEFAULT 'in-progress' COMMENT '状态(pending:待开始,in-progress:进行中,completed:已完成,timeout:超时)',
  `create_dept` bigint(20) DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint(20) DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` bigint(20) DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT '' COMMENT '备注',
  PRIMARY KEY (`record_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_paper_id` (`paper_id`),
  KEY `idx_status` (`status`),
  KEY `idx_start_time` (`start_time`),
  CONSTRAINT `fk_record_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`user_id`),
  CONSTRAINT `fk_record_paper` FOREIGN KEY (`paper_id`) REFERENCES `exam_paper` (`paper_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='考试记录表';

-- 考试答题记录表
CREATE TABLE `exam_answer` (
  `answer_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '答题ID',
  `record_id` bigint(20) NOT NULL COMMENT '考试记录ID',
  `question_id` bigint(20) NOT NULL COMMENT '题目ID',
  `user_answer` varchar(200) DEFAULT NULL COMMENT '用户答案',
  `correct_answer` varchar(200) NOT NULL COMMENT '正确答案',
  `is_correct` tinyint(1) DEFAULT 0 COMMENT '是否正确(0:错误,1:正确)',
  `score` int(11) DEFAULT 0 COMMENT '得分',
  `create_dept` bigint(20) DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint(20) DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` bigint(20) DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT '' COMMENT '备注',
  PRIMARY KEY (`answer_id`),
  KEY `idx_record_id` (`record_id`),
  KEY `idx_question_id` (`question_id`),
  CONSTRAINT `fk_answer_record` FOREIGN KEY (`record_id`) REFERENCES `exam_record` (`record_id`),
  CONSTRAINT `fk_answer_question` FOREIGN KEY (`question_id`) REFERENCES `exam_question` (`question_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='考试答题记录表';

-- 统计视图
CREATE VIEW `v_exam_statistics` AS
SELECT 
    DATE(er.start_time) as exam_date,
    ec.category_name,
    COUNT(*) as total_exams,
    COUNT(CASE WHEN er.status = 'completed' THEN 1 END) as completed_exams,
    COUNT(CASE WHEN er.status = 'timeout' THEN 1 END) as timeout_exams,
    AVG(CASE WHEN er.status = 'completed' THEN er.score END) as avg_score,
    COUNT(CASE WHEN er.score >= er.pass_score THEN 1 END) as pass_count
FROM exam_record er
LEFT JOIN exam_paper ep ON er.paper_id = ep.paper_id
LEFT JOIN exam_category ec ON ep.category_id = ec.category_id
GROUP BY DATE(er.start_time), ec.category_name;

-- 插入初始数据
INSERT INTO `sys_department` (`dept_name`, `dept_code`) VALUES
('消化内科', 'DEPT_01'),
('肝胆外科', 'DEPT_02'),
('心血管内科', 'DEPT_03'),
('呼吸内科', 'DEPT_04'),
('系统管理', 'DEPT_SYS');

INSERT INTO `sys_role` (`role_name`, `role_key`, `role_sort`, `remark`) VALUES
('系统管理员', 'admin', 1, '超级管理员，拥有所有权限'),
('普通考生', 'student', 2, '普通考生，只能参加考试'),
('考试管理员', 'exam_admin', 3, '负责考试管理');

INSERT INTO `sys_user` (`id_number`, `user_name`, `role`, `department`) VALUES
('110101199001011234', '管理员', 'admin', '系统管理'),
('110101199001011111', '张医生', 'student', '消化内科'),
('110101199002022222', '李护士', 'student', '肝胆外科'),
('110101199003033333', '王医生', 'student', '消化内科'),
('110101199004044444', '赵技师', 'student', '心血管内科');

INSERT INTO `exam_category` (`category_name`, `category_code`) VALUES
('消化内科', 'CAT_01'),
('肝胆外科', 'CAT_02'),
('心血管内科', 'CAT_03'),
('呼吸内科', 'CAT_04');

-- 插入示例题目数据
INSERT INTO `exam_question` (`question_type`, `question_content`, `question_options`, `correct_answer`, `category_id`, `difficulty`, `score`) VALUES
('choice', '胃溃疡最常见的并发症是？', '["穿孔", "出血", "幽门梗阻", "癌变"]', '1', 1, 'medium', 2),
('judgment', 'Hp感染是胃溃疡的主要病因之一', NULL, '正确', 1, 'easy', 1),
('choice', '急性胃炎最常见的病因是？', '["饮食不当", "药物因素", "感染", "应激"]', '0', 1, 'medium', 2),
('choice', '胆囊炎最典型的症状是？', '["右上腹痛", "恶心呕吐", "发热", "黄疸"]', '0', 2, 'medium', 2),
('judgment', '胆结石患者都需要手术治疗', NULL, '错误', 2, 'easy', 1);

-- 插入示例考试配置
INSERT INTO `exam_config` (`config_name`, `category_id`, `duration`, `total_score`, `pass_score`, `choice_count`, `judgment_count`, `choice_score`, `judgment_score`) VALUES
('消化内科理论考试', 1, 90, 100, 60, 40, 20, 2, 1),
('肝胆外科专业考试', 2, 120, 100, 60, 35, 30, 2, 1);

-- 创建索引优化查询性能
CREATE INDEX `idx_exam_record_composite` ON `exam_record` (`user_id`, `status`, `start_time`);
CREATE INDEX `idx_exam_answer_composite` ON `exam_answer` (`record_id`, `is_correct`);
CREATE INDEX `idx_question_composite` ON `exam_question` (`category_id`, `difficulty`, `status`);
CREATE INDEX `idx_paper_composite` ON `exam_paper` (`category_id`, `status`, `create_time`);

