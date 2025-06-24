package com.medical.exam.dto;

import lombok.Data;

@Data
public class LoginResponse {
    
    private String token;
    private UserInfo user;

    // Constructors
    public LoginResponse() {}

    public LoginResponse(String token, UserInfo user) {
        this.token = token;
        this.user = user;
    }

    @Data
    public static class UserInfo {
        private String userId;
        private String nameName;
        private String idNumber;
        private String role;
        private String department;

        // Constructors
        public UserInfo() {}

        public UserInfo(String userId, String nameName, String idNumber, String role, String department) {
            this.userId = userId;
            this.nameName = nameName;
            this.idNumber = idNumber;
            this.role = role;
            this.department = department;
        }
    }
}
