package com.medical.exam.entity;

import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import com.mybatisflex.core.keygen.KeyGenerators;
import com.mybatisflex.annotation.Column;
import lombok.Data;
import lombok.Builder;
import java.util.Date;

@Data
@Builder
@Table("exam_paper_question")
public class ExamPaperQuestion {
    @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
    private Long id;
    private Long paperId;
    private Long questionId;
    private Integer questionOrder;
    private Integer questionScore;
    @Column(onInsertValue = "now()")
    private Date createTime;
} 