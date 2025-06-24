package com.medical.exam.controller;

import com.medical.exam.common.result.Result;
import com.medical.exam.dto.*;
import com.medical.exam.service.AuthService;
import jakarta.annotation.Resource;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Resource
    private AuthService authService;

    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return Result.success("登录成功", response);
    }

    @PostMapping("/logout")
    public Result<?> logout() {
        return Result.success();
    }

    @PostMapping("/users/add")
    public Result<?> addUser(@Valid @RequestBody UserRequestDTO request) {
        authService.addUser(request);
        return Result.success("用户添加成功");
    }

    @PostMapping("/users/update")
    public Result<?> updateUser(@Valid @RequestBody UserUpdateRequestDTO request) {
        authService.updateUser(request);
        return Result.success("用户更新成功");
    }

    @PostMapping("/users/delete")
    public Result<?> deleteUser(@RequestBody UserUpdateRequestDTO request) {
        authService.deleteUser(request.getId());
        return Result.success("用户删除成功");
    }

    @PostMapping("/users/import")
    public Result<Map<String, Object>> importUsers(@RequestParam("file") MultipartFile file,
                                                   Authentication auth) {
        Map<String, Object> result = authService.importUsers(file, Long.valueOf(auth.getName()));
        return Result.success(result);
    }

    @PostMapping("/users/batch-delete")
    public Result<?> batchDeleteUsers(@RequestBody Map<String, Object> request, Authentication auth) {
        authService.batchDeleteUsers(request);
        return Result.success("批量删除成功");
    }

    @PostMapping("/users/list")
    public Result<?> getUsers(@RequestBody UserQueryDTO userQueryDTO) {
        return Result.success(authService.getUsers(userQueryDTO));
    }

    // 角色管理
    @PostMapping("/roles/add")
    public Result<?> addRole(@RequestBody Map<String, Object> request, Authentication auth) {
        authService.addRole(request, Long.valueOf(auth.getName()));
        return Result.success("角色添加成功");
    }

    @PostMapping("/roles/update")
    public Result<?> updateRole(@RequestBody Map<String, Object> request, Authentication auth) {
        authService.updateRole(request.get("id").toString(), request, Long.valueOf(auth.getName()));
        return Result.success("角色更新成功");
    }

    @PostMapping("/roles/delete")
    public Result<?> deleteRole(@RequestBody Map<String, Object> request, Authentication auth) {
        authService.deleteRole(request.get("id").toString());
        return Result.success("角色删除成功");
    }

    @PostMapping("/roles/list")
    public Result<?> getRoles(@RequestBody RoleQueryDTO request) {
        Map<String, Object> roles = authService.getRoles(
                request.getStatus(),
                request.getKeyword(),
                request.getPageNum(),
                request.getPageSize()
        );
        return Result.success(roles);
    }
}
