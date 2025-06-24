package com.medical.exam.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserUpdateRequestDTO {
    @NotBlank(message = "ID不能为空")
    private Long id;

    @NotBlank(message = "姓名不能为空")
    private String userName;
    
//    @NotBlank(message = "身份证号不能为空")
//    private String idNumber;
    
    @NotBlank(message = "角色不能为空")
    private String role;

    @NotBlank(message = "科室不能为空")
    private String department;
    
    @NotBlank(message = "状态不能为空")
    private String status;

    // Constructors
    public UserUpdateRequestDTO() {}
}
