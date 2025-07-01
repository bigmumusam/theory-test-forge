package com.medical.exam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class SubmitExamRequest {
    
    private String recordId;
    
    @NotEmpty(message = "答案列表不能为空")
    private List<AnswerDTO> answers;
}
