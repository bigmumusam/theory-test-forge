package com.medical.exam.dto;

import lombok.Data;

import java.util.List;

@Data
public class ExamPaperDTO {
    private String paperId;
    private String paperName;
    private String configId;
    private String categoryId;
    private Integer totalQuestions;
    private Integer totalScore;
    private Integer duration;

    private String status;

    private List<ExamPaperRelated> examPaperList;

}

