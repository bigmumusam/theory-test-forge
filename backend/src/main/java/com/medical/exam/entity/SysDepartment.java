package com.medical.exam.entity;

import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import com.mybatisflex.core.keygen.KeyGenerators;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Builder;
import java.util.Date;
import com.mybatisflex.annotation.Column;
import lombok.NoArgsConstructor;

@Data
@Builder
@Table("sys_department")
@NoArgsConstructor
@AllArgsConstructor
public class SysDepartment {
    @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
    private String deptId;
    private String deptName;
    private String deptCode;
    private String status;
    private String createDept;
    private String createBy;
    @Column(onInsertValue = "now()")
    private Date createTime;
    private String updateBy;
    @Column(onUpdateValue = "now()")
    private Date updateTime;
    private String remark;
} 