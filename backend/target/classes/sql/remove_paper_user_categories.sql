-- 移除exam_paper表中的user_categories字段
-- 因为人员类别信息应该通过config_id关联exam_config表获取

ALTER TABLE `exam_paper` DROP COLUMN `user_categories`;





