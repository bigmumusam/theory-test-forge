
package com.medical.exam.dto;

import jakarta.validation.constraints.NotBlank;

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

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getIdNumber() { return idNumber; }
    public void setIdNumber(String idNumber) { this.idNumber = idNumber; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
