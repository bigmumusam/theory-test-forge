
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
  UNIQUE KEY `uk_id_number` (`id_number`)
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
  UNIQUE KEY `uk_dept_code` (`dept_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='科室信息表';

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
  UNIQUE KEY `uk_category_code` (`category_code`)
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
  KEY `idx_category_id` (`category_id`),
  KEY `idx_difficulty` (`difficulty`),
  CONSTRAINT `fk_question_category` FOREIGN KEY (`category_id`) REFERENCES `exam_category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='题库表';

-- 考试配置表
CREATE TABLE `exam_config` (
  `config_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '配置ID',
  `exam_name` varchar(100) NOT NULL COMMENT '考试名称',
  `category_id` bigint(20) NOT NULL COMMENT '分类ID',
  `duration` int(11) NOT NULL COMMENT '考试时长(分钟)',
  `total_score` int(11) NOT NULL COMMENT '总分',
  `pass_score` int(11) DEFAULT 60 COMMENT '及格分数',
  `question_count` int(11) NOT NULL COMMENT '题目数量',
  `status` char(1) DEFAULT '1' COMMENT '状态（1正常 0停用）',
  `create_dept` bigint(20) DEFAULT NULL COMMENT '创建部门',
  `create_by` bigint(20) DEFAULT NULL COMMENT '创建者',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_by` bigint(20) DEFAULT NULL COMMENT '更新者',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `remark` varchar(500) DEFAULT '' COMMENT '备注',
  PRIMARY KEY (`config_id`),
  KEY `idx_category_id` (`category_id`),
  CONSTRAINT `fk_config_category` FOREIGN KEY (`category_id`) REFERENCES `exam_category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='考试配置表';

-- 考试记录表
CREATE TABLE `exam_record` (
  `record_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `config_id` bigint(20) NOT NULL COMMENT '考试配置ID',
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
  KEY `idx_config_id` (`config_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_record_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`user_id`),
  CONSTRAINT `fk_record_config` FOREIGN KEY (`config_id`) REFERENCES `exam_config` (`config_id`)
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

-- 插入初始数据
INSERT INTO `sys_department` (`dept_name`, `dept_code`) VALUES
('消化内科', 'DEPT_01'),
('肝胆外科', 'DEPT_02'),
('心血管内科', 'DEPT_03'),
('呼吸内科', 'DEPT_04');

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
