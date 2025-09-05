package com.medical.exam.vo;

import lombok.Data;
import java.util.List;

@Data
public class CategoryCount {
    private String categoryId;
    private String categoryName;
    private String categoryCode;
    private String parentId;
    private Integer level;
    private Integer sortOrder;
    private Long questionCount;
    private List<CategoryCount> children;
}
