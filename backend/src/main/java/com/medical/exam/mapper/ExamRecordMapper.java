package com.medical.exam.mapper;

import com.medical.exam.entity.ExamRecord;
import com.mybatisflex.core.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
 
@Mapper
public interface ExamRecordMapper extends BaseMapper<ExamRecord> {
    // 可根据需要添加自定义方法
} 