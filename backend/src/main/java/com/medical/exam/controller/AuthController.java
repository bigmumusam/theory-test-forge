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
        authService.deleteUser(request.getUserId());
        return Result.success("用户删除成功");
    }

    @PostMapping("/users/import")
    public Result<?> importUsers(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error("请选择文件上传");
        }
        // 验证文件类型
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null ||
                (!originalFilename.endsWith(".xls") && !originalFilename.endsWith(".xlsx"))) {
            return Result.error("仅支持Excel文件(.xls, .xlsx)");
        }
        return Result.success(authService.importUsers(file));
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
    public Result<?> addRole(@Valid @RequestBody RoleRequestDTO request) {
        authService.addRole(request);
        return Result.success("角色添加成功");
    }

    @PostMapping("/roles/update")
    public Result<?> updateRole(@Valid @RequestBody RoleUpdateRequestDTO request) {
        authService.updateRole(request);
        return Result.success("角色更新成功");
    }

    @PostMapping("/roles/delete")
    public Result<?> deleteRole(@Valid @RequestBody RoleUpdateRequestDTO request) {
        authService.deleteRole(request.getRoleId());
        return Result.success("角色删除成功");
    }

    @PostMapping("/roles/list")
    public Result<?> getRoles(@Valid @RequestBody RoleQueryDTO request) {
        return Result.success(authService.getRoles(request));
    }
}
