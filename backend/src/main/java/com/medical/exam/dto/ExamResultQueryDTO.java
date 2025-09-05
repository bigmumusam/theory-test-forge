package com.medical.exam.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ExamResultQueryDTO {
    private String category;
    private String status;
    private String keyword;
    private String passStatus; // 及格状态：pass(及格), fail(不及格)
    private String retakeStatus; // 重考状态：all(全部), retake(重考), normal(正常考试)
    private String examName; // 考试名称筛选
    @NotNull(message = "页码不能为空")
    @Min(value = 1, message = "页码最小为1")
    private Integer pageNumber = 1;
    @NotNull(message = "每页数量不能为空")
    @Min(value = 1, message = "每页最小为1")
    private Integer pageSize = 10;
} 