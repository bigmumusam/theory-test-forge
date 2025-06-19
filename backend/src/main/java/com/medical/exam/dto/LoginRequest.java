
package com.medical.exam.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {
    
    @NotBlank(message = "身份证号不能为空")
    private String idNumber;
    
    @NotBlank(message = "姓名不能为空")
    private String name;

    // Constructors
    public LoginRequest() {}

    // Getters and Setters
    public String getIdNumber() { return idNumber; }
    public void setIdNumber(String idNumber) { this.idNumber = idNumber; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
