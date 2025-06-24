package com.medical.exam.mapper;

import com.medical.exam.entity.SysDepartment;
import com.mybatisflex.core.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
 
@Mapper
public interface SysDepartmentMapper extends BaseMapper<SysDepartment> {
    // 可根据需要添加自定义方法
} 