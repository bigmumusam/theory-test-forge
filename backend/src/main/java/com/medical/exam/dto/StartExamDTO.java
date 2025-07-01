package com.medical.exam.dto;

import lombok.Data;

@Data
public class StartExamDTO {
    private String paperId;
    private String examName;
    private Integer passScore;
}
