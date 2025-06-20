
package com.medical.exam.service;

import com.medical.exam.dto.ExamPaperRequest;
import com.medical.exam.dto.ExamPaperResponse;
import com.medical.exam.dto.SubmitExamRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class ExamService {

    public List<ExamPaperResponse> getAvailableExams(Long userId) {
        // 模拟数据，实际应该从数据库查询
        List<ExamPaperResponse> exams = new ArrayList<>();
        
        ExamPaperResponse exam1 = new ExamPaperResponse();
        exam1.setId("digestive-exam");
        exam1.setName("消化内科理论考试");
        exam1.setCategory("消化内科");
        exam1.setDescription("涵盖消化系统疾病的诊断、治疗和护理知识");
        exam1.setDuration(30);
        exam1.setQuestionCount(4);
        exam1.setTotalScore(6);
        exam1.setDifficulty("中等");
        exam1.setAvailable(true);
        exams.add(exam1);

        ExamPaperResponse exam2 = new ExamPaperResponse();
        exam2.setId("hepatobiliary-exam");
        exam2.setName("肝胆外科理论考试");
        exam2.setCategory("肝胆外科");
        exam2.setDescription("肝胆外科手术及护理相关知识");
        exam2.setDuration(45);
        exam2.setQuestionCount(6);
        exam2.setTotalScore(10);
        exam2.setDifficulty("困难");
        exam2.setAvailable(true);
        exams.add(exam2);

        return exams;
    }

    public ExamPaperResponse startExam(ExamPaperRequest request, Long userId) {
        // 创建考试记录
        String recordId = String.valueOf(System.currentTimeMillis());
        
        ExamPaperResponse response = new ExamPaperResponse();
        response.setRecordId(recordId);
        response.setExamName("消化内科理论考试");
        response.setDuration(30);
        response.setTotalScore(6);
        response.setStartTime(LocalDateTime.now());

        // 生成考试题目
        List<ExamPaperResponse.QuestionDto> questions = new ArrayList<>();
        
        ExamPaperResponse.QuestionDto question1 = new ExamPaperResponse.QuestionDto();
        question1.setId("1");
        question1.setType("choice");
        question1.setContent("胃溃疡最常见的并发症是？");
        question1.setOptions(Arrays.asList("穿孔", "出血", "幽门梗阻", "癌变"));
        question1.setScore(2);
        questions.add(question1);

        ExamPaperResponse.QuestionDto question2 = new ExamPaperResponse.QuestionDto();
        question2.setId("2");
        question2.setType("judgment");
        question2.setContent("Hp感染是胃溃疡的主要病因之一");
        question2.setScore(2);
        questions.add(question2);

        response.setQuestions(questions);
        
        return response;
    }

    public void submitExam(SubmitExamRequest request, Long userId) {
        // 计算成绩并保存答题记录
        // 实际实现中需要：
        // 1. 验证考试记录是否存在且属于当前用户
        // 2. 计算每题得分
        // 3. 更新考试记录状态和总分
        // 4. 保存答题详情
        
        System.out.println("考试提交成功，记录ID: " + request.getRecordId());
    }
}
