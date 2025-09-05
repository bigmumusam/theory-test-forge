package com.medical.exam.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaperExamStatusDTO {
    private String paperId;
    private String paperName;
    private String userCategory;
    private Integer totalUsers; // 该人员类别下的总用户数
    private Integer examedUsers; // 已考试的用户数
    private Integer notExamedUsers; // 未考试的用户数
    private Double examRate; // 考试率
}
