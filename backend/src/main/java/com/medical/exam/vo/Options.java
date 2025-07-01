package com.medical.exam.vo;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class Options {
    //角色列表
    private Map<String,String> roles;
    private Map<String,String> categories;
    private Map<String,String> departments;
}
