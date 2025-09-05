package com.medical.exam.dto;

import lombok.Data;

@Data
public class CategoryDTO {
    private String categoryId;
    private String categoryName;
    private String categoryCode;
    private String parentId;
    private Integer level;
    private Integer sortOrder;
    private String remark;
}
