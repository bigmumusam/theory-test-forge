package com.medical.exam.entity;

import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import com.mybatisflex.core.keygen.KeyGenerators;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Builder;
import java.util.Date;
import com.mybatisflex.annotation.Column;
import lombok.NoArgsConstructor;

@Data
@Builder
@Table("exam_config")
@NoArgsConstructor
@AllArgsConstructor
public class ExamConfig {
    @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
    private String configId;
    private String configName;
    private String categoryId;
    private String userCategory; // 人员类别，多个类别用逗号分隔
    //考试时长
    private Integer duration;
    private Integer totalScore;
    //及格分数
    private Integer passScore;
    //选择题数量
    private Integer choiceCount;
    //判断题数量
    private Integer judgmentCount;
    private Integer multiCount;
    //选择题分数
    private Integer choiceScore;
    //判断题分数
    private Integer judgmentScore;
    private Integer multiScore;
    private String status;
    private String createDept;
    private String createBy;
    @Column(onInsertValue = "now()")
    private Date createTime;
    private String updateBy;
    @Column(onUpdateValue = "now()")
    private Date updateTime;
    private String remark;
    @Column(isLogicDelete = true)
    private Boolean isDelete;
} 