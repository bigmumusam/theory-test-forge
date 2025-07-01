package com.medical.exam.vo;

import com.medical.exam.entity.SysLog;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardVo {
    // 题目数量
    private Integer questionCount;
    private Integer examResultCountToday;
    private Integer categoryCount;
    private String avgExamScore;

    private List<SysLog> sysLogs;
    private List<CategoryCount> categorySummary;
}
