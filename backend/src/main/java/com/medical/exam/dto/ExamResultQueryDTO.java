package com.medical.exam.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ExamResultQueryDTO {
    private String category;
    private String status;
    private String keyword;
    @NotNull(message = "页码不能为空")
    @Min(value = 1, message = "页码最小为1")
    private Integer pageNumber = 1;
    @NotNull(message = "每页数量不能为空")
    @Min(value = 1, message = "每页最小为1")
    private Integer pageSize = 10;
} 