package com.medical.exam.entity;

import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Table("sys_user")
public class SysUser {
    
    @Id(keyType = KeyType.Auto)
    private Long userId;
    private String idNumber;
    private String userName;
    private String role;
    private String department;
    private String status;
    private String loginIp;
    private LocalDateTime loginDate;
    private Long createDept;
    private Long createBy;
    private LocalDateTime createTime;
    private Long updateBy;
    private LocalDateTime updateTime;
    private String remark;

    // Constructors
    public SysUser() {}
}
