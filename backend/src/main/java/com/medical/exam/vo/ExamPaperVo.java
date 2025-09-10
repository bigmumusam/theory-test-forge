package com.medical.exam.vo;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamPaperVo {
    private String paperId;
    private String paperName;
    private String categoryId;
    private String categoryName;
    private Integer totalQuestions;
    private Integer totalScore;
    private Integer duration;
    private Integer usageCount;
    private String status;
    private String createBy;
    private Date createTime;
    private String updateBy;
    private Date updateTime;
    private String remark;
    private String userCategories; // 人员类别（多个类别用逗号分隔）

    private String finished;
} 