package com.medical.exam.vo;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class Options {
    //角色列表
    private Map<String,String> roles;
    private List<ExamCategoryVo> categories;
    private Map<String,String> departments;
}
