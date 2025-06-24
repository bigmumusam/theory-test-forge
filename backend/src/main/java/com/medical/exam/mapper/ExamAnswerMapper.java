package com.medical.exam.mapper;

import com.medical.exam.entity.ExamAnswer;
import com.mybatisflex.core.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ExamAnswerMapper extends BaseMapper<ExamAnswer> {
    // 可根据需要添加自定义方法
} 