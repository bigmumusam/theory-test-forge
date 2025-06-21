package com.medical.exam.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

@Data
public class ExamPaperResponse {
    
    private String id;
    private String name;
    private String category;
    private String description;
    private Integer duration;
    private Integer questionCount;
    private Integer totalScore;
    private String difficulty;
    private Boolean available;
    private String recordId;
    private String examName;
    private List<QuestionDto> questions;
    private LocalDateTime startTime;

    // Constructors
    public ExamPaperResponse() {}

    @Data
    public static class QuestionDto {
        private String id;
        private String type;
        private String content;
        private List<String> options;
        private Integer score;

        // Constructors
        public QuestionDto() {}
    }
}
