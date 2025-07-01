package com.medical.exam.entity;

import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import com.mybatisflex.core.keygen.KeyGenerators;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Builder;
import com.mybatisflex.annotation.Column;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@Table("exam_question")
@NoArgsConstructor
@AllArgsConstructor
public class ExamQuestion {
    
    @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
    private String questionId;
    private String questionType;
    private String questionContent;
    private String questionOptions;
    private String correctAnswer;
    private String categoryId;
    private String difficulty;
    private Integer score;
    private String status;
    private String createDept;
    private String createBy;
    @Column(onInsertValue = "now()")
    private LocalDateTime createTime;
    private String updateBy;
    @Column(onUpdateValue = "now()")
    private LocalDateTime updateTime;
    private String remark;
    @Column(isLogicDelete = true)
    private Boolean isDelete;

}
