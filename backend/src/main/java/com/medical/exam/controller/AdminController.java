
package com.medical.exam.controller;

import com.medical.exam.common.result.Result;
import com.medical.exam.dto.UserCreateRequest;
import com.medical.exam.dto.UserUpdateRequest;
import com.medical.exam.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/exam-results")
    public Result<List<Map<String, Object>>> getExamResults(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            Authentication auth) {
        List<Map<String, Object>> results = adminService.getExamResults(category, status, keyword, page, size);
        return Result.success(results);
    }

    @GetMapping("/questions")
    public Result<List<Map<String, Object>>> getQuestions(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            Authentication auth) {
        List<Map<String, Object>> questions = adminService.getQuestions(category, difficulty, keyword, page, size);
        return Result.success(questions);
    }

    @PostMapping("/questions")
    public Result<Void> addQuestion(@Valid @RequestBody Map<String, Object> request, 
                                   Authentication auth) {
        adminService.addQuestion(request, Long.valueOf(auth.getName()));
        return Result.success("题目添加成功");
    }

    @PutMapping("/questions/{id}")
    public Result<Void> updateQuestion(@PathVariable String id, 
                                      @Valid @RequestBody Map<String, Object> request,
                                      Authentication auth) {
        adminService.updateQuestion(id, request, Long.valueOf(auth.getName()));
        return Result.success("题目更新成功");
    }

    @DeleteMapping("/questions/{id}")
    public Result<Void> deleteQuestion(@PathVariable String id, Authentication auth) {
        adminService.deleteQuestion(id);
        return Result.success("题目删除成功");
    }

    @GetMapping("/users")
    public Result<List<Map<String, Object>>> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            Authentication auth) {
        List<Map<String, Object>> users = adminService.getUsers(role, department, keyword, page, size);
        return Result.success(users);
    }

    @PostMapping("/users")
    public Result<Void> addUser(@Valid @RequestBody UserCreateRequest request, 
                               Authentication auth) {
        adminService.addUser(request, Long.valueOf(auth.getName()));
        return Result.success("用户添加成功");
    }

    @PutMapping("/users/{id}")
    public Result<Void> updateUser(@PathVariable String id, 
                                  @Valid @RequestBody UserUpdateRequest request,
                                  Authentication auth) {
        adminService.updateUser(id, request, Long.valueOf(auth.getName()));
        return Result.success("用户更新成功");
    }

    @DeleteMapping("/users/{id}")
    public Result<Void> deleteUser(@PathVariable String id, Authentication auth) {
        adminService.deleteUser(id);
        return Result.success("用户删除成功");
    }

    @GetMapping("/roles")
    public Result<List<Map<String, Object>>> getRoles(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            Authentication auth) {
        List<Map<String, Object>> roles = adminService.getRoles(status, keyword, page, size);
        return Result.success(roles);
    }

    @PostMapping("/roles")
    public Result<Void> addRole(@Valid @RequestBody Map<String, Object> request, 
                               Authentication auth) {
        adminService.addRole(request, Long.valueOf(auth.getName()));
        return Result.success("角色添加成功");
    }

    @PutMapping("/roles/{id}")
    public Result<Void> updateRole(@PathVariable String id, 
                                  @Valid @RequestBody Map<String, Object> request,
                                  Authentication auth) {
        adminService.updateRole(id, request, Long.valueOf(auth.getName()));
        return Result.success("角色更新成功");
    }

    @DeleteMapping("/roles/{id}")
    public Result<Void> deleteRole(@PathVariable String id, Authentication auth) {
        adminService.deleteRole(id);
        return Result.success("角色删除成功");
    }

    @GetMapping("/departments")
    public Result<List<Map<String, Object>>> getDepartments(Authentication auth) {
        List<Map<String, Object>> departments = adminService.getDepartments();
        return Result.success(departments);
    }
}
