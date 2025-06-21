package com.medical.exam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class SubmitExamRequest {
    
    @NotBlank(message = "考试记录ID不能为空")
    private String recordId;
    
    @NotEmpty(message = "答案列表不能为空")
    private List<AnswerDto> answers;

    // Constructors
    public SubmitExamRequest() {}

    @Data
    public static class AnswerDto {
        private String questionId;
        private String userAnswer;

        // Constructors
        public AnswerDto() {}
    }
}
