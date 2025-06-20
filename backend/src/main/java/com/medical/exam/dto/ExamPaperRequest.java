
package com.medical.exam.dto;

import jakarta.validation.constraints.NotBlank;

public class ExamPaperRequest {
    
    @NotBlank(message = "考试ID不能为空")
    private String examId;
    
    @NotBlank(message = "科室分类不能为空") 
    private String category;

    // Constructors
    public ExamPaperRequest() {}

    // Getters and Setters
    public String getExamId() { return examId; }
    public void setExamId(String examId) { this.examId = examId; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
