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
@Table("exam_paper")
@NoArgsConstructor
@AllArgsConstructor
public class ExamPaper {
    @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
    private String paperId;
    private String paperName;
    private String configId;
    private String categoryId;
    private Integer totalQuestions;
    private Integer totalScore;
    private Integer duration;
    private Integer usageCount;
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