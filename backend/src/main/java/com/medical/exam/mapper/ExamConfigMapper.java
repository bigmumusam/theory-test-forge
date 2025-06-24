package com.medical.exam.mapper;

import com.medical.exam.entity.ExamConfig;
import com.mybatisflex.core.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
 
@Mapper
public interface ExamConfigMapper extends BaseMapper<ExamConfig> {
    // 可根据需要添加自定义方法
} 