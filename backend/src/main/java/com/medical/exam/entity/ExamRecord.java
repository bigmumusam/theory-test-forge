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
@Table("exam_record")
public class ExamRecord {
    
    @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
    private Long recordId;
    private Long userId;
    private Long configId;
    private String examName;
    private Date startTime;
    private Date endTime;
    private Integer duration;
    private Integer totalScore;
    private Integer score;
    private Integer passScore;
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
