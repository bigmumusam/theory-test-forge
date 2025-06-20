
package com.medical.exam.dto;

import java.time.LocalDateTime;
import java.util.List;

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

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public Integer getQuestionCount() { return questionCount; }
    public void setQuestionCount(Integer questionCount) { this.questionCount = questionCount; }
    public Integer getTotalScore() { return totalScore; }
    public void setTotalScore(Integer totalScore) { this.totalScore = totalScore; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }
    public String getRecordId() { return recordId; }
    public void setRecordId(String recordId) { this.recordId = recordId; }
    public String getExamName() { return examName; }
    public void setExamName(String examName) { this.examName = examName; }
    public List<QuestionDto> getQuestions() { return questions; }
    public void setQuestions(List<QuestionDto> questions) { this.questions = questions; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public static class QuestionDto {
        private String id;
        private String type;
        private String content;
        private List<String> options;
        private Integer score;

        // Constructors
        public QuestionDto() {}

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public List<String> getOptions() { return options; }
        public void setOptions(List<String> options) { this.options = options; }
        public Integer getScore() { return score; }
        public void setScore(Integer score) { this.score = score; }
    }
}
