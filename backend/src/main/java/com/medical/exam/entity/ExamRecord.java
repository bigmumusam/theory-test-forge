
package com.medical.exam.entity;

import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;

import java.time.LocalDateTime;

@Table("exam_record")
public class ExamRecord {
    
    @Id(keyType = KeyType.Auto)
    private Long recordId;
    private Long userId;
    private Long configId;
    private String examName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer duration;
    private Integer totalScore;
    private Integer score;
    private Integer passScore;
    private String status;
    private Long createDept;
    private Long createBy;
    private LocalDateTime createTime;
    private Long updateBy;
    private LocalDateTime updateTime;
    private String remark;

    // Constructors
    public ExamRecord() {}

    // Getters and Setters
    public Long getRecordId() { return recordId; }
    public void setRecordId(Long recordId) { this.recordId = recordId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getConfigId() { return configId; }
    public void setConfigId(Long configId) { this.configId = configId; }
    public String getExamName() { return examName; }
    public void setExamName(String examName) { this.examName = examName; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public Integer getTotalScore() { return totalScore; }
    public void setTotalScore(Integer totalScore) { this.totalScore = totalScore; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public Integer getPassScore() { return passScore; }
    public void setPassScore(Integer passScore) { this.passScore = passScore; }
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
