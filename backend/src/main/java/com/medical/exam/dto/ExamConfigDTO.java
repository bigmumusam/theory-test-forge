package com.medical.exam.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ExamConfigDTO {
    private String configId;
    private String configName;
    private String categoryId;
    //考试时长
    private Integer duration;
    private Integer totalScore;
    //及格分数
    private Integer passScore;
    //选择题数量
    private Integer choiceCount;
    //判断题数量
    private Integer judgmentCount;
    //选择题分数
    private Integer choiceScore;
    //判断题分数
    private Integer judgmentScore;

    private Integer pageNum = 1;
    private Integer pageSize = 10;
}
