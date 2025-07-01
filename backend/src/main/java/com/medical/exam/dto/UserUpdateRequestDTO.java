package com.medical.exam.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserUpdateRequestDTO {

    private String userId;

    private String userName;
    
//    @NotBlank(message = "身份证号不能为空")
//    private String idNumber;
    
    private String role;

    private String department;
    
    private String status;

    // Constructors
    public UserUpdateRequestDTO() {}
}
