package com.medical.exam.entity;

import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Table("exam_question")
@Data
public class ExamQuestion {
    
    @Id(keyType = KeyType.Auto)
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
    private Long createBy;
    private LocalDateTime createTime;
    private Long updateBy;
    private LocalDateTime updateTime;
    private String remark;

    // Constructors
    public ExamQuestion() {}

}
