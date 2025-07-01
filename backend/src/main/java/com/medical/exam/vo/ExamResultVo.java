package com.medical.exam.vo;

import lombok.Data;

/**
 * @author pipi
 */
@Data
public class ExamResultVo {
    private String recordId;
    private String userName;
    private String idNumber;
    private String examName;
    private String categoryName;
    private String score;
    private String duration;
    private String examDate;
    private String status;
    private Integer retake;
}
