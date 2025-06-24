package com.medical.exam.vo;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CustomToken {
    private String token;
    private String userId;
    private String userName;
    private String idNumber;
    private String role;
    private String department;
}
