package com.medical.exam.vo;

import lombok.Data;

@Data
public class ExamResultSummaryVo {
    //总考试次数
    private Long examCount;
    //参与人数
    private Long participantCount;
    //平均分
    private Long avgScore;
    //通过人数
    private Long passCount;
}
