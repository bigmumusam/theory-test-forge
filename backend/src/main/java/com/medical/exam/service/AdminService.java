package com.medical.exam.service;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.bean.copier.CopyOptions;
import cn.hutool.poi.excel.ExcelReader;
import cn.hutool.poi.excel.ExcelUtil;
import com.medical.exam.common.exception.CustomException;
import com.medical.exam.dto.*;
import com.medical.exam.entity.*;
import com.medical.exam.vo.*;
import com.medical.exam.mapper.*;
import com.medical.exam.security.JwtAccessContext;
import com.medical.exam.vo.CustomToken;
import com.medical.exam.vo.ExamCategoryVo;
import com.medical.exam.vo.Options;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.core.row.Db;
import com.mybatisflex.core.row.Row;
import com.mybatisflex.core.row.RowUtil;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import static com.medical.exam.entity.table.ExamAnswerTableDef.EXAM_ANSWER;
import static com.medical.exam.entity.table.ExamCategoryTableDef.EXAM_CATEGORY;
import static com.medical.exam.entity.table.ExamConfigTableDef.EXAM_CONFIG;
import static com.medical.exam.entity.table.ExamPaperTableDef.EXAM_PAPER;
import static com.medical.exam.entity.table.ExamRecordTableDef.EXAM_RECORD;
import static com.medical.exam.entity.table.ExamQuestionTableDef.EXAM_QUESTION;
import static com.medical.exam.entity.table.ExamPaperQuestionTableDef.EXAM_PAPER_QUESTION;
import static com.medical.exam.entity.table.SysDepartmentTableDef.SYS_DEPARTMENT;
import static com.medical.exam.entity.table.SysLogTableDef.SYS_LOG;
import static com.medical.exam.entity.table.SysRoleTableDef.SYS_ROLE;
import static com.medical.exam.entity.table.SysUserTableDef.SYS_USER;
import static com.mybatisflex.core.query.QueryMethods.*;


@Service
@Slf4j
public class AdminService {

    @Resource
    private SysRoleMapper sysRoleMapper;
    @Resource
    private SysDepartmentMapper sysDepartmentMapper;
    @Resource
    private ExamCategoryMapper examCategoryMapper;
    @Resource
    private ExamQuestionMapper examQuestionMapper;
    @Resource
    private ExamConfigMapper examConfigMapper;
    @Resource
    private ExamPaperMapper examPaperMapper;

    @Resource
    private ExamPaperQuestionMapper examPaperQuestionMapper;

    @Resource
    private ExamRecordMapper examRecordMapper;

    @Resource
    private SysLogMapper sysLogMapper;
    @Autowired
    private ExamAnswerMapper examAnswerMapper;
    @Autowired
    private SysUserMapper sysUserMapper;

    // 考试结果管理

    /**
     * select
     * count(record_id),
     * count(distinct (user_id)),
     * avg(score),
     * sum(case when score >= 60 then 1 else 0 end)/count(record_id) as pass_count
     * from exam_record where status='completed';
     * @return
     */
    public ExamResultSummaryVo getExamResultsSummary() {
        String sql = """
                select count(record_id) as examCount,
                 count(distinct (user_id)) as participantCount,
                 avg(score) avgScore,
                 sum(case when score >= 60 then 1 else 0 end)/count(record_id) as pass_count
                 from exam_record where status='completed';
                """;
        Row row = Db.selectOneBySql( sql);
        return RowUtil.toEntity(row, ExamResultSummaryVo.class);
    }

    public Page<ExamResultVo> getExamResults(ExamResultQueryDTO request) {
        // 模拟分页数据
        return examRecordMapper.paginateAs(request.getPageNumber(),request.getPageSize(),
                QueryWrapper.create()
                        .select(EXAM_RECORD.RECORD_ID,SYS_USER.USER_NAME,SYS_USER.DEPARTMENT.as("categoryName"),SYS_USER.ID_NUMBER,EXAM_RECORD.EXAM_NAME
                                ,EXAM_RECORD.END_TIME.as("examDate"),EXAM_RECORD.DURATION,EXAM_RECORD.SCORE,EXAM_RECORD.STATUS,EXAM_RECORD.RETAKE)
                        .leftJoin(SYS_USER).on(SYS_USER.USER_ID.eq(EXAM_RECORD.USER_ID))
                        .leftJoin(EXAM_PAPER).on(EXAM_PAPER.PAPER_ID.eq(EXAM_RECORD.PAPER_ID))
                        .where(SYS_USER.USER_NAME.like(request.getKeyword()).or(SYS_USER.ID_NUMBER.like(request.getKeyword())))
                        .and(EXAM_PAPER.CATEGORY_ID.eq(request.getCategory()))
                        .and(EXAM_RECORD.STATUS.eq(request.getStatus())),
                ExamResultVo.class);
    }

    public  List<ExamDetailVo> getExamResultDetail(String recordId) {
        return   examAnswerMapper.selectListByQueryAs(QueryWrapper.create()
                       .select(EXAM_QUESTION.QUESTION_TYPE, EXAM_QUESTION.QUESTION_CONTENT,EXAM_QUESTION.QUESTION_OPTIONS,
                               EXAM_QUESTION.CORRECT_ANSWER,EXAM_ANSWER.USER_ANSWER,EXAM_ANSWER.IS_CORRECT,
                               EXAM_ANSWER.SCORE)
                .innerJoin(EXAM_QUESTION).on(EXAM_QUESTION.QUESTION_ID.eq(EXAM_ANSWER.QUESTION_ID))
               .where(EXAM_ANSWER.RECORD_ID.eq(recordId)),ExamDetailVo.class);
    }

    public void batchArrangeRetakeExam(Map<String, Object> request) {
        CustomToken customToken = JwtAccessContext.getLoginInfo();
        List<String> recordIds = (List<String>) request.get("recordIds");
        recordIds.forEach(recordId -> {
            examRecordMapper.update(ExamRecord.builder()
                    .recordId(recordId)
                    .retake(1)
                    .build());
        });
    }

    // 题目管理
    public void addQuestion(QuestionDTO request) {
        CustomToken customToken = JwtAccessContext.getLoginInfo();
        examQuestionMapper.insert(ExamQuestion.builder()
            .questionType(request.getQuestionType())
            .questionContent(request.getQuestionContent())
            .questionOptions(request.getQuestionOptions())
            .correctAnswer(request.getCorrectAnswer())
            .categoryId(request.getCategoryId())
            .difficulty(request.getDifficulty())
            .score(request.getScore())
            .status("1")
            .remark(request.getRemark())
            .createBy(customToken.getUserName())
            .build());
    }

    public void updateQuestion(QuestionDTO request) {
        CustomToken customToken = JwtAccessContext.getLoginInfo();
        examQuestionMapper.update(ExamQuestion.builder()
            .questionId(request.getQuestionId())
            .questionType(request.getQuestionType())
            .questionContent(request.getQuestionContent())
            .questionOptions(request.getQuestionOptions())
            .correctAnswer(request.getCorrectAnswer())
            .categoryId(request.getCategoryId())
            .difficulty(request.getDifficulty())
            .score(request.getScore())
            .status(request.getStatus())
            .remark(request.getRemark())
            .updateBy(customToken.getUserName())
            .build());
    }

    public void deleteQuestion(String id) {
        examQuestionMapper.deleteById(id);
    }

    public Page<ExamQuestion> getQuestions(QuestionQueryDTO request) {
        QueryWrapper queryWrapper = QueryWrapper.create()
            .where( EXAM_QUESTION.CATEGORY_ID.eq(request.getCategoryId()))
            .and(EXAM_QUESTION.QUESTION_TYPE.eq(request.getQuestionType()))
            .and(EXAM_QUESTION.DIFFICULTY.eq(request.getDifficulty()))
            .and(EXAM_QUESTION.SCORE.ge(request.getScoreMin()))
            .and(EXAM_QUESTION.SCORE.le(request.getScoreMax()))
            .and(EXAM_QUESTION.QUESTION_CONTENT.like(request.getKeyword()));
        return examQuestionMapper.paginate(request.getPageNumber(), request.getPageSize(), queryWrapper);
    }

    public String importQuestions(MultipartFile file) {
        CustomToken customToken = JwtAccessContext.getLoginInfo();
        List<ExamQuestion> examQuestions = new ArrayList<>();
        try {
            ExcelReader reader = ExcelUtil.getReader(file.getInputStream());
            List<Map<String, Object>> readAll = reader.readAll();
            for (Map<String, Object> row : readAll) {
                Object categoryNameObj = row.get("题目所属分类");
                Object questionTypeObj = row.get("题型");
                Object questionContentObj = row.get("题干");
                Object questionOptionsObj = row.get("选项");
                Object correctAnswerObj = row.get("正确选项");

                if (categoryNameObj == null || questionTypeObj == null || questionContentObj == null || correctAnswerObj == null) {
                    continue; // 忽略该条数据
                }
                String categoryName = categoryNameObj.toString().trim();
                String questionType = questionTypeObj.toString().trim();
                String questionContent = questionContentObj.toString().trim();
//                String questionOptions = questionOptionsObj.toString().trim();
                String correctAnswer = correctAnswerObj.toString().trim();

                //同一个分类下存在一样的题目
                long count =examQuestionMapper.selectCountByQuery(QueryWrapper.create()
                        .innerJoin(EXAM_CATEGORY).on(EXAM_QUESTION.CATEGORY_ID.eq(EXAM_CATEGORY.CATEGORY_ID))
                        .where(EXAM_CATEGORY.CATEGORY_NAME.eq(categoryName))
                        .and(EXAM_QUESTION.QUESTION_CONTENT.eq(questionContent))
                        );
                if (count>0) {
                    log.info("题目:{}已存在",questionContent);
                    continue;
                }
                examQuestions.add(ExamQuestion.builder()
                        .questionType(getQuestionTypeIdByName(questionType))
                        .questionContent(questionContent)
                        .questionOptions(questionOptionsObj==null ? null :"[" + questionOptionsObj + "]")
                        .correctAnswer(correctAnswer)
                        .categoryId(examCategoryMapper.selectOneByQuery(QueryWrapper.create()
                                .where(EXAM_CATEGORY.CATEGORY_NAME.eq(categoryName))).getCategoryId())
                        .score("多选题".equals(questionType) ? 4 : 2)
                        .difficulty("easy")
                        .status("1")
                        .createBy(customToken.getUserName())
                        .score(1).build());
            }
            examQuestionMapper.insertBatch(examQuestions);
        }catch (Exception e){
            log.error("导入题目错误:",e);
            throw new CustomException("导入题目错误:"+e.getMessage());
        }
        String message =  "成功导入题目"+examQuestions.size()+"条";
        sysLogMapper.insert(SysLog.builder()
                .userId(customToken.getUserId())
                .userName(customToken.getUserName())
                .content(message)
                .build());
        return message;
    }

    public void batchDeleteQuestions(Map<String, Object> request) {
        List<String> questionIds = (List<String>) request.get("questionIds");
        if (questionIds != null && !questionIds.isEmpty()) {
            examQuestionMapper.deleteBatchByIds(questionIds);
        }
    }





    // 题目分类/分类管理
    public void addCategory(CategoryDTO request) {
        CustomToken customToken = JwtAccessContext.getLoginInfo();
        examCategoryMapper.insert(ExamCategory.builder()
                        .categoryName(request.getCategoryName())
                        .remark(request.getRemark())
                        .status("1")
                        .createBy(customToken.getUserName())
                .build());
    }

    public void updateCategory(CategoryDTO request) {
        CustomToken customToken = JwtAccessContext.getLoginInfo();
        examCategoryMapper.update(
                ExamCategory.builder()
                        .categoryId(request.getCategoryId())
                        .categoryName(request.getCategoryName())
                        .remark(request.getRemark())
                        .updateBy(customToken.getUserName())
                        .build()
        );
    }

    public Page<ExamCategoryVo> getCategories(CategoryQueryDTO categoryQueryDTO) {
        return examCategoryMapper.paginateAs(categoryQueryDTO.getPageNumber(),categoryQueryDTO.getPageSize(),
                QueryWrapper.create()
                        .select(EXAM_CATEGORY.CATEGORY_ID,EXAM_CATEGORY.CATEGORY_NAME,EXAM_CATEGORY.REMARK,count(EXAM_QUESTION.CATEGORY_ID).as("questionCount"))
                        .leftJoin(EXAM_QUESTION).on(EXAM_CATEGORY.CATEGORY_ID.eq(EXAM_QUESTION.CATEGORY_ID))
                        .where(EXAM_CATEGORY.STATUS.eq("1"))
                        .groupBy(EXAM_CATEGORY.CATEGORY_ID,EXAM_CATEGORY.CATEGORY_NAME,EXAM_CATEGORY.REMARK)
                        .orderBy(EXAM_CATEGORY.CATEGORY_ID.asc()),ExamCategoryVo.class);

    }


    public List<Object> getDepartments(DepartmentQueryDTO request) {

        return sysDepartmentMapper.selectObjectListByQuery(QueryWrapper.create().select(SYS_DEPARTMENT.DEPT_NAME));
    }

    public void addDepartment(DepartmentDTO departmentDTO) {
        CustomToken customToken = JwtAccessContext.getLoginInfo();
        sysDepartmentMapper.insert(SysDepartment.builder()
                .deptName(departmentDTO.getDeptName())
                .remark(departmentDTO.getRemark())
                .createDept(departmentDTO.getDeptName())
                .build());
    }

    // 考试配置管理
    public Page<ExamConfig> getExamConfigs(ExamConfigDTO request) {
       return examConfigMapper.paginate(request.getPageNumber(),request.getPageSize(),QueryWrapper.create()
               .where(EXAM_CONFIG.STATUS.eq("1")).orderBy(EXAM_CONFIG.CREATE_TIME.desc()));
    }

    public void addExamConfig(ExamConfigDTO request) {
        CustomToken customToken = JwtAccessContext.getLoginInfo();
        ExamConfig examConfig = new ExamConfig();
        BeanUtil.copyProperties(request,examConfig, CopyOptions.create().ignoreNullValue());
        examConfig.setCreateBy(customToken.getUserName());
        examConfig.setStatus("1");
        examConfigMapper.insert(examConfig);
    }
    public void updateExamConfig(ExamConfigDTO request) {
        CustomToken customToken = JwtAccessContext.getLoginInfo();
        ExamConfig examConfig = new ExamConfig();
        BeanUtil.copyProperties(request, examConfig, CopyOptions.create().ignoreNullValue());
        examConfig.setUpdateBy(customToken.getUserName());
        examConfigMapper.update(examConfig);
    }
    public void deleteExamConfig(String id) {
        examConfigMapper.deleteById(id);
    }

    @Transactional(rollbackFor = Exception.class)
    // 试卷生成
    public void generateExamPaper(ExamPaperDTO request) {
        CustomToken customToken = JwtAccessContext.getLoginInfo();
        // 1. 插入 exam_paper
        ExamPaper paper = new ExamPaper();
        paper.setPaperName(request.getPaperName());
        paper.setConfigId(request.getConfigId());
        paper.setCategoryId(request.getCategoryId());
        paper.setTotalQuestions(request.getTotalQuestions());
        paper.setTotalScore(request.getTotalScore());
        paper.setDuration(request.getDuration());
        paper.setCreateBy(customToken.getUserName());
        paper.setStatus("1");
        examPaperMapper.insert(paper);

        // 2. 插入 exam_paper_question
        List<ExamPaperQuestion> paperQuestions = new ArrayList<>();
        if (request.getExamPaperList() != null) {
            for (var q : request.getExamPaperList()) {
                ExamPaperQuestion pq = new ExamPaperQuestion();
                pq.setPaperId(paper.getPaperId());
                pq.setQuestionId(q.getQuestionId());
                pq.setQuestionOrder(q.getQuestionOrder());
                pq.setQuestionScore(q.getScore());
                paperQuestions.add(pq);
            }
            if (!paperQuestions.isEmpty()) {
                examPaperQuestionMapper.insertBatch(paperQuestions);
            }
        }
    }

    public Page<ExamPaperVo> getGeneratedPapers(ExamPaperQueryDTO examPaperQueryDTO) {
        QueryWrapper queryWrapper = QueryWrapper.create()
            .select(
                EXAM_PAPER.PAPER_ID,
                EXAM_PAPER.PAPER_NAME,
                EXAM_PAPER.CATEGORY_ID,
                EXAM_CATEGORY.CATEGORY_NAME,
                EXAM_PAPER.TOTAL_QUESTIONS,
                EXAM_PAPER.TOTAL_SCORE,
                EXAM_PAPER.DURATION,
                EXAM_PAPER.USAGE_COUNT,
                EXAM_PAPER.STATUS,
                EXAM_PAPER.CREATE_BY,
                EXAM_PAPER.CREATE_TIME,
                EXAM_PAPER.UPDATE_BY,
                EXAM_PAPER.UPDATE_TIME,
                EXAM_PAPER.REMARK
            )
            .from(EXAM_PAPER)
            .leftJoin(EXAM_CATEGORY).on(EXAM_PAPER.CATEGORY_ID.eq(EXAM_CATEGORY.CATEGORY_ID));
        
        // 试卷名称模糊查询
        if (examPaperQueryDTO.getPaperName() != null && !examPaperQueryDTO.getPaperName().trim().isEmpty()) {
            queryWrapper.and(EXAM_PAPER.PAPER_NAME.like("%" + examPaperQueryDTO.getPaperName().trim() + "%"));
        }
        
        // 科室筛选
        if (examPaperQueryDTO.getCategoryId() != null && !examPaperQueryDTO.getCategoryId().trim().isEmpty()) {
            queryWrapper.and(EXAM_PAPER.CATEGORY_ID.eq(examPaperQueryDTO.getCategoryId()));
        }
        
        // 状态筛选
        if (examPaperQueryDTO.getStatus() != null && !examPaperQueryDTO.getStatus().trim().isEmpty()) {
            queryWrapper.and(EXAM_PAPER.STATUS.eq(examPaperQueryDTO.getStatus()));
        }
        
        // 按创建时间倒序排列
        queryWrapper.orderBy(EXAM_PAPER.CREATE_TIME.desc());
        
        return examPaperMapper.paginateAs(
            examPaperQueryDTO.getPageNumber(),
            examPaperQueryDTO.getPageSize(),
            queryWrapper,
            ExamPaperVo.class
        );
    }

    public List<ExamQuestion> getGeneratedPaperDetail(String paperId) {
        List<Object> questionIds = examPaperQuestionMapper.selectObjectListByQuery(QueryWrapper.create()
                .select(EXAM_PAPER_QUESTION.QUESTION_ID)
                .where(EXAM_PAPER_QUESTION.PAPER_ID.eq(paperId)));
        return examQuestionMapper.selectListByQuery(QueryWrapper.create().where(EXAM_QUESTION.QUESTION_ID.in(questionIds)));
    }

    public void updateGeneratedPaper(ExamPaperDTO examPaperDTO) {
        examPaperMapper.update(ExamPaper.builder()
                        .status(examPaperDTO.getStatus())
                        .paperId(examPaperDTO.getPaperId())
                .build());
    }

    public List<ExamPaper> getAvailablePapers(AvailablePaperQueryDTO result) {
        CustomToken customToken = JwtAccessContext.getLoginInfo();
        // 查出所有试卷
        List<ExamPaper> papers = examPaperMapper.selectListByQuery(QueryWrapper.create().where(EXAM_PAPER.STATUS.eq("1")));
        //查出所有参加试考试的记录
        List<ExamRecord> records = examRecordMapper.selectListByQuery(QueryWrapper.create()
                .where(EXAM_RECORD.USER_ID.eq(customToken.getUserId()))
                .and(EXAM_RECORD.RETAKE.eq(0)));

        papers.forEach(paper -> {
            paper.setStatus("pending");
           records.forEach(record -> {
               if(paper.getPaperId().equals(record.getPaperId())){
                   paper.setStatus(record.getStatus());
               }
           });
        });
        return papers;
    }

    // 统计分析
    public DashboardVo getDashboardStatistics() {
        long examQuestionCount = examQuestionMapper.selectCountByQuery(QueryWrapper.create().where(EXAM_QUESTION.STATUS.eq("1")));
        long examResultCountToday = examRecordMapper.selectCountByQuery(QueryWrapper.create().where(EXAM_RECORD.CREATE_TIME.ge(LocalDateTime.now().minusDays(1))));
        long categoryCount = examCategoryMapper.selectCountByQuery(QueryWrapper.create().where(EXAM_CATEGORY.STATUS.eq("1")));
        Object avgExamScore = examRecordMapper.selectObjectByQuery(QueryWrapper.create()
                .select(avg(EXAM_RECORD.SCORE).as("avg_score"))
                .where(EXAM_RECORD.STATUS.eq("completed")));

        List<SysLog> sysLogs = sysLogMapper.selectListByQuery(QueryWrapper.create()
                .orderBy(SYS_LOG.CREATE_TIME.desc())
                .limit(5));

        List<CategoryCount>  categorySummary = examCategoryMapper.selectListByQueryAs(QueryWrapper.create()
                .select(EXAM_CATEGORY.CATEGORY_NAME.as("categoryName"), count(EXAM_QUESTION.QUESTION_ID).as("questionCount"))
                        .leftJoin(EXAM_QUESTION).on(EXAM_QUESTION.CATEGORY_ID.eq(EXAM_CATEGORY.CATEGORY_ID))
//                .where(EXAM_QUESTION.STATUS.eq("1"))
                .groupBy(EXAM_CATEGORY.CATEGORY_NAME)
                .orderBy(count(EXAM_QUESTION.QUESTION_ID).desc()),CategoryCount.class);

        return DashboardVo.builder()
                .questionCount((int) examQuestionCount)
                .examResultCountToday((int)examResultCountToday)
                .categoryCount((int)categoryCount)
                .avgExamScore(avgExamScore== null ? "0": avgExamScore.toString())
                .sysLogs(sysLogs)
                .categorySummary(categorySummary)
                .build();
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



    public Options getOptions() {

        List<SysRole> sysRoles = sysRoleMapper.selectListByQuery(QueryWrapper.create().select(SYS_ROLE.ROLE_NAME,SYS_ROLE.ROLE_KEY)
                .where(SYS_ROLE.STATUS.eq("1")));

        Map<String,String> roleMap = sysRoles.stream().collect(Collectors.toMap(SysRole::getRoleName, SysRole::getRoleKey));

        List<Object> sysDepartments = sysUserMapper.selectObjectListByQuery(QueryWrapper.create().select(SYS_USER.DEPARTMENT).groupBy(SYS_USER.DEPARTMENT));

        Map<String,String> departmentsMap = sysDepartments.stream().collect(Collectors.toMap(Object::toString,Object::toString));

        List<ExamCategory> examCategories = examCategoryMapper.selectListByQuery(QueryWrapper.create().select(EXAM_CATEGORY.CATEGORY_ID,EXAM_CATEGORY.CATEGORY_NAME)
                .where(EXAM_CATEGORY.STATUS.eq("1")));
        Map<String,String> categoryMap = examCategories.stream().collect(Collectors.toMap(ExamCategory::getCategoryId,ExamCategory::getCategoryName));

        return Options.builder()
                .roles(roleMap)
                .categories(categoryMap)
                .departments(departmentsMap)
                .build();
    }


    public List<CategroyQuestionCountVo> getQuestionsByCategoryId(String categoryId) {
        return examQuestionMapper.selectListByQueryAs(QueryWrapper.create()
                .select(EXAM_QUESTION.QUESTION_TYPE,count(EXAM_QUESTION.QUESTION_ID).as("questionCount"))
                .where(EXAM_QUESTION.STATUS.eq("1"))
                        .and(EXAM_QUESTION.CATEGORY_ID.eq(categoryId))
                .groupBy(EXAM_QUESTION.QUESTION_TYPE),CategroyQuestionCountVo.class);
    }

    public List<ExamQuestion> getQuestionsWithCategoryId(String categoryId) {
        return examQuestionMapper.selectListByQuery(QueryWrapper.create().where(EXAM_QUESTION.CATEGORY_ID.eq(categoryId)));
    }

    public List<ExamQuestion> getQuestionsByPaperId(String paperId) {
        // 1. 根据试卷ID查询试卷题目关联表中的所有题目ID
        List<Object> questionIds = examPaperQuestionMapper.selectObjectListByQuery(
            QueryWrapper.create()
                .select(EXAM_PAPER_QUESTION.QUESTION_ID)
                .where(EXAM_PAPER_QUESTION.PAPER_ID.eq(paperId))
        );
        
        if (questionIds == null || questionIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        // 2. 根据题目ID查询完整的题目信息
        List<ExamQuestion> questions = examQuestionMapper.selectListByQuery(
            QueryWrapper.create()
                .where(EXAM_QUESTION.QUESTION_ID.in(questionIds))
                .and(EXAM_QUESTION.STATUS.eq("1")) // 只查询有效的题目
        );
        
        // 3. 随机打乱题目顺序
        Collections.shuffle(questions);
        
        return questions;
    }



    private String getQuestionTypeIdByName(String questionTypeName){
        if(questionTypeName.equals("选择题")){
            return "choice";
        }
        if(questionTypeName.equals("多选题")){
            return "multi";
        }
        if(questionTypeName.equals("判断题")){
            return "judgment";
        }
        return questionTypeName;
    }


}
