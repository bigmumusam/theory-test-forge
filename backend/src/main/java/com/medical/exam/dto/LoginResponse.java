
package com.medical.exam.dto;

public class LoginResponse {
    
    private String token;
    private UserInfo user;

    // Constructors
    public LoginResponse() {}

    public LoginResponse(String token, UserInfo user) {
        this.token = token;
        this.user = user;
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public UserInfo getUser() { return user; }
    public void setUser(UserInfo user) { this.user = user; }

    public static class UserInfo {
        private String id;
        private String name;
        private String idNumber;
        private String role;
        private String department;

        // Constructors
        public UserInfo() {}

        public UserInfo(String id, String name, String idNumber, String role, String department) {
            this.id = id;
            this.name = name;
            this.idNumber = idNumber;
            this.role = role;
            this.department = department;
        }

        // Getters and Setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getIdNumber() { return idNumber; }
        public void setIdNumber(String idNumber) { this.idNumber = idNumber; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
    }
}
