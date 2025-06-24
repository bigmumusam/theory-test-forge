package com.medical.exam.mapper;

import com.medical.exam.entity.ExamPaper;
import com.mybatisflex.core.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ExamPaperMapper extends BaseMapper<ExamPaper> {
    // 可根据需要添加自定义方法
} 