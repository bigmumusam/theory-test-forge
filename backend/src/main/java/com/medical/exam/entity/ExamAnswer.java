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
@Table("exam_answer")
public class ExamAnswer {
    @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
    private Long answerId;
    private Long recordId;
    private Long questionId;
    private String userAnswer;
    private String correctAnswer;
    private Boolean isCorrect;
    private Integer score;
    private Long createDept;
    private String createBy;
    @Column(onInsertValue = "now()")
    private Date createTime;
    private String updateBy;
    @Column(onUpdateValue = "now()")
    private Date updateTime;
    private String remark;
} 