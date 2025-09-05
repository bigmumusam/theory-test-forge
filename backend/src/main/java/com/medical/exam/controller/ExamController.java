package com.medical.exam.controller;

import com.medical.exam.common.result.Result;
import com.medical.exam.dto.*;
import com.medical.exam.entity.ExamRecord;
import com.medical.exam.service.ExamService;
import com.medical.exam.service.AdminService;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/exam")
public class ExamController {

    @Resource
    private ExamService examService;

    @Resource
    private AdminService adminService;

    // 考试结果管理

    @PostMapping("/exam-summary")
    public Result<?> getExamResultsSummary() {
        return Result.success(adminService.getExamResultsSummary());
    }
    @PostMapping("/exam-results")
    public Result<?> getExamResults(@RequestBody ExamResultQueryDTO request) {
        return Result.success(adminService.getExamResults(request));
    }

    @PostMapping("/exam-results/getDetail")
    public Result<?> getExamResultDetail(@RequestBody Map<String, Object> request) {
        String recordId = request.get("recordId").toString();
        return Result.success(adminService.getExamResultDetail(recordId));
    }

    @PostMapping("/exam-results/batch-retake")
    public Result<?> batchArrangeRetakeExam(@RequestBody Map<String, Object> request) {
        adminService.batchArrangeRetakeExam(request);
        return Result.success("批量重新考试安排成功");
    }

    @PostMapping("/exam-results/export")
    public void exportExamResults(@RequestBody ExamResultQueryDTO request, HttpServletResponse response) {
        adminService.exportExamResults(request, response);
    }

    @PostMapping("/start")
    public Result<?> startExam(@RequestBody StartExamDTO request) {
        String recordId = examService.startExam(request);
        return Result.success("考试开始", Map.of("recordId", recordId));
    }

    @PostMapping("/submit")
    public Result<?> submitExam(@Valid @RequestBody SubmitExamRequest request) {
        Map<String, Object> result = examService.submitExam(request);
        return Result.success("考试提交成功", result);
    }
}
