package com.medical.exam.controller;

import com.medical.exam.common.result.Result;
import com.medical.exam.dto.*;
import com.medical.exam.service.AdminService;
import com.medical.exam.service.AuthService;
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
    @Autowired
    private AuthService authService;

    // 考试结果管理
    @PostMapping("/exam-results")
    public Result<?> getExamResults(@RequestBody ExamResultQueryDTO request) {
        Map<String, Object> results = adminService.getExamResults(
            request.getCategory(),
            request.getStatus(),
            request.getKeyword(),
            request.getPageNum(),
            request.getPageSize()
        );
        return Result.success(results);
    }

    @GetMapping("/exam-results/{id}")
    public Result<?> getExamResultDetail(@PathVariable String id, Authentication auth) {
        Map<String, Object> result = adminService.getExamResultDetail(id);
        return Result.success(result);
    }

    @PostMapping("/exam-results/{id}/retake")
    public Result<?> arrangeRetakeExam(@PathVariable String id, Authentication auth) {
        adminService.arrangeRetakeExam(id, Long.valueOf(auth.getName()));
        return Result.success("重新考试安排成功");
    }

    @PostMapping("/exam-results/batch-retake")
    public Result<?> batchArrangeRetakeExam(@RequestBody Map<String, Object> request, Authentication auth) {
        adminService.batchArrangeRetakeExam(request, Long.valueOf(auth.getName()));
        return Result.success("批量重新考试安排成功");
    }

    // 题目管理
    @PostMapping("/questions/add")
    public Result<?> addQuestion(@Valid @RequestBody Map<String, Object> request, Authentication auth) {
        adminService.addQuestion(request, Long.valueOf(auth.getName()));
        return Result.success("题目添加成功");
    }

    @PostMapping("/questions/update")
    public Result<?> updateQuestion(@RequestBody Map<String, Object> request, Authentication auth) {
        adminService.updateQuestion(request.get("id").toString(), request, Long.valueOf(auth.getName()));
        return Result.success("题目更新成功");
    }

    @PostMapping("/questions/delete")
    public Result<?> deleteQuestion(@RequestBody Map<String, Object> request, Authentication auth) {
        adminService.deleteQuestion(request.get("id").toString());
        return Result.success("题目删除成功");
    }

    @PostMapping("/questions/import")
    public Result<Map<String, Object>> importQuestions(@RequestParam("file") MultipartFile file, 
                                                      Authentication auth) {
        Map<String, Object> result = adminService.importQuestions(file, Long.valueOf(auth.getName()));
        return Result.success(result);
    }

    @PostMapping("/questions/batch-delete")
    public Result<?> batchDeleteQuestions(@RequestBody Map<String, Object> request, Authentication auth) {
        adminService.batchDeleteQuestions(request);
        return Result.success("批量删除成功");
    }


    // 科室/分类管理
    @PostMapping("/departments")
    public Result<?> addDepartment(@RequestBody Map<String, Object> request, 
                                     Authentication auth) {
        adminService.addDepartment(request, Long.valueOf(auth.getName()));
        return Result.success("科室添加成功");
    }

    @PostMapping("/categories")
    public Result<?> addCategory(@RequestBody Map<String, Object> request, 
                                   Authentication auth) {
        adminService.addCategory(request, Long.valueOf(auth.getName()));
        return Result.success("分类添加成功");
    }

    @PostMapping("/departments/list")
    public Result<List<Map<String, Object>>> getDepartments(@RequestBody DepartmentQueryDTO request) {
        List<Map<String, Object>> departments = adminService.getDepartments(request);
        return Result.success(departments);
    }

    // 考试配置管理
    @PostMapping("/exam-configs/add")
    public Result<?> addExamConfig(@RequestBody Map<String, Object> request, Authentication auth) {
        adminService.addExamConfig(request, Long.valueOf(auth.getName()));
        return Result.success("考试配置添加成功");
    }

    @PostMapping("/exam-configs/update")
    public Result<?> updateExamConfig(@RequestBody Map<String, Object> request, Authentication auth) {
        adminService.updateExamConfig(request.get("id").toString(), request, Long.valueOf(auth.getName()));
        return Result.success("考试配置更新成功");
    }

    @PostMapping("/exam-configs/delete")
    public Result<?> deleteExamConfig(@RequestBody Map<String, Object> request, Authentication auth) {
        adminService.deleteExamConfig(request.get("id").toString());
        return Result.success("考试配置删除成功");
    }

    // 试卷生成和管理
    @PostMapping("/generate-paper")
    public Result<Map<String, Object>> generateExamPaper(@RequestBody Map<String, Object> request, 
                                                         Authentication auth) {
        Map<String, Object> paper = adminService.generateExamPaper(request, Long.valueOf(auth.getName()));
        return Result.success("试卷生成成功", paper);
    }

    @PostMapping("/generated-papers/list")
    public Result<Map<String, Object>> getGeneratedPapers(@RequestBody ExamPaperQueryDTO request) {
        Map<String, Object> papers = adminService.getGeneratedPapers(
            request.getCategory(),
            request.getStatus(),
            request.getPageNum(),
            request.getPageSize()
        );
        return Result.success(papers);
    }

    @PostMapping("/generated-papers/{id}")
    public Result<Map<String, Object>> getGeneratedPaperDetail(@PathVariable String id, Authentication auth) {
        Map<String, Object> paper = adminService.getGeneratedPaperDetail(id);
        return Result.success(paper);
    }

    @PostMapping("/generated-papers/delete")
    public Result<?> deleteGeneratedPaper(@RequestBody Map<String, Object> request, Authentication auth) {
        adminService.deleteGeneratedPaper(request.get("id").toString());
        return Result.success("试卷删除成功");
    }

    @PostMapping("/generated-papers/{id}/questions/{questionId}/replace")
    public Result<Map<String, Object>> replaceQuestion(@PathVariable String id,
                                                       @PathVariable String questionId,
                                                       @RequestBody Map<String, Object> request,
                                                       Authentication auth) {
        Map<String, Object> result = adminService.replaceQuestion(id, questionId, request, Long.valueOf(auth.getName()));
        return Result.success("题目替换成功", result);
    }

    @PostMapping("/available-questions/list")
    public Result<Map<String, Object>> getAvailableQuestions(@RequestBody AvailableQuestionQueryDTO request) {
        Map<String, Object> questions = adminService.getAvailableQuestions(
            request.getCategory(),
            request.getType(),
            request.getDifficulty(),
            request.getExcludeIds(),
            request.getPageNum(),
            request.getPageSize()
        );
        return Result.success(questions);
    }

    // 统计分析
    @PostMapping("/statistics/dashboard")
    public Result<Map<String, Object>> getDashboardStatistics(Authentication auth) {
        Map<String, Object> statistics = adminService.getDashboardStatistics();
        return Result.success(statistics);
    }

    @PostMapping("/statistics/exam-trends")
    public Result<Map<String, Object>> getExamTrends(@RequestBody Map<String, Object> request) {
        String startDate = (String) request.get("startDate");
        String endDate = (String) request.get("endDate");
        Map<String, Object> trends = adminService.getExamTrends(startDate, endDate);
        return Result.success(trends);
    }

    @PostMapping("/statistics/category-performance")
    public Result<Map<String, Object>> getCategoryPerformance(Authentication auth) {
        Map<String, Object> performance = adminService.getCategoryPerformance();
        return Result.success(performance);
    }
}

