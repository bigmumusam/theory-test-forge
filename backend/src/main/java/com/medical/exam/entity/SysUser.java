package com.medical.exam.entity;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import com.mybatisflex.core.keygen.KeyGenerators;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Date;

@Data
@Builder
@Table("sys_user")
@NoArgsConstructor
@AllArgsConstructor
public class SysUser  implements Serializable {

    private static final long serialVersionUID = 1L;
    
    @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
    private String userId;
    private String idNumber;
    private String userName;
    private String role;
    private String department;
    private String userCategory; // 人员类别
    private String status;
    private String loginIp;
    private Date loginDate;
    private Long createDept;
    private String createBy;
    @Column(onInsertValue = "now()")
    private Date createTime;
    private String updateBy;
    @Column(onUpdateValue = "now()")
    private Date updateTime;
    private String remark;
    @Column(isLogicDelete = true)
    private Boolean deleted;
}
