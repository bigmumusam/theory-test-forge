package com.medical.exam.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AvailablePaperQueryDTO {

    private String category;
    private String type;
    private String difficulty;
    private String excludeIds;

    @NotNull(message = "页码不能为空")
    @Min(value = 1, message = "页码最小为1")
    private Integer pageNumber = 1;
    @NotNull(message = "每页数量不能为空")
    @Min(value = 1, message = "每页最小为1")
    private Integer pageSize = 20;
} 