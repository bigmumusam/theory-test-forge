package com.medical.exam.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserUpdateRequest {
    
    @NotBlank(message = "姓名不能为空")
    private String name;
    
    @NotBlank(message = "身份证号不能为空")
    private String idNumber;
    
    @NotBlank(message = "角色不能为空")
    private String role;
    
    private String department;
    
    @NotBlank(message = "状态不能为空")
    private String status;

    // Constructors
    public UserUpdateRequest() {}
}
