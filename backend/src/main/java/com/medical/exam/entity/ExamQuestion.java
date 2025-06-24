package com.medical.exam.entity;

import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import com.mybatisflex.core.keygen.KeyGenerators;
import lombok.Data;
import lombok.Builder;
import com.mybatisflex.annotation.Column;

import java.time.LocalDateTime;

@Data
@Builder
@Table("exam_question")
public class ExamQuestion {
    
    @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
    private Long questionId;
    private String questionType;
    private String questionContent;
    private String questionOptions;
    private String correctAnswer;
    private Long categoryId;
    private String difficulty;
    private Integer score;
    private String status;
    private Long createDept;
    private String createBy;
    @Column(onInsertValue = "now()")
    private LocalDateTime createTime;
    private String updateBy;
    @Column(onUpdateValue = "now()")
    private LocalDateTime updateTime;
    private String remark;

}
