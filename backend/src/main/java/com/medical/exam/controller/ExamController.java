package com.medical.exam.controller;

import com.medical.exam.common.result.Result;
import com.medical.exam.dto.ExamPaperRequest;
import com.medical.exam.dto.ExamPaperResponse;
import com.medical.exam.dto.SubmitExamRequest;
import com.medical.exam.service.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/exam")
public class ExamController {

    @Autowired
    private ExamService examService;

    @PostMapping("/available")
    public Result<List<ExamPaperResponse>> getAvailableExams(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        List<ExamPaperResponse> exams = examService.getAvailableExams(userId);
        return Result.success(exams);
    }

    @PostMapping("/start")
    public Result<ExamPaperResponse> startExam(@Valid @RequestBody ExamPaperRequest request, 
                                               Authentication auth) {
        ExamPaperResponse response = examService.startExam(request, Long.valueOf(auth.getName()));
        return Result.success("考试开始", response);
    }

    @PostMapping("/submit")
    public Result<?> submitExam(@Valid @RequestBody SubmitExamRequest request, 
                                   Authentication auth) {
        examService.submitExam(request, Long.valueOf(auth.getName()));
        return Result.success("考试提交成功");
    }
}
