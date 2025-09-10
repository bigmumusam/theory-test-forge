-- 修改exam_config表的user_category字段，支持多个人员类别（逗号分隔）
-- 将字段长度从varchar(20)改为varchar(200)以支持多个类别
ALTER TABLE `exam_config` MODIFY COLUMN `user_category` varchar(200) DEFAULT '指挥管理军官' COMMENT '人员类别(指挥管理军官,专业技术军官,文职,军士,聘用制)，多个类别用逗号分隔';

-- 修改sys_user表的user_category字段，保持单个值
-- 这个表不需要修改，因为用户只能属于一个类别

