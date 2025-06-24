package com.medical.exam.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AvailableQuestionQueryDTO {
    @Size(max = 50, message = "科室名称不能超过50字符")
    private String category;
    @Size(max = 20, message = "题目类型不能超过20字符")
    private String type;
    @Size(max = 20, message = "难度不能超过20字符")
    private String difficulty;
    @Size(max = 200, message = "排除ID列表过长")
    private String excludeIds;
    @NotNull(message = "页码不能为空")
    @Min(value = 1, message = "页码最小为1")
    private Integer pageNum = 1;
    @NotNull(message = "每页数量不能为空")
    @Min(value = 1, message = "每页最小为1")
    private Integer pageSize = 20;
} 