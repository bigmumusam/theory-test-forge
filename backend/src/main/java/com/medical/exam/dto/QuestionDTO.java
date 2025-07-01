package com.medical.exam.dto;

import lombok.Data;

@Data
public class QuestionDTO {
    private String questionId;
    private String questionType;
    private String questionContent;
    private String questionOptions;
    private String correctAnswer;
    private String categoryId;
    private String difficulty;
    private Integer score;
    private String status;
    private String remark;
} 