package com.medical.exam.mapper;

import lombok.Data;

@Data
public class ExamDetailVo {
    private String questionType;
    private String questionContent;
    private String questionOptions;
    private String correctAnswer;
    private String userAnswer;
    private Integer isCorrect;
    private String score;
}
