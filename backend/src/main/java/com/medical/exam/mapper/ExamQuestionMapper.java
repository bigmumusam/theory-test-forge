package com.medical.exam.mapper;

import com.medical.exam.entity.ExamQuestion;
import com.mybatisflex.core.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
 
@Mapper
public interface ExamQuestionMapper extends BaseMapper<ExamQuestion> {
    // 可根据需要添加自定义方法
} 