package com.medical.exam.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ExamPaperRequest {
    
    @NotBlank(message = "考试ID不能为空")
    private String examId;
    
    @NotBlank(message = "科室分类不能为空") 
    private String category;

    // Constructors
    public ExamPaperRequest() {}

}
