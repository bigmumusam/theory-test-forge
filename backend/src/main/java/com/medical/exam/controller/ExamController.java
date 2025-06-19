
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

@RestController
@RequestMapping("/exam")
public class ExamController {

    @Autowired
    private ExamService examService;

    @GetMapping("/available")
    public Result<List<ExamPaperResponse>> getAvailableExams(Authentication auth) {
        List<ExamPaperResponse> exams = examService.getAvailableExams(Long.valueOf(auth.getName()));
        return Result.success(exams);
    }

    @PostMapping("/start")
    public Result<ExamPaperResponse> startExam(@Valid @RequestBody ExamPaperRequest request, 
                                               Authentication auth) {
        ExamPaperResponse response = examService.startExam(request, Long.valueOf(auth.getName()));
        return Result.success("考试开始", response);
    }

    @PostMapping("/submit")
    public Result<Void> submitExam(@Valid @RequestBody SubmitExamRequest request, 
                                   Authentication auth) {
        examService.submitExam(request, Long.valueOf(auth.getName()));
        return Result.success("考试提交成功");
    }
}
