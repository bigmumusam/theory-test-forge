package com.medical.exam.dto;

import lombok.Data;

// 试卷关联题目
@Data
public class ExamPaperRelated {
    private String questionId;
    private Integer questionOrder;
    private Integer score;
}
