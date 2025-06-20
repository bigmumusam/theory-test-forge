
package com.medical.exam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class SubmitExamRequest {
    
    @NotBlank(message = "考试记录ID不能为空")
    private String recordId;
    
    @NotEmpty(message = "答案列表不能为空")
    private List<AnswerDto> answers;

    // Constructors
    public SubmitExamRequest() {}

    // Getters and Setters
    public String getRecordId() { return recordId; }
    public void setRecordId(String recordId) { this.recordId = recordId; }
    public List<AnswerDto> getAnswers() { return answers; }
    public void setAnswers(List<AnswerDto> answers) { this.answers = answers; }

    public static class AnswerDto {
        private String questionId;
        private String userAnswer;

        // Constructors
        public AnswerDto() {}

        // Getters and Setters
        public String getQuestionId() { return questionId; }
        public void setQuestionId(String questionId) { this.questionId = questionId; }
        public String getUserAnswer() { return userAnswer; }
        public void setUserAnswer(String userAnswer) { this.userAnswer = userAnswer; }
    }
}
