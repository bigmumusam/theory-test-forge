
package com.medical.exam.entity;

import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;

import java.time.LocalDateTime;

@Table("exam_question")
public class ExamQuestion {
    
    @Id(keyType = KeyType.Auto)
    private Long questionId;
    private String questionType;
    private String questionContent;
    private String questionOptions;
    private String correctAnswer;
    private Long categoryId;
    private String difficulty;
    private Integer score;
    private String status;
    private Long createDept;
    private Long createBy;
    private LocalDateTime createTime;
    private Long updateBy;
    private LocalDateTime updateTime;
    private String remark;

    // Constructors
    public ExamQuestion() {}

    // Getters and Setters
    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }
    public String getQuestionType() { return questionType; }
    public void setQuestionType(String questionType) { this.questionType = questionType; }
    public String getQuestionContent() { return questionContent; }
    public void setQuestionContent(String questionContent) { this.questionContent = questionContent; }
    public String getQuestionOptions() { return questionOptions; }
    public void setQuestionOptions(String questionOptions) { this.questionOptions = questionOptions; }
    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getCreateDept() { return createDept; }
    public void setCreateDept(Long createDept) { this.createDept = createDept; }
    public Long getCreateBy() { return createBy; }
    public void setCreateBy(Long createBy) { this.createBy = createBy; }
    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
    public Long getUpdateBy() { return updateBy; }
    public void setUpdateBy(Long updateBy) { this.updateBy = updateBy; }
    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }
}
