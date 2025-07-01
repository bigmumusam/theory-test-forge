package com.medical.exam.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class RoleUpdateRequestDTO {
    private String roleId;
    private String roleName;
    private String roleKey;
    private Integer roleSort;
    private String status;
    private String remark;
} 