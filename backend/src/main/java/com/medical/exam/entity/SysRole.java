package com.medical.exam.entity;

import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import com.mybatisflex.core.keygen.KeyGenerators;
import lombok.Data;
import lombok.Builder;
import java.util.Date;
import com.mybatisflex.annotation.Column;

@Data
@Builder
@Table("sys_role")
public class SysRole {
    @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
    private Long roleId;
    private String roleName;
    private String roleKey;
    private Integer roleSort;
    private String status;
    private Long createDept;
    private String createBy;
    @Column(onInsertValue = "now()")
    private Date createTime;
    private String updateBy;
    @Column(onUpdateValue = "now()")
    private Date updateTime;
    private String remark;
} 