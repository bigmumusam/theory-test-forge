package com.medical.exam.entity;

import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import com.mybatisflex.core.keygen.KeyGenerators;
import com.mybatisflex.annotation.Column;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@Table("exam_paper_question")
@NoArgsConstructor
@AllArgsConstructor
public class ExamPaperQuestion {
    @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
    private String id;
    private String paperId;
    private String questionId;
    private Integer questionOrder;
    private Integer questionScore;
    @Column(onInsertValue = "now()")
    private Date createTime;
} 