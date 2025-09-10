package com.medical.exam.vo;

import lombok.Data;

@Data
public class PaperExamDetailVo {
    private String userId;
    private String userName;
    private String idNumber;
    private String department;
    private String userCategory; // 人员类别
    private String examStatus; // "已考试" 或 "未考试"
    private String examDate; // 考试日期（如果已考试）
    private Integer score; // 考试分数（如果已考试）
    private String status; // 考试状态（如果已考试）
}
