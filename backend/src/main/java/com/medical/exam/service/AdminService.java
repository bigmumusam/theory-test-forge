
package com.medical.exam.service;

import com.medical.exam.dto.UserCreateRequest;
import com.medical.exam.dto.UserUpdateRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class AdminService {

    // 考试结果管理
    public Map<String, Object> getExamResults(String category, String status, String keyword, Integer page, Integer size) {
        // 模拟分页数据
        List<Map<String, Object>> results = new ArrayList<>();
        
        Map<String, Object> result1 = new HashMap<>();
        result1.put("id", "1");
        result1.put("userName", "张医生");
        result1.put("userId", "110101199001011111");
        result1.put("examName", "消化内科理论考试");
        result1.put("category", "消化内科");
        result1.put("score", 85);
        result1.put("totalScore", 100);
        result1.put("duration", 75);
        result1.put("status", "completed");
        result1.put("startTime", "2024-01-15 10:30:00");
        result1.put("endTime", "2024-01-15 11:45:00");
        results.add(result1);

        Map<String, Object> result2 = new HashMap<>();
        result2.put("id", "2");
        result2.put("userName", "李护士");
        result2.put("userId", "110101199002022222");
        result2.put("examName", "肝胆外科理论考试");
        result2.put("category", "肝胆外科");
        result2.put("score", 78);
        result2.put("totalScore", 100);
        result2.put("duration", 90);
        result2.put("status", "completed");
        result2.put("startTime", "2024-01-15 14:30:00");
        result2.put("endTime", "2024-01-15 16:00:00");
        results.add(result2);

        Map<String, Object> response = new HashMap<>();
        response.put("data", results);
        response.put("total", results.size());
        response.put("page", page);
        response.put("size", size);
        
        return response;
    }

    public Map<String, Object> getExamResultDetail(String id) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", id);
        result.put("userName", "张医生");
        result.put("userId", "110101199001011111");
        result.put("examName", "消化内科理论考试");
        result.put("category", "消化内科");
        result.put("score", 85);
        result.put("totalScore", 100);
        result.put("duration", 75);
        result.put("status", "completed");
        result.put("startTime", "2024-01-15 10:30:00");
        result.put("endTime", "2024-01-15 11:45:00");
        
        // 答题详情
        List<Map<String, Object>> answers = new ArrayList<>();
        Map<String, Object> answer1 = new HashMap<>();
        answer1.put("questionId", "1");
        answer1.put("questionContent", "胃溃疡最常见的并发症是？");
        answer1.put("userAnswer", "1");
        answer1.put("correctAnswer", "1");
        answer1.put("isCorrect", true);
        answer1.put("score", 2);
        answers.add(answer1);
        
        result.put("answers", answers);
        return result;
    }

    public void arrangeRetakeExam(String recordId, Long userId) {
        System.out.println("安排重新考试，记录ID: " + recordId + ", 操作用户: " + userId);
    }

    public void batchArrangeRetakeExam(Map<String, Object> request, Long userId) {
        List<String> recordIds = (List<String>) request.get("recordIds");
        System.out.println("批量安排重新考试，记录数: " + recordIds.size() + ", 操作用户: " + userId);
    }

    // 题目管理
    public Map<String, Object> getQuestions(String category, String difficulty, String keyword, Integer page, Integer size) {
        List<Map<String, Object>> questions = new ArrayList<>();
        
        Map<String, Object> question1 = new HashMap<>();
        question1.put("id", "1");
        question1.put("questionType", "choice");
        question1.put("questionContent", "胃溃疡最常见的并发症是？");
        question1.put("questionOptions", Arrays.asList("穿孔", "出血", "幽门梗阻", "癌变"));
        question1.put("correctAnswer", "1");
        question1.put("category", "消化内科");
        question1.put("difficulty", "medium");
        question1.put("score", 2);
        question1.put("createTime", "2024-01-15 10:00:00");
        questions.add(question1);

        Map<String, Object> response = new HashMap<>();
        response.put("data", questions);
        response.put("total", questions.size());
        response.put("page", page);
        response.put("size", size);
        
        return response;
    }

    public void addQuestion(Map<String, Object> request, Long userId) {
        System.out.println("添加题目: " + request + ", 操作用户: " + userId);
    }

    public void updateQuestion(String id, Map<String, Object> request, Long userId) {
        System.out.println("更新题目ID: " + id + ", 数据: " + request + ", 操作用户: " + userId);
    }

    public void deleteQuestion(String id) {
        System.out.println("删除题目ID: " + id);
    }

    public Map<String, Object> importQuestions(MultipartFile file, Long userId) {
        System.out.println("导入题目文件: " + file.getOriginalFilename() + ", 操作用户: " + userId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("successCount", 10);
        result.put("failCount", 0);
        result.put("total", 10);
        
        return result;
    }

    public void batchDeleteQuestions(Map<String, Object> request) {
        List<String> questionIds = (List<String>) request.get("questionIds");
        System.out.println("批量删除题目，数量: " + questionIds.size());
    }

    // 用户管理
    public Map<String, Object> getUsers(String role, String department, String keyword, Integer page, Integer size) {
        List<Map<String, Object>> users = new ArrayList<>();
        
        Map<String, Object> user1 = new HashMap<>();
        user1.put("id", "1");
        user1.put("name", "管理员");
        user1.put("idNumber", "110101199001011234");
        user1.put("role", "admin");
        user1.put("department", "系统管理");
        user1.put("status", "1");
        user1.put("createTime", "2024-01-15 10:00:00");
        users.add(user1);

        Map<String, Object> user2 = new HashMap<>();
        user2.put("id", "2");
        user2.put("name", "张医生");
        user2.put("idNumber", "110101199001011111");
        user2.put("role", "student");
        user2.put("department", "消化内科");
        user2.put("status", "1");
        user2.put("createTime", "2024-01-15 10:30:00");
        users.add(user2);

        Map<String, Object> response = new HashMap<>();
        response.put("data", users);
        response.put("total", users.size());
        response.put("page", page);
        response.put("size", size);
        
        return response;
    }

    public void addUser(UserCreateRequest request, Long userId) {
        System.out.println("添加用户: " + request.getName() + ", 操作用户: " + userId);
    }

    public void updateUser(String id, UserUpdateRequest request, Long userId) {
        System.out.println("更新用户ID: " + id + ", 姓名: " + request.getName() + ", 操作用户: " + userId);
    }

    public void deleteUser(String id) {
        System.out.println("删除用户ID: " + id);
    }

    public Map<String, Object> importUsers(MultipartFile file, Long userId) {
        System.out.println("导入用户文件: " + file.getOriginalFilename() + ", 操作用户: " + userId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("successCount", 5);
        result.put("failCount", 0);
        result.put("total", 5);
        
        return result;
    }

    public void batchDeleteUsers(Map<String, Object> request) {
        List<String> userIds = (List<String>) request.get("userIds");
        System.out.println("批量删除用户，数量: " + userIds.size());
    }

    // 角色管理
    public Map<String, Object> getRoles(String status, String keyword, Integer page, Integer size) {
        List<Map<String, Object>> roles = new ArrayList<>();
        
        Map<String, Object> role1 = new HashMap<>();
        role1.put("id", "1");
        role1.put("roleName", "系统管理员");
        role1.put("roleKey", "admin");
        role1.put("roleSort", 1);
        role1.put("status", "1");
        role1.put("remark", "超级管理员，拥有所有权限");
        role1.put("createTime", "2024-01-15 10:00:00");
        roles.add(role1);

        Map<String, Object> role2 = new HashMap<>();
        role2.put("id", "2");
        role2.put("roleName", "普通考生");
        role2.put("roleKey", "student");
        role2.put("roleSort", 2);
        role2.put("status", "1");
        role2.put("remark", "普通考生，只能参加考试");
        role2.put("createTime", "2024-01-15 10:30:00");
        roles.add(role2);

        Map<String, Object> response = new HashMap<>();
        response.put("data", roles);
        response.put("total", roles.size());
        response.put("page", page);
        response.put("size", size);
        
        return response;
    }

    public void addRole(Map<String, Object> request, Long userId) {
        System.out.println("添加角色: " + request + ", 操作用户: " + userId);
    }

    public void updateRole(String id, Map<String, Object> request, Long userId) {
        System.out.println("更新角色ID: " + id + ", 数据: " + request + ", 操作用户: " + userId);
    }

    public void deleteRole(String id) {
        System.out.println("删除角色ID: " + id);
    }

    // 科室/分类管理
    public List<Map<String, Object>> getDepartments() {
        List<Map<String, Object>> departments = new ArrayList<>();
        
        Map<String, Object> dept1 = new HashMap<>();
        dept1.put("id", "1");
        dept1.put("name", "消化内科");
        dept1.put("code", "DEPT_01");
        departments.add(dept1);

        Map<String, Object> dept2 = new HashMap<>();
        dept2.put("id", "2");
        dept2.put("name", "肝胆外科");
        dept2.put("code", "DEPT_02");
        departments.add(dept2);

        return departments;
    }

    public void addDepartment(Map<String, Object> request, Long userId) {
        System.out.println("添加科室: " + request + ", 操作用户: " + userId);
    }

    public List<Map<String, Object>> getCategories() {
        List<Map<String, Object>> categories = new ArrayList<>();
        
        Map<String, Object> cat1 = new HashMap<>();
        cat1.put("id", "1");
        cat1.put("name", "消化内科");
        cat1.put("code", "CAT_01");
        cat1.put("questionCount", 10);
        categories.add(cat1);

        return categories;
    }

    public void addCategory(Map<String, Object> request, Long userId) {
        System.out.println("添加分类: " + request + ", 操作用户: " + userId);
    }

    // 考试配置管理
    public Map<String, Object> getExamConfigs(String category, String status, Integer page, Integer size) {
        List<Map<String, Object>> configs = new ArrayList<>();
        
        Map<String, Object> config1 = new HashMap<>();
        config1.put("id", "1");
        config1.put("examName", "消化内科理论考试");
        config1.put("category", "消化内科");
        config1.put("duration", 30);
        config1.put("totalScore", 100);
        config1.put("passScore", 60);
        config1.put("questionCount", 50);
        config1.put("status", "1");
        configs.add(config1);

        Map<String, Object> response = new HashMap<>();
        response.put("data", configs);
        response.put("total", configs.size());
        response.put("page", page);
        response.put("size", size);
        
        return response;
    }

    public void addExamConfig(Map<String, Object> request, Long userId) {
        System.out.println("添加考试配置: " + request + ", 操作用户: " + userId);
    }

    // 试卷生成
    public Map<String, Object> generateExamPaper(Map<String, Object> request, Long userId) {
        System.out.println("生成试卷: " + request + ", 操作用户: " + userId);
        
        Map<String, Object> paper = new HashMap<>();
        paper.put("id", System.currentTimeMillis());
        paper.put("name", request.get("name"));
        paper.put("category", request.get("category"));
        paper.put("totalQuestions", request.get("choiceCount") + "+" + request.get("judgmentCount"));
        paper.put("totalScore", "100");
        paper.put("duration", request.get("duration"));
        paper.put("generateTime", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        
        return paper;
    }

    public Map<String, Object> getGeneratedPapers(Integer page, Integer size) {
        List<Map<String, Object>> papers = new ArrayList<>();
        
        Map<String, Object> paper1 = new HashMap<>();
        paper1.put("id", "1");
        paper1.put("name", "消化内科理论考试");
        paper1.put("category", "消化内科");
        paper1.put("questionCount", 50);
        paper1.put("totalScore", 100);
        paper1.put("generateTime", "2024-01-15 10:00:00");
        papers.add(paper1);

        Map<String, Object> response = new HashMap<>();
        response.put("data", papers);
        response.put("total", papers.size());
        response.put("page", page);
        response.put("size", size);
        
        return response;
    }

    // 统计分析
    public Map<String, Object> getDashboardStatistics() {
        Map<String, Object> statistics = new HashMap<>();
        
        statistics.put("totalUsers", 125);
        statistics.put("totalQuestions", 1200);
        statistics.put("totalExams", 450);
        statistics.put("todayExams", 15);
        statistics.put("passRate", 85.5);
        statistics.put("avgScore", 78.2);
        
        // 最近考试趋势
        List<Map<String, Object>> examTrends = new ArrayList<>();
        for (int i = 7; i >= 0; i--) {
            Map<String, Object> trend = new HashMap<>();
            trend.put("date", LocalDateTime.now().minusDays(i).format(DateTimeFormatter.ofPattern("MM-dd")));
            trend.put("count", (int)(Math.random() * 20) + 5);
            examTrends.add(trend);
        }
        statistics.put("examTrends", examTrends);
        
        return statistics;
    }

    public Map<String, Object> getExamTrends(String startDate, String endDate) {
        Map<String, Object> trends = new HashMap<>();
        
        List<Map<String, Object>> data = new ArrayList<>();
        for (int i = 30; i >= 0; i--) {
            Map<String, Object> item = new HashMap<>();
            item.put("date", LocalDateTime.now().minusDays(i).format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            item.put("examCount", (int)(Math.random() * 50) + 10);
            item.put("passCount", (int)(Math.random() * 40) + 8);
            data.add(item);
        }
        
        trends.put("data", data);
        return trends;
    }

    public Map<String, Object> getCategoryPerformance() {
        Map<String, Object> performance = new HashMap<>();
        
        List<Map<String, Object>> data = new ArrayList<>();
        String[] categories = {"消化内科", "肝胆外科", "心血管内科", "呼吸内科"};
        
        for (String category : categories) {
            Map<String, Object> item = new HashMap<>();
            item.put("category", category);
            item.put("examCount", (int)(Math.random() * 100) + 50);
            item.put("avgScore", Math.round((Math.random() * 30 + 60) * 10) / 10.0);
            item.put("passRate", Math.round((Math.random() * 20 + 70) * 10) / 10.0);
            data.add(item);
        }
        
        performance.put("data", data);
        return performance;
    }
}
