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
@Table("exam_answer")
@NoArgsConstructor
@AllArgsConstructor
public class ExamAnswer {
    @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
    private String answerId;
    private String recordId;
    private String questionId;
    private String userAnswer;
    private String correctAnswer;
    // 0:错误,1:正确
    private Integer isCorrect;
    private Integer score;
    private String createDept;
    private String createBy;
    @Column(onInsertValue = "now()")
    private Date createTime;
    private String updateBy;
    @Column(onUpdateValue = "now()")
    private Date updateTime;
    private String remark;
} 