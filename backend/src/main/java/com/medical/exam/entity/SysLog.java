package com.medical.exam.entity;

import java.io.Serializable;
import java.util.Date;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import com.mybatisflex.core.keygen.KeyGenerators;
import lombok.Builder;
import lombok.Data;

/**
 * sys_log
 */
@Data
@Builder
@Table(value = "sys_log")
public class SysLog implements Serializable {

    @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
    private String logId;

    private String userId;

    private String userName;

    private String content;

    @Column(onInsertValue = "now()")
    private Date createTime;

    private static final long serialVersionUID = 1L;
}