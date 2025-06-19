
package com.medical.exam.mapper;

import com.medical.exam.entity.SysUser;
import com.mybatisflex.core.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface SysUserMapper extends BaseMapper<SysUser> {
    
    @Select("SELECT * FROM sys_user WHERE id_number = #{idNumber} AND user_name = #{name} AND status = '1'")
    SysUser findByIdNumberAndName(@Param("idNumber") String idNumber, @Param("name") String name);
}
