package com.medical.exam.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    
    @NotBlank(message = "身份证号不能为空")
    private String idNumber;
    
    @NotBlank(message = "姓名不能为空")
    private String name;

    // Constructors
    public LoginRequest() {}
}
