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
@Table("exam_force_retake")
@NoArgsConstructor
@AllArgsConstructor
public class ExamForceRetake {
    @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
    private String forceRetakeId;
    private String userId;
    private String paperId;
    private Integer forceRetake; // 强制重考标识(0:正常,1:管理员要求重考)
    private String createBy;
    @Column(onInsertValue = "now()")
    private Date createTime;
    private String updateBy;
    @Column(onUpdateValue = "now()")
    private Date updateTime;
    private String remark;
}
