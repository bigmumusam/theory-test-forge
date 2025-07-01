package com.medical.exam.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ExamPaperRequest {
    private String examId;
    
    private String category;


}
