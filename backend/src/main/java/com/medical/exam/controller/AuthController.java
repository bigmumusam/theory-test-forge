
package com.medical.exam.controller;

import com.medical.exam.common.result.Result;
import com.medical.exam.dto.LoginRequest;
import com.medical.exam.dto.LoginResponse;
import com.medical.exam.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return Result.success("登录成功", response);
    }

    @PostMapping("/logout")
    public Result<Void> logout() {
        return Result.success();
    }
}
