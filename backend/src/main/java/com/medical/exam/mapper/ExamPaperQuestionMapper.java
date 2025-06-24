package com.medical.exam.mapper;

import com.medical.exam.entity.ExamPaperQuestion;
import com.mybatisflex.core.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ExamPaperQuestionMapper extends BaseMapper<ExamPaperQuestion> {
    // 可根据需要添加自定义方法
} 