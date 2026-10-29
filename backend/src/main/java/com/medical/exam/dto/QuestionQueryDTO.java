package com.medical.exam.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuestionQueryDTO {
    private String categoryId;
    private String questionType;
    private String difficulty;
    private String keyword;
    private Integer scoreMin;
    private Integer scoreMax;
    private String status; // 1:启用 0:停用 all:全部，不传默认只查启用
    @NotNull(message = "页码不能为空")
    @Min(value = 1, message = "页码最小为1")
    private Integer pageNumber = 1;
    @NotNull(message = "每页数量不能为空")
    @Min(value = 1, message = "每页最小为1")
    private Integer pageSize = 10;
} 