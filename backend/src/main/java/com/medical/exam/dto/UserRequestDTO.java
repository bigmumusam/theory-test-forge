package com.medical.exam.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author pipi
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRequestDTO {
    
    @NotBlank(message = "姓名不能为空")
    private String userName;
    
    @NotBlank(message = "身份证号不能为空")
    private String idNumber;
    
    @NotBlank(message = "角色不能为空")
    private String role;

    @NotBlank(message = "科室不能为空")
    private String department;

}
