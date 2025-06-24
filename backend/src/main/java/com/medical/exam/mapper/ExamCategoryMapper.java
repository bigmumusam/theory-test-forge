package com.medical.exam.mapper;

import com.medical.exam.entity.ExamCategory;
import com.mybatisflex.core.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
 
@Mapper
public interface ExamCategoryMapper extends BaseMapper<ExamCategory> {
    // 可根据需要添加自定义方法
} 