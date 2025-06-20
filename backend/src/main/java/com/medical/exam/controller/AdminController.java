
package com.medical.exam.controller;

import com.medical.exam.common.result.Result;
import com.medical.exam.dto.UserCreateRequest;
import com.medical.exam.dto.UserUpdateRequest;
import com.medical.exam.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // Exam results management
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

    @PostMapping("/exam-results/{id}/retake")
    public Result<Void> retakeExam(@PathVariable String id, Authentication auth) {
        adminService.retakeExam(id);
        return Result.success("重新考试安排成功");
    }

    @PostMapping("/exam-results/batch-retake")
    public Result<Void> batchRetakeExam(@RequestBody List<String> resultIds, Authentication auth) {
        adminService.batchRetakeExam(resultIds);
        return Result.success("批量重新考试安排成功");
    }

    // Question management
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

    @PostMapping("/questions/import")
    public Result<Void> importQuestions(@RequestParam("file") MultipartFile file, Authentication auth) {
        adminService.importQuestions(file, Long.valueOf(auth.getName()));
        return Result.success("题目导入成功");
    }

    @PostMapping("/questions/batch-delete")
    public Result<Void> batchDeleteQuestions(@RequestBody List<String> questionIds, Authentication auth) {
        adminService.batchDeleteQuestions(questionIds);
        return Result.success("批量删除成功");
    }

    // User management
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

    @PostMapping("/users/import")
    public Result<Void> importUsers(@RequestParam("file") MultipartFile file, Authentication auth) {
        adminService.importUsers(file, Long.valueOf(auth.getName()));
        return Result.success("用户导入成功");
    }

    @PostMapping("/users/batch-delete")
    public Result<Void> batchDeleteUsers(@RequestBody List<String> userIds, Authentication auth) {
        adminService.batchDeleteUsers(userIds);
        return Result.success("批量删除成功");
    }

    // Role management
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

    // Department and category management
    @GetMapping("/departments")
    public Result<List<Map<String, Object>>> getDepartments(Authentication auth) {
        List<Map<String, Object>> departments = adminService.getDepartments();
        return Result.success(departments);
    }

    @GetMapping("/categories")
    public Result<List<Map<String, Object>>> getCategories(Authentication auth) {
        List<Map<String, Object>> categories = adminService.getCategories();
        return Result.success(categories);
    }

    // Exam configuration
    @GetMapping("/exam-configs")
    public Result<List<Map<String, Object>>> getExamConfigs(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            Authentication auth) {
        List<Map<String, Object>> configs = adminService.getExamConfigs(category, status, page, size);
        return Result.success(configs);
    }

    @PostMapping("/exam-configs")
    public Result<Void> createExamConfig(@Valid @RequestBody Map<String, Object> request, 
                                        Authentication auth) {
        adminService.createExamConfig(request, Long.valueOf(auth.getName()));
        return Result.success("考试配置创建成功");
    }

    @PutMapping("/exam-configs/{id}")
    public Result<Void> updateExamConfig(@PathVariable String id, 
                                        @Valid @RequestBody Map<String, Object> request,
                                        Authentication auth) {
        adminService.updateExamConfig(id, request, Long.valueOf(auth.getName()));
        return Result.success("考试配置更新成功");
    }

    @DeleteMapping("/exam-configs/{id}")
    public Result<Void> deleteExamConfig(@PathVariable String id, Authentication auth) {
        adminService.deleteExamConfig(id);
        return Result.success("考试配置删除成功");
    }

    // Generate exam paper
    @PostMapping("/exam-configs/{id}/generate-paper")
    public Result<Map<String, Object>> generateExamPaper(@PathVariable String id, Authentication auth) {
        Map<String, Object> examPaper = adminService.generateExamPaper(id);
        return Result.success(examPaper);
    }

    // System statistics
    @GetMapping("/statistics/dashboard")
    public Result<Map<String, Object>> getDashboardStatistics(Authentication auth) {
        Map<String, Object> statistics = adminService.getDashboardStatistics();
        return Result.success(statistics);
    }
}
