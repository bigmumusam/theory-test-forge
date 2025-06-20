
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
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // 考试结果管理
    @GetMapping("/exam-results")
    public Result<Map<String, Object>> getExamResults(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            Authentication auth) {
        Map<String, Object> results = adminService.getExamResults(category, status, keyword, page, size);
        return Result.success(results);
    }

    @GetMapping("/exam-results/{id}")
    public Result<Map<String, Object>> getExamResultDetail(@PathVariable String id, Authentication auth) {
        Map<String, Object> result = adminService.getExamResultDetail(id);
        return Result.success(result);
    }

    @PostMapping("/exam-results/{id}/retake")
    public Result<Void> arrangeRetakeExam(@PathVariable String id, Authentication auth) {
        adminService.arrangeRetakeExam(id, Long.valueOf(auth.getName()));
        return Result.success("重新考试安排成功");
    }

    @PostMapping("/exam-results/batch-retake")
    public Result<Void> batchArrangeRetakeExam(@RequestBody Map<String, Object> request, Authentication auth) {
        adminService.batchArrangeRetakeExam(request, Long.valueOf(auth.getName()));
        return Result.success("批量重新考试安排成功");
    }

    // 题目管理
    @GetMapping("/questions")
    public Result<Map<String, Object>> getQuestions(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            Authentication auth) {
        Map<String, Object> questions = adminService.getQuestions(category, difficulty, keyword, page, size);
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
    public Result<Map<String, Object>> importQuestions(@RequestParam("file") MultipartFile file, 
                                                      Authentication auth) {
        Map<String, Object> result = adminService.importQuestions(file, Long.valueOf(auth.getName()));
        return Result.success(result);
    }

    @PostMapping("/questions/batch-delete")
    public Result<Void> batchDeleteQuestions(@RequestBody Map<String, Object> request, Authentication auth) {
        adminService.batchDeleteQuestions(request);
        return Result.success("批量删除成功");
    }

    // 用户管理
    @GetMapping("/users")
    public Result<Map<String, Object>> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            Authentication auth) {
        Map<String, Object> users = adminService.getUsers(role, department, keyword, page, size);
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
    public Result<Map<String, Object>> importUsers(@RequestParam("file") MultipartFile file, 
                                                   Authentication auth) {
        Map<String, Object> result = adminService.importUsers(file, Long.valueOf(auth.getName()));
        return Result.success(result);
    }

    @PostMapping("/users/batch-delete")
    public Result<Void> batchDeleteUsers(@RequestBody Map<String, Object> request, Authentication auth) {
        adminService.batchDeleteUsers(request);
        return Result.success("批量删除成功");
    }

    // 角色管理
    @GetMapping("/roles")
    public Result<Map<String, Object>> getRoles(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            Authentication auth) {
        Map<String, Object> roles = adminService.getRoles(status, keyword, page, size);
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

    // 科室/分类管理
    @GetMapping("/departments")
    public Result<List<Map<String, Object>>> getDepartments(Authentication auth) {
        List<Map<String, Object>> departments = adminService.getDepartments();
        return Result.success(departments);
    }

    @PostMapping("/departments")
    public Result<Void> addDepartment(@Valid @RequestBody Map<String, Object> request, 
                                     Authentication auth) {
        adminService.addDepartment(request, Long.valueOf(auth.getName()));
        return Result.success("科室添加成功");
    }

    @GetMapping("/categories")
    public Result<List<Map<String, Object>>> getCategories(Authentication auth) {
        List<Map<String, Object>> categories = adminService.getCategories();
        return Result.success(categories);
    }

    @PostMapping("/categories")
    public Result<Void> addCategory(@Valid @RequestBody Map<String, Object> request, 
                                   Authentication auth) {
        adminService.addCategory(request, Long.valueOf(auth.getName()));
        return Result.success("分类添加成功");
    }

    // 考试配置管理
    @GetMapping("/exam-configs")
    public Result<Map<String, Object>> getExamConfigs(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            Authentication auth) {
        Map<String, Object> configs = adminService.getExamConfigs(category, status, page, size);
        return Result.success(configs);
    }

    @PostMapping("/exam-configs")
    public Result<Void> addExamConfig(@Valid @RequestBody Map<String, Object> request, 
                                     Authentication auth) {
        adminService.addExamConfig(request, Long.valueOf(auth.getName()));
        return Result.success("考试配置添加成功");
    }

    // 试卷生成
    @PostMapping("/generate-paper")
    public Result<Map<String, Object>> generateExamPaper(@Valid @RequestBody Map<String, Object> request, 
                                                         Authentication auth) {
        Map<String, Object> paper = adminService.generateExamPaper(request, Long.valueOf(auth.getName()));
        return Result.success(paper);
    }

    @GetMapping("/generated-papers")
    public Result<Map<String, Object>> getGeneratedPapers(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            Authentication auth) {
        Map<String, Object> papers = adminService.getGeneratedPapers(page, size);
        return Result.success(papers);
    }

    // 统计分析
    @GetMapping("/statistics/dashboard")
    public Result<Map<String, Object>> getDashboardStatistics(Authentication auth) {
        Map<String, Object> statistics = adminService.getDashboardStatistics();
        return Result.success(statistics);
    }

    @GetMapping("/statistics/exam-trends")
    public Result<Map<String, Object>> getExamTrends(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            Authentication auth) {
        Map<String, Object> trends = adminService.getExamTrends(startDate, endDate);
        return Result.success(trends);
    }

    @GetMapping("/statistics/category-performance")
    public Result<Map<String, Object>> getCategoryPerformance(Authentication auth) {
        Map<String, Object> performance = adminService.getCategoryPerformance();
        return Result.success(performance);
    }
}
