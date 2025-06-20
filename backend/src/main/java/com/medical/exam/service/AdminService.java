
package com.medical.exam.service;

import com.medical.exam.dto.UserCreateRequest;
import com.medical.exam.dto.UserUpdateRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class AdminService {

    public List<Map<String, Object>> getExamResults(String category, String status, String keyword, Integer page, Integer size) {
        // 模拟数据
        List<Map<String, Object>> results = new ArrayList<>();
        
        Map<String, Object> result1 = new HashMap<>();
        result1.put("id", "1");
        result1.put("userName", "张医生");
        result1.put("examName", "消化内科理论考试");
        result1.put("category", "消化内科");
        result1.put("score", 85);
        result1.put("totalScore", 100);
        result1.put("status", "completed");
        result1.put("startTime", "2024-01-15 10:30:00");
        result1.put("endTime", "2024-01-15 11:00:00");
        results.add(result1);

        Map<String, Object> result2 = new HashMap<>();
        result2.put("id", "2");
        result2.put("userName", "李护士");
        result2.put("examName", "肝胆外科理论考试");
        result2.put("category", "肝胆外科");
        result2.put("score", 78);
        result2.put("totalScore", 100);
        result2.put("status", "completed");
        result2.put("startTime", "2024-01-15 14:30:00");
        result2.put("endTime", "2024-01-15 15:15:00");
        results.add(result2);

        return results;
    }

    public List<Map<String, Object>> getQuestions(String category, String difficulty, String keyword, Integer page, Integer size) {
        // 模拟数据
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

        return questions;
    }

    public void addQuestion(Map<String, Object> request, Long userId) {
        // 实际实现中保存到数据库
        System.out.println("添加题目: " + request);
    }

    public void updateQuestion(String id, Map<String, Object> request, Long userId) {
        // 实际实现中更新数据库
        System.out.println("更新题目ID: " + id + ", 数据: " + request);
    }

    public void deleteQuestion(String id) {
        // 实际实现中从数据库删除
        System.out.println("删除题目ID: " + id);
    }

    public List<Map<String, Object>> getUsers(String role, String department, String keyword, Integer page, Integer size) {
        // 模拟数据
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

        return users;
    }

    public void addUser(UserCreateRequest request, Long userId) {
        // 实际实现中保存到数据库
        System.out.println("添加用户: " + request.getName());
    }

    public void updateUser(String id, UserUpdateRequest request, Long userId) {
        // 实际实现中更新数据库
        System.out.println("更新用户ID: " + id + ", 姓名: " + request.getName());
    }

    public void deleteUser(String id) {
        // 实际实现中从数据库删除
        System.out.println("删除用户ID: " + id);
    }

    public List<Map<String, Object>> getRoles(String status, String keyword, Integer page, Integer size) {
        // 模拟数据
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

        return roles;
    }

    public void addRole(Map<String, Object> request, Long userId) {
        // 实际实现中保存到数据库
        System.out.println("添加角色: " + request);
    }

    public void updateRole(String id, Map<String, Object> request, Long userId) {
        // 实际实现中更新数据库
        System.out.println("更新角色ID: " + id + ", 数据: " + request);
    }

    public void deleteRole(String id) {
        // 实际实现中从数据库删除
        System.out.println("删除角色ID: " + id);
    }

    public List<Map<String, Object>> getDepartments() {
        // 模拟数据
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
}
