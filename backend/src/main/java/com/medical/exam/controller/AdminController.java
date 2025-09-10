package com.medical.exam.controller;

import com.medical.exam.common.result.Result;
import com.medical.exam.dto.*;
import com.medical.exam.service.AdminService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Resource
    private AdminService adminService;

    @GetMapping("test")
    public Result<?> test(){
        return Result.success("Hello World");
    }

    //获取下拉列表
    @PostMapping("/options")
    public Result<?> getOptions() {
        return Result.success(adminService.getOptions());
    }


    // 题目管理
    @PostMapping("/questions/add")
    public Result<?> addQuestion(@Valid @RequestBody QuestionDTO request) {
        adminService.addQuestion(request);
        return Result.success("题目添加成功");
    }

    @PostMapping("/questions/update")
    public Result<?> updateQuestion(@Valid @RequestBody QuestionDTO request) {
        adminService.updateQuestion(request);
        return Result.success("题目更新成功");
    }

    @PostMapping("/questions/delete")
    public Result<?> deleteQuestion(@RequestBody Map<String, Object> request) {
        adminService.deleteQuestion(request.get("id").toString());
        return Result.success("题目删除成功");
    }

    @PostMapping("/questions/batchDelete")
    public Result<?> batchDeleteQuestions(@RequestBody Map<String, Object> request) {
        adminService.batchDeleteQuestions(request);
        return Result.success("批量删除成功");
    }

    @PostMapping("/questions/import")
    public Result<?> importQuestions(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error("请选择文件上传");
        }
        // 验证文件类型
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null ||
                (!originalFilename.endsWith(".xls") && !originalFilename.endsWith(".xlsx"))) {
            return Result.error("仅支持Excel文件(.xls, .xlsx)");
        }
        return Result.success(adminService.importQuestions(file));
    }

    @PostMapping("/questions/import-new")
    public Result<?> importQuestionsNew(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error("请选择文件上传");
        }
        // 验证文件类型
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null ||
                (!originalFilename.endsWith(".xls") && !originalFilename.endsWith(".xlsx"))) {
            return Result.error("仅支持Excel文件(.xls, .xlsx)");
        }
        return Result.success(adminService.importQuestionsNew(file));
    }

    //查询题目
    @PostMapping("/questions/list")
    public Result<?> getQuestions(@RequestBody QuestionQueryDTO request) {
        return Result.success(adminService.getQuestions(request));
    }

    //添加题目分类
    @PostMapping("/categories/add")
    public Result<?> addCategory(@RequestBody CategoryDTO request) {
        adminService.addCategory(request);
        return Result.success("题目分类添加成功");
    }

    @PostMapping("/categories/update")
    public Result<?> updateCategory(@RequestBody CategoryDTO request) {
        adminService.updateCategory(request);
        return Result.success("题目分类更新成功");
    }

    @PostMapping("/categories/get-questions")
    public Result<?> getQuestionsByCategoryId(@RequestBody CategoryDTO request) {
        return Result.success(adminService.getQuestionsByCategoryId(request.getCategoryId()));
    }

    //查询题目分类列表
    @PostMapping("/categories")
    public Result<?> getCategories(@RequestBody CategoryQueryDTO categoryQueryDTO) {
        return Result.success(adminService.getCategories(categoryQueryDTO));
    }

    //查询题目分类树形结构
    @PostMapping("/categories/tree")
    public Result<?> getCategoriesTree() {
        return Result.success(adminService.getCategoriesTree());
    }

    @PostMapping("/departments/add")
    public Result<?> addDepartment(@RequestBody DepartmentDTO request) {
        adminService.addDepartment(request);
        return Result.success("科室添加成功");
    }

    //获取部门
    @PostMapping("/departments/list")
    public Result<?> getDepartments(@RequestBody DepartmentQueryDTO request) {
        return Result.success(adminService.getDepartments(request));
    }

    // 考试配置管理

    @PostMapping("/exam-configs")
    public Result<?> getExamConfigs(@RequestBody ExamConfigDTO request) {
        return Result.success(adminService.getExamConfigs(request));
    }

    @PostMapping("/exam-configs/add")
    public Result<?> addExamConfig(@RequestBody ExamConfigDTO request) {
        adminService.addExamConfig(request);
        return Result.success("考试配置添加成功");
    }

    @PostMapping("/exam-configs/update")
    public Result<?> updateExamConfig(@RequestBody ExamConfigDTO request) {
        adminService.updateExamConfig(request);
        return Result.success("考试配置更新成功");
    }

    @PostMapping("/exam-configs/delete")
    public Result<?> deleteExamConfig(@RequestBody Map<String, Object> request) {
        adminService.deleteExamConfig(request.get("id").toString());
        return Result.success("考试配置删除成功");
    }

    // 试卷生成和管理
    @PostMapping("/generate-paper")
    public Result<?> generateExamPaper(@RequestBody ExamPaperDTO request) {
         adminService.generateExamPaper(request);
        return Result.success("试卷生成成功");
    }

    //根据题目分类获取所有题目不分页
    @PostMapping("/questions/listWithCategoryId")
    public Result<?> getQuestions(@RequestBody CategoryDTO request) {
        return Result.success(adminService.getQuestionsWithCategoryId(request.getCategoryId()));
    }

    //试卷列表
    @PostMapping("/generated-papers/list")
    public Result<?> getGeneratedPapers(@RequestBody ExamPaperQueryDTO request) {
       return Result.success(adminService.getGeneratedPapers(request));
    }

    @PostMapping("/generated-papers/findQuestionsById")
    public Result<?> getGeneratedPaperDetail(@RequestBody ExamPaperDTO request) {
        return Result.success(adminService.getGeneratedPaperDetail(request.getPaperId()));
    }

    @PostMapping("/generated-papers/update")
    public Result<?> updateGeneratedPaper(@RequestBody ExamPaperDTO request) {
        adminService.updateGeneratedPaper(request);
        return Result.success("试卷更新成功");
    }

    @PostMapping("/generated-papers/delete")
    public Result<?> deleteGeneratedPaper(@RequestBody Map<String, Object> request) {
        adminService.deleteExamPaper(request.get("paperId").toString());
        return Result.success("试卷删除成功");
    }

    // 设置特定用户的试卷强制重考标识（完成后自动复位）
    @PostMapping("/generated-papers/set-force-retake")
    public Result<?> setForceRetake(@RequestBody Map<String, Object> request) {
        String userId = (String) request.get("userId");
        String paperId = (String) request.get("paperId");
        adminService.setForceRetake(userId, paperId);
        return Result.success("已设置用户强制重考，学生完成考试后自动复位");
    }

    //查询出所有的考试
    @PostMapping("/available-questions/list")
    public Result<?> getAvailableQuestions(@RequestBody AvailablePaperQueryDTO request) {
        return Result.success(adminService.getAvailablePapers(request));
    }

    //根据试卷id 找出所有题目
    @PostMapping("/getQuestionsByPaperId")
    public Result<?> getQuestionsByPaperId(@RequestBody Map<String, Object> request) {
        String paperId = (String) request.get("paperId");
        return Result.success(adminService.getQuestionsByPaperId(paperId));
    }

    // 统计分析
    @PostMapping("/statistics/dashboard")
    public Result<?> getDashboardStatistics() {
        return Result.success(adminService.getDashboardStatistics());
    }

    @PostMapping("/statistics/exam-trends")
    public Result<Map<String, Object>> getExamTrends(@RequestBody Map<String, Object> request) {
        String startDate = (String) request.get("startDate");
        String endDate = (String) request.get("endDate");
        Map<String, Object> trends = adminService.getExamTrends(startDate, endDate);
        return Result.success(trends);
    }

    @PostMapping("/statistics/category-performance")
    public Result<Map<String, Object>> getCategoryPerformance() {
        Map<String, Object> performance = adminService.getCategoryPerformance();
        return Result.success(performance);
    }

    // 获取试卷考试情况统计
    @PostMapping("/paper-exam-status")
    public Result<?> getPaperExamStatus(@RequestBody Map<String, Object> request) {
        String paperId = request.get("paperId").toString();
        return Result.success(adminService.getPaperExamStatus(paperId));
    }

    // 获取试卷考试详细情况
    @PostMapping("/paper-exam-detail")
    public Result<?> getPaperExamDetail(@RequestBody Map<String, Object> request) {
        String paperId = request.get("paperId").toString();
        return Result.success(adminService.getPaperExamDetail(paperId));
    }

    // 导出试卷人员列表
    @PostMapping("/paper-personnel-export")
    public void exportPaperPersonnelList(@RequestBody Map<String, Object> request, jakarta.servlet.http.HttpServletResponse response) {
        String paperId = request.get("paperId").toString();
        adminService.exportPaperPersonnelList(paperId, response);
    }
}


