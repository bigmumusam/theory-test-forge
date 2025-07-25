package com.medical.exam.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DepartmentQueryDTO {
    @Size(max = 50, message = "题目分类名称不能超过50字符")
    private String name;
    @NotNull(message = "页码不能为空")
    @Min(value = 1, message = "页码最小为1")
    private Integer pageNumber = 1;
    @NotNull(message = "每页数量不能为空")
    @Min(value = 1, message = "每页最小为1")
    private Integer pageSize = 10;
} 