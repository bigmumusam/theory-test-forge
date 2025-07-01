package com.medical.exam.vo;

import lombok.Builder;
import lombok.Data;

import java.io.Serializable;

@Data
public class ExamCategoryVo {
    private String categoryId;
    private String categoryName;
    private String remark;
    private Long questionCount;
}
