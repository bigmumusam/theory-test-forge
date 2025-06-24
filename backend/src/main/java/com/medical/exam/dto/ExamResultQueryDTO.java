package com.medical.exam.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ExamResultQueryDTO {
    @Size(max = 50, message = "科室名称不能超过50字符")
    private String category;
    @Size(max = 20, message = "状态不能超过20字符")
    private String status;
    @Size(max = 30, message = "关键字不能超过30字符")
    private String keyword;
    @NotNull(message = "页码不能为空")
    @Min(value = 1, message = "页码最小为1")
    private Integer pageNum = 1;
    @NotNull(message = "每页数量不能为空")
    @Min(value = 1, message = "每页最小为1")
    private Integer pageSize = 10;
} 