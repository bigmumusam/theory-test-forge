package com.medical.exam.service;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.bean.copier.CopyOptions;
import cn.hutool.poi.excel.ExcelReader;
import cn.hutool.poi.excel.ExcelUtil;
import com.medical.exam.common.exception.CustomException;
import com.medical.exam.dto.*;
import com.medical.exam.entity.*;
import com.medical.exam.entity.ExamForceRetake;
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
import jakarta.servlet.http.HttpServletResponse;
import cn.hutool.poi.excel.ExcelWriter;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.SimpleDateFormat;
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
import static com.medical.exam.entity.table.ExamForceRetakeTableDef.EXAM_FORCE_RETAKE;
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
    private ExamForceRetakeMapper examForceRetakeMapper;

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
                 sum(case when score >= pass_score then 1 else 0 end) as pass_count
                 from exam_record where status='completed';
                """;
        Row row = Db.selectOneBySql( sql);
        return RowUtil.toEntity(row, ExamResultSummaryVo.class);
    }

    public Page<ExamResultVo> getExamResults(ExamResultQueryDTO request) {
        // 如果是不及格筛选，需要特殊处理以避免重复安排重考
        if ("fail".equals(request.getPassStatus())) {
            return getLatestFailedExamResults(request);
        }
        
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(EXAM_RECORD.RECORD_ID,SYS_USER.USER_NAME,SYS_USER.DEPARTMENT.as("categoryName"),SYS_USER.USER_CATEGORY,SYS_USER.ID_NUMBER,EXAM_RECORD.EXAM_NAME
                        ,EXAM_RECORD.END_TIME.as("examDate"),EXAM_RECORD.DURATION,EXAM_RECORD.SCORE,EXAM_RECORD.TOTAL_SCORE,EXAM_RECORD.STATUS,EXAM_RECORD.RETAKE,EXAM_RECORD.PASS_SCORE)
                .leftJoin(SYS_USER).on(SYS_USER.USER_ID.eq(EXAM_RECORD.USER_ID))
                .leftJoin(EXAM_PAPER).on(EXAM_PAPER.PAPER_ID.eq(EXAM_RECORD.PAPER_ID))
                .leftJoin(EXAM_CONFIG).on(EXAM_CONFIG.CONFIG_ID.eq(EXAM_PAPER.CONFIG_ID))
                .where(SYS_USER.USER_NAME.like(request.getKeyword()).or(SYS_USER.ID_NUMBER.like(request.getKeyword())))
                .and(EXAM_PAPER.CATEGORY_ID.eq(request.getCategory()))
                .and(EXAM_RECORD.STATUS.eq(request.getStatus()));
        
        // 添加及格筛选
        if ("pass".equals(request.getPassStatus())) {
            queryWrapper.and(EXAM_RECORD.SCORE.ge(EXAM_RECORD.PASS_SCORE));
        }
        
        // 添加重考筛选
        if ("retake".equals(request.getRetakeStatus())) {
            queryWrapper.and(EXAM_RECORD.RETAKE.eq(1));
        } else if ("normal".equals(request.getRetakeStatus())) {
            queryWrapper.and(EXAM_RECORD.RETAKE.eq(0));
        }
        
        // 添加考试名称筛选
        if (request.getExamName() != null && !request.getExamName().trim().isEmpty()) {
            queryWrapper.and(EXAM_RECORD.EXAM_NAME.like(request.getExamName()));
        }
        
        Page<ExamResultVo> page = examRecordMapper.paginateAs(request.getPageNumber(),request.getPageSize(),
                queryWrapper.orderBy(EXAM_RECORD.END_TIME.desc()),
                ExamResultVo.class);
        
        // 转换重考字段显示
        for (ExamResultVo result : page.getRecords()) {
            if (result.getRetake() != null) {
                result.setRetake(result.getRetake().equals("1") ? "是" : "否");
            }
        }
        
        return page;
    }
    
    /**
     * 获取每个用户在每个考试中的最新记录中不及格的用户
     * 按用户+考试名称分组，避免重复安排已及格用户的重考
     */
    private Page<ExamResultVo> getLatestFailedExamResults(ExamResultQueryDTO request) {
        try {
        // 构建基础查询条件
        StringBuilder whereClause = new StringBuilder();
        List<Object> params = new ArrayList<>();
        
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            whereClause.append(" er.status = ?");
            params.add(request.getStatus());
        } else {
            whereClause.append(" 1=1 "); // 没有状态条件时，防止SQL语法错误
        }
        
        // 只有当keyword不为空时才添加keyword条件
        if (request.getKeyword() != null && !request.getKeyword().trim().isEmpty()) {
            whereClause.append(" AND (su.user_name LIKE ? OR su.id_number LIKE ?)");
            params.add("%" + request.getKeyword() + "%");
            params.add("%" + request.getKeyword() + "%");
        }
        
        // 添加分类筛选
        if (request.getCategory() != null && !request.getCategory().trim().isEmpty()) {
            whereClause.append(" AND ep.category_id = ?");
            params.add(request.getCategory());
        }
        
        // 添加重考筛选
        if ("retake".equals(request.getRetakeStatus())) {
            whereClause.append(" AND er.retake = 1");
        } else if ("normal".equals(request.getRetakeStatus())) {
            whereClause.append(" AND er.retake = 0");
        }
        
        // 添加考试名称筛选
        if (request.getExamName() != null && !request.getExamName().trim().isEmpty()) {
            whereClause.append(" AND er.exam_name LIKE ?");
            params.add("%" + request.getExamName() + "%");
        }
        
        // 1. 先查询总数（优化：只查询count，不查询具体数据）
        String countSql = """
            SELECT COUNT(1)
            FROM exam_record er
            LEFT JOIN sys_user su ON su.user_id = er.user_id
            LEFT JOIN exam_paper ep ON ep.paper_id = er.paper_id
            WHERE er.record_id IN (
                SELECT er2.record_id
                FROM exam_record er2
                WHERE er2.user_id = er.user_id
                  AND er2.exam_name = er.exam_name
                  AND er2.status = 'completed'
                  AND er2.end_time = (
                      SELECT MAX(er3.end_time)
                      FROM exam_record er3
                      WHERE er3.user_id = er2.user_id
                        AND er3.exam_name = er2.exam_name
                        AND er3.status = 'completed'
                  )
                  AND er2.score < er2.pass_score
            )
            AND """ + whereClause;
        
        // 执行count查询
        Row countRow = Db.selectOneBySql(countSql, params.toArray());
        Long totalCount = countRow != null ? countRow.getLong("COUNT(1)") : 0L;
        
        // 2. 查询分页数据（使用LIMIT和OFFSET进行数据库级分页）
        String dataSql = """
            SELECT er.record_id, su.user_name, su.department as categoryName, su.user_category, su.id_number, 
                   er.exam_name, er.end_time as examDate, er.duration, er.score, er.total_score, 
                   er.status, er.retake, er.pass_score
            FROM exam_record er
            LEFT JOIN sys_user su ON su.user_id = er.user_id
            LEFT JOIN exam_paper ep ON ep.paper_id = er.paper_id
            LEFT JOIN exam_config ec ON ec.config_id = ep.config_id
            WHERE er.record_id IN (
                SELECT er2.record_id
                FROM exam_record er2
                WHERE er2.user_id = er.user_id
                  AND er2.exam_name = er.exam_name
                  AND er2.status = 'completed'
                  AND er2.end_time = (
                      SELECT MAX(er3.end_time)
                      FROM exam_record er3
                      WHERE er3.user_id = er2.user_id
                        AND er3.exam_name = er2.exam_name
                        AND er3.status = 'completed'
                  )
                  AND er2.score < er2.pass_score
            )
            AND """ + whereClause + """
            ORDER BY er.end_time DESC
            LIMIT ? OFFSET ?
            """;
        
        // 添加分页参数
        params.add(request.getPageSize());
        params.add((request.getPageNumber() - 1) * request.getPageSize());
        
        // 执行分页查询
        List<Row> rows = Db.selectListBySql(dataSql, params.toArray());
        List<ExamResultVo> results = rows.stream()
                .map(row -> RowUtil.toEntity(row, ExamResultVo.class))
                .collect(Collectors.toList());
        
        // 转换重考字段显示
        for (ExamResultVo result : results) {
            if (result.getRetake() != null) {
                result.setRetake(result.getRetake().equals("1") ? "是" : "否");
            }
        }
        
        // 创建分页对象
        Page<ExamResultVo> page = new Page<>();
        page.setRecords(results);
        page.setPageNumber(request.getPageNumber());
        page.setPageSize(request.getPageSize());
        page.setTotalRow(totalCount.intValue());
        page.setTotalPage((int) Math.ceil((double) totalCount / request.getPageSize()));
        
        return page;
        } catch (Exception e) {
            // 记录错误日志
            System.err.println("查询不及格考试结果失败: " + e.getMessage());
            e.printStackTrace();
            
            // 返回空的分页结果
            Page<ExamResultVo> emptyPage = new Page<>();
            emptyPage.setRecords(new ArrayList<>());
            emptyPage.setPageNumber(request.getPageNumber());
            emptyPage.setPageSize(request.getPageSize());
            emptyPage.setTotalRow(0);
            emptyPage.setTotalPage(0);
            return emptyPage;
        }
    }

    public  List<ExamDetailVo> getExamResultDetail(String recordId) {
        return   examAnswerMapper.selectListByQueryAs(QueryWrapper.create()
                       .select(EXAM_QUESTION.QUESTION_TYPE, EXAM_QUESTION.QUESTION_CONTENT,EXAM_QUESTION.QUESTION_OPTIONS,
                               EXAM_QUESTION.CORRECT_ANSWER,EXAM_ANSWER.USER_ANSWER,EXAM_ANSWER.IS_CORRECT,
                               EXAM_ANSWER.SCORE)
                .innerJoin(EXAM_QUESTION).on(EXAM_QUESTION.QUESTION_ID.eq(EXAM_ANSWER.QUESTION_ID))
               .where(EXAM_ANSWER.RECORD_ID.eq(recordId)),ExamDetailVo.class);
    }

    @Transactional(rollbackFor = Exception.class)
    public void batchArrangeRetakeExam(Map<String, Object> request) {
        CustomToken customToken = JwtAccessContext.getLoginInfo();
        List<String> recordIds = (List<String>) request.get("recordIds");
        
        // 验证所有记录是否存在且状态正确
        for (String recordId : recordIds) {
            ExamRecord record = examRecordMapper.selectOneByQuery(
                QueryWrapper.create()
                    .where(EXAM_RECORD.RECORD_ID.eq(recordId))
                    .and(EXAM_RECORD.STATUS.eq("completed"))
            );
            
            if (record == null) {
                throw new RuntimeException("考试记录不存在或状态不正确: " + recordId);
            }
        }
        
        // 为每个记录设置强制重考标识
        for (String recordId : recordIds) {
            ExamRecord originalRecord = examRecordMapper.selectOneByQuery(
                QueryWrapper.create()
                    .where(EXAM_RECORD.RECORD_ID.eq(recordId))
            );
            
            // 设置强制重考标识
            setForceRetake(originalRecord.getUserId(), originalRecord.getPaperId());
        }
        
        log.info("批量重考安排成功，记录ID: {}", recordIds);
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
            .and(EXAM_QUESTION.QUESTION_CONTENT.like(request.getKeyword()));
        return examQuestionMapper.paginate(request.getPageNumber(), request.getPageSize(), queryWrapper);
    }

    public String importQuestions(MultipartFile file) {
        CustomToken customToken = JwtAccessContext.getLoginInfo();
        List<ExamQuestion> examQuestions = new ArrayList<>();
        int totalProcessed = 0;
        int duplicateCount = 0;
        int successCount = 0;
        
        try {
            ExcelReader reader = ExcelUtil.getReader(file.getInputStream());
            List<Map<String, Object>> readAll = reader.readAll();
            for (Map<String, Object> row : readAll) {
                totalProcessed++;
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
                    duplicateCount++;
                    continue;
                }
                examQuestions.add(ExamQuestion.builder()
                        .questionType(getQuestionTypeIdByName(questionType))
                        .questionContent(questionContent)
                        .questionOptions(questionOptionsObj==null ? null : convertOldFormatOptionsToJson(questionOptionsObj.toString()))
                        .correctAnswer(correctAnswer)
                        .categoryId(examCategoryMapper.selectOneByQuery(QueryWrapper.create()
                                .where(EXAM_CATEGORY.CATEGORY_NAME.eq(categoryName))).getCategoryId())
                        .difficulty("easy")
                        .status("1")
                        .createBy(customToken.getUserName())
                        .build());
            }
            
            // 只有当有题目需要插入时才执行插入操作
            if (!examQuestions.isEmpty()) {
                examQuestionMapper.insertBatch(examQuestions);
                successCount = examQuestions.size();
            }
        }catch (Exception e){
            log.error("导入题目错误:",e);
            throw new CustomException("导入题目错误:"+e.getMessage());
        }
        
        // 生成详细的导入结果消息
        String message = String.format("导入完成！共处理%d条题目，成功导入%d条，重复%d条", 
                totalProcessed, successCount, duplicateCount);
        
        sysLogMapper.insert(SysLog.builder()
                .userId(customToken.getUserId())
                .userName(customToken.getUserName())
                .content(message)
                .build());
        return message;
    }

    public String importQuestionsNew(MultipartFile file) {
        CustomToken customToken = JwtAccessContext.getLoginInfo();
        List<ExamQuestion> examQuestions = new ArrayList<>();
        int totalProcessed = 0;
        int duplicateCount = 0;
        int successCount = 0;
        
        try {
            ExcelReader reader = ExcelUtil.getReader(file.getInputStream());
            
            // 处理选择题sheet
            reader.setSheet(0); // 切换到第一个sheet
            List<Map<String, Object>> choiceQuestions = reader.readAll();
            for (Map<String, Object> row : choiceQuestions) {
                totalProcessed++;
                Object categoryNameObj = row.get("题目所属分类");
                Object questionContentObj = row.get("题干");
                Object optionAObj = row.get("选项A");
                Object optionBObj = row.get("选项B");
                Object optionCObj = row.get("选项C");
                Object optionDObj = row.get("选项D");
                Object optionEObj = row.get("选项E");
                Object optionFObj = row.get("选项F");
                Object correctAnswerObj = row.get("正确答案");

                if (categoryNameObj == null || questionContentObj == null || correctAnswerObj == null) {
                    continue; // 忽略该条数据
                }
                
                String categoryName = categoryNameObj.toString().trim();
                String questionContent = questionContentObj.toString().trim();
                String correctAnswer = correctAnswerObj.toString().trim();

                // 构建选项数组
                List<String> options = new ArrayList<>();
                if (optionAObj != null && !optionAObj.toString().trim().isEmpty()) {
                    options.add(optionAObj.toString().trim());
                }
                if (optionBObj != null && !optionBObj.toString().trim().isEmpty()) {
                    options.add(optionBObj.toString().trim());
                }
                if (optionCObj != null && !optionCObj.toString().trim().isEmpty()) {
                    options.add(optionCObj.toString().trim());
                }
                if (optionDObj != null && !optionDObj.toString().trim().isEmpty()) {
                    options.add(optionDObj.toString().trim());
                }
                if (optionEObj != null && !optionEObj.toString().trim().isEmpty()) {
                    options.add(optionEObj.toString().trim());
                }
                if (optionFObj != null && !optionFObj.toString().trim().isEmpty()) {
                    options.add(optionFObj.toString().trim());
                }

                // 转换正确答案格式：abcdef -> 0,1,2,3,4,5
                String convertedAnswer = convertAnswerFormat(correctAnswer, options.size());
                
                // 根据原始答案长度判断是单选还是多选
                String questionType = (correctAnswer != null && correctAnswer.trim().length() > 1) ? "multi" : "choice";

                // 检查题目是否已存在
                long count = examQuestionMapper.selectCountByQuery(QueryWrapper.create()
                        .innerJoin(EXAM_CATEGORY).on(EXAM_QUESTION.CATEGORY_ID.eq(EXAM_CATEGORY.CATEGORY_ID))
                        .where(EXAM_CATEGORY.CATEGORY_NAME.eq(categoryName))
                        .and(EXAM_QUESTION.QUESTION_CONTENT.eq(questionContent))
                );
                if (count > 0) {
                    log.info("题目:{}已存在", questionContent);
                    duplicateCount++;
                    continue;
                }

                examQuestions.add(ExamQuestion.builder()
                        .questionType(questionType) // 根据答案长度判断单选或多选
                        .questionContent(questionContent)
                        .questionOptions(convertOptionsToJson(options))
                        .correctAnswer(convertedAnswer)
                        .categoryId(examCategoryMapper.selectOneByQuery(QueryWrapper.create()
                                .where(EXAM_CATEGORY.CATEGORY_NAME.eq(categoryName))).getCategoryId())
                        .difficulty("easy")
                        .status("1")
                        .score(2) // 默认分数2分
                        .createBy(customToken.getUserName())
                        .build());
            }

            // 处理判断题sheet
            reader.setSheet(1); // 切换到第二个sheet
            List<Map<String, Object>> judgmentQuestions = reader.readAll();
            for (Map<String, Object> row : judgmentQuestions) {
                totalProcessed++;
                Object categoryNameObj = row.get("题目所属分类");
                Object questionContentObj = row.get("题干");
                Object correctAnswerObj = row.get("正确答案");

                if (categoryNameObj == null || questionContentObj == null || correctAnswerObj == null) {
                    continue; // 忽略该条数据
                }
                
                String categoryName = categoryNameObj.toString().trim();
                String questionContent = questionContentObj.toString().trim();
                String correctAnswer = correctAnswerObj.toString().trim();

                // 判断题答案不转换，直接使用原始答案

                // 检查题目是否已存在
                long count = examQuestionMapper.selectCountByQuery(QueryWrapper.create()
                        .innerJoin(EXAM_CATEGORY).on(EXAM_QUESTION.CATEGORY_ID.eq(EXAM_CATEGORY.CATEGORY_ID))
                        .where(EXAM_CATEGORY.CATEGORY_NAME.eq(categoryName))
                        .and(EXAM_QUESTION.QUESTION_CONTENT.eq(questionContent))
                );
                if (count > 0) {
                    log.info("题目:{}已存在", questionContent);
                    duplicateCount++;
                    continue;
                }

                examQuestions.add(ExamQuestion.builder()
                        .questionType("judgment") // 判断题
                        .questionContent(questionContent)
                        .questionOptions("[\"正确\",\"错误\"]") // 判断题固定选项
                        .correctAnswer(correctAnswer) // 直接使用原始答案
                        .categoryId(examCategoryMapper.selectOneByQuery(QueryWrapper.create()
                                .where(EXAM_CATEGORY.CATEGORY_NAME.eq(categoryName))).getCategoryId())
                        .difficulty("easy")
                        .status("1")
                        .score(2) // 默认分数2分
                        .createBy(customToken.getUserName())
                        .build());
            }

            // 只有当有题目需要插入时才执行插入操作
            if (!examQuestions.isEmpty()) {
                examQuestionMapper.insertBatch(examQuestions);
                successCount = examQuestions.size();
            }
        } catch (Exception e) {
            log.error("导入题目错误:", e);
            throw new CustomException("导入题目错误:" + e.getMessage());
        }
        
        // 生成详细的导入结果消息
        String message = String.format("导入完成！共处理%d条题目，成功导入%d条，重复%d条", 
                totalProcessed, successCount, duplicateCount);
        
        sysLogMapper.insert(SysLog.builder()
                .userId(customToken.getUserId())
                .userName(customToken.getUserName())
                .content(message)
                .build());
        return message;
    }

    /**
     * 转换选择题答案格式：abcdef -> 0,1,2,3,4,5
     */
    private String convertAnswerFormat(String answer, int optionCount) {
        if (answer == null || answer.trim().isEmpty()) {
            return "";
        }
        
        StringBuilder result = new StringBuilder();
        String upperAnswer = answer.toUpperCase();
        
        for (int i = 0; i < upperAnswer.length(); i++) {
            char c = upperAnswer.charAt(i);
            int index = c - 'A';
            if (index >= 0 && index < optionCount) {
                if (result.length() > 0) {
                    result.append(",");
                }
                result.append(index);
            }
        }
        
        return result.toString();
    }


    /**
     * 将选项列表转换为JSON格式
     */
    private String convertOptionsToJson(List<String> options) {
        if (options == null || options.isEmpty()) {
            return "[]";
        }
        
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < options.size(); i++) {
            if (i > 0) {
                json.append(",");
            }
            // 转义JSON特殊字符
            String escapedOption = options.get(i)
                .replace("\\", "\\\\")  // 反斜杠
                .replace("\"", "\\\"")  // 双引号
                .replace("\n", "\\n")   // 换行符
                .replace("\r", "\\r")   // 回车符
                .replace("\t", "\\t");  // 制表符
            json.append("\"").append(escapedOption).append("\"");
        }
        json.append("]");
        
        return json.toString();
    }

    /**
     * 将老格式的选项字符串转换为JSON格式
     * 老格式：选项A,选项B,选项C,选项D
     */
    private String convertOldFormatOptionsToJson(String optionsString) {
        if (optionsString == null || optionsString.trim().isEmpty()) {
            return "[]";
        }
        
        // 按逗号分割选项
        String[] options = optionsString.split(",");
        StringBuilder json = new StringBuilder("[");
        
        for (int i = 0; i < options.length; i++) {
            if (i > 0) {
                json.append(",");
            }
            // 转义JSON特殊字符
            String escapedOption = options[i].trim()
                .replace("\\", "\\\\")  // 反斜杠
                .replace("\"", "\\\"")  // 双引号
                .replace("\n", "\\n")   // 换行符
                .replace("\r", "\\r")   // 回车符
                .replace("\t", "\\t");  // 制表符
            json.append("\"").append(escapedOption).append("\"");
        }
        json.append("]");
        
        return json.toString();
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
        ExamCategory category = ExamCategory.builder()
                .categoryName(request.getCategoryName())
                .categoryCode(request.getCategoryCode())
                .parentId(request.getParentId())
                .level(request.getLevel() != null ? request.getLevel() : 1)
                .sortOrder(request.getSortOrder() != null ? request.getSortOrder() : 0)
                .remark(request.getRemark())
                .status("1")
                .createBy(customToken.getUserName())
                .build();
        examCategoryMapper.insert(category);
    }

    public void updateCategory(CategoryDTO request) {
        CustomToken customToken = JwtAccessContext.getLoginInfo();
        examCategoryMapper.update(
                ExamCategory.builder()
                        .categoryId(request.getCategoryId())
                        .categoryName(request.getCategoryName())
                        .categoryCode(request.getCategoryCode())
                        .parentId(request.getParentId())
                        .level(request.getLevel())
                        .sortOrder(request.getSortOrder())
                        .remark(request.getRemark())
                        .updateBy(customToken.getUserName())
                        .build()
        );
    }

    public List<ExamCategoryVo> getCategoriesTree() {
        // 获取所有分类
        List<ExamCategory> allCategories = examCategoryMapper.selectListByQuery(
                QueryWrapper.create()
                        .where(EXAM_CATEGORY.STATUS.eq("1"))
                        .orderBy(EXAM_CATEGORY.LEVEL.asc(), EXAM_CATEGORY.SORT_ORDER.asc(), EXAM_CATEGORY.CATEGORY_NAME.asc())
        );

        // 构建树形结构
        List<ExamCategoryVo> tree = buildCategoryTree(allCategories);
        
        // 对树形结构进行排序
        sortCategoryVoTree(tree);
        
        return tree;
    }

    private void sortCategoryVoTree(List<ExamCategoryVo> categories) {
        if (categories == null || categories.isEmpty()) {
            return;
        }
        
        // 对当前层级进行排序
        categories.sort((a, b) -> {
            if (a.getSortOrder() != null && b.getSortOrder() != null) {
                return a.getSortOrder().compareTo(b.getSortOrder());
            }
            return a.getCategoryName().compareTo(b.getCategoryName());
        });
        
        // 递归对子分类进行排序
        for (ExamCategoryVo category : categories) {
            if (category.getChildren() != null && !category.getChildren().isEmpty()) {
                sortCategoryVoTree(category.getChildren());
            }
        }
    }

    public Page<ExamCategoryVo> getCategories(CategoryQueryDTO categoryQueryDTO) {
        return examCategoryMapper.paginateAs(categoryQueryDTO.getPageNumber(),categoryQueryDTO.getPageSize(),
                QueryWrapper.create()
                        .select(EXAM_CATEGORY.CATEGORY_ID,EXAM_CATEGORY.CATEGORY_NAME,EXAM_CATEGORY.CATEGORY_CODE,EXAM_CATEGORY.PARENT_ID,EXAM_CATEGORY.LEVEL,EXAM_CATEGORY.SORT_ORDER,EXAM_CATEGORY.REMARK,count(EXAM_QUESTION.CATEGORY_ID).as("questionCount"))
                        .leftJoin(EXAM_QUESTION).on(EXAM_CATEGORY.CATEGORY_ID.eq(EXAM_QUESTION.CATEGORY_ID))
                        .where(EXAM_CATEGORY.STATUS.eq("1"))
                        .groupBy(EXAM_CATEGORY.CATEGORY_ID,EXAM_CATEGORY.CATEGORY_NAME,EXAM_CATEGORY.CATEGORY_CODE,EXAM_CATEGORY.PARENT_ID,EXAM_CATEGORY.LEVEL,EXAM_CATEGORY.SORT_ORDER,EXAM_CATEGORY.REMARK)
                        .orderBy(EXAM_CATEGORY.LEVEL.asc(), EXAM_CATEGORY.SORT_ORDER.asc()),ExamCategoryVo.class);
    }

    private List<ExamCategoryVo> buildCategoryTree(List<ExamCategory> categories) {
        Map<String, ExamCategoryVo> categoryMap = new HashMap<>();
        List<ExamCategoryVo> rootCategories = new ArrayList<>();

        // 转换为VO对象并获取题目数量
        for (ExamCategory category : categories) {
            ExamCategoryVo vo = new ExamCategoryVo();
            vo.setCategoryId(category.getCategoryId());
            vo.setCategoryName(category.getCategoryName());
            vo.setCategoryCode(category.getCategoryCode());
            vo.setParentId(category.getParentId());
            vo.setLevel(category.getLevel());
            vo.setSortOrder(category.getSortOrder());
            vo.setRemark(category.getRemark());
            vo.setChildren(new ArrayList<>());
            
            // 获取该分类的题目数量
            Long questionCount = examQuestionMapper.selectCountByQuery(
                    QueryWrapper.create()
                            .where(EXAM_QUESTION.CATEGORY_ID.eq(category.getCategoryId()))
                            .and(EXAM_QUESTION.STATUS.eq("1"))
            );
            vo.setQuestionCount(questionCount);
            
            categoryMap.put(category.getCategoryId(), vo);
        }

        // 构建树形结构
        for (ExamCategoryVo vo : categoryMap.values()) {
            if (vo.getParentId() == null || vo.getParentId().isEmpty()) {
                rootCategories.add(vo);
            } else {
                ExamCategoryVo parent = categoryMap.get(vo.getParentId());
                if (parent != null) {
                    parent.getChildren().add(vo);
                }
            }
        }

        // 递归计算每个分类的总题目数量（包括子分类）
        calculateTotalQuestionCountForVo(rootCategories);

        return rootCategories;
    }

    /**
     * 递归计算每个分类的总题目数量（包括子分类的题目数量）- ExamCategoryVo版本
     */
    private void calculateTotalQuestionCountForVo(List<ExamCategoryVo> categories) {
        if (categories == null || categories.isEmpty()) {
            return;
        }
        
        for (ExamCategoryVo category : categories) {
            // 递归计算子分类的总题目数量
            if (category.getChildren() != null && !category.getChildren().isEmpty()) {
                calculateTotalQuestionCountForVo(category.getChildren());
                
                // 计算子分类的总题目数量
                Long childrenTotalCount = category.getChildren().stream()
                        .mapToLong(child -> child.getQuestionCount() != null ? child.getQuestionCount() : 0)
                        .sum();
                
                // 当前分类的总题目数量 = 自身题目数量 + 子分类总题目数量
                Long selfCount = category.getQuestionCount() != null ? category.getQuestionCount() : 0;
                category.setQuestionCount(selfCount + childrenTotalCount);
            }
        }
    }

    private List<CategoryCount> buildCategoryCountTree() {
        // 获取所有分类，按层级和排序顺序排序
        List<ExamCategory> allCategories = examCategoryMapper.selectListByQuery(
                QueryWrapper.create()
                        .where(EXAM_CATEGORY.STATUS.eq("1"))
                        .orderBy(EXAM_CATEGORY.LEVEL.asc(), EXAM_CATEGORY.SORT_ORDER.asc(), EXAM_CATEGORY.CATEGORY_NAME.asc())
        );

        Map<String, CategoryCount> categoryMap = new HashMap<>();
        List<CategoryCount> rootCategories = new ArrayList<>();

        // 转换为CategoryCount对象并获取题目数量
        for (ExamCategory category : allCategories) {
            CategoryCount categoryCount = new CategoryCount();
            categoryCount.setCategoryId(category.getCategoryId());
            categoryCount.setCategoryName(category.getCategoryName());
            categoryCount.setCategoryCode(category.getCategoryCode());
            categoryCount.setParentId(category.getParentId());
            categoryCount.setLevel(category.getLevel());
            categoryCount.setSortOrder(category.getSortOrder());
            categoryCount.setChildren(new ArrayList<>());
            
            // 获取该分类的题目数量
            Long questionCount = examQuestionMapper.selectCountByQuery(
                    QueryWrapper.create()
                            .where(EXAM_QUESTION.CATEGORY_ID.eq(category.getCategoryId()))
                            .and(EXAM_QUESTION.STATUS.eq("1"))
            );
            categoryCount.setQuestionCount(questionCount);
            
            categoryMap.put(category.getCategoryId(), categoryCount);
        }

        // 构建树形结构
        for (CategoryCount categoryCount : categoryMap.values()) {
            if (categoryCount.getParentId() == null || categoryCount.getParentId().isEmpty()) {
                rootCategories.add(categoryCount);
            } else {
                CategoryCount parent = categoryMap.get(categoryCount.getParentId());
                if (parent != null) {
                    parent.getChildren().add(categoryCount);
                }
            }
        }

        // 对每个层级的子分类进行排序
        sortCategoryTree(rootCategories);

        // 递归计算每个分类的总题目数量（包括子分类）
        calculateTotalQuestionCount(rootCategories);

        return rootCategories;
    }

    /**
     * 递归计算每个分类的总题目数量（包括子分类的题目数量）
     */
    private void calculateTotalQuestionCount(List<CategoryCount> categories) {
        if (categories == null || categories.isEmpty()) {
            return;
        }
        
        for (CategoryCount category : categories) {
            // 递归计算子分类的总题目数量
            if (category.getChildren() != null && !category.getChildren().isEmpty()) {
                calculateTotalQuestionCount(category.getChildren());
                
                // 计算子分类的总题目数量
                Long childrenTotalCount = category.getChildren().stream()
                        .mapToLong(child -> child.getQuestionCount() != null ? child.getQuestionCount() : 0)
                        .sum();
                
                // 当前分类的总题目数量 = 自身题目数量 + 子分类总题目数量
                Long selfCount = category.getQuestionCount() != null ? category.getQuestionCount() : 0;
                category.setQuestionCount(selfCount + childrenTotalCount);
            }
        }
    }

    private void sortCategoryTree(List<CategoryCount> categories) {
        if (categories == null || categories.isEmpty()) {
            return;
        }
        
        // 对当前层级进行排序
        categories.sort((a, b) -> {
            if (a.getSortOrder() != null && b.getSortOrder() != null) {
                return a.getSortOrder().compareTo(b.getSortOrder());
            }
            return a.getCategoryName().compareTo(b.getCategoryName());
        });
        
        // 递归对子分类进行排序
        for (CategoryCount category : categories) {
            if (category.getChildren() != null && !category.getChildren().isEmpty()) {
                sortCategoryTree(category.getChildren());
            }
        }
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
        // 检查该配置下是否有试卷
        List<ExamPaper> papers = examPaperMapper.selectListByQuery(
            QueryWrapper.create()
                .where(EXAM_PAPER.CONFIG_ID.eq(id))
                .and(EXAM_PAPER.STATUS.eq("1")) // 只检查启用状态的试卷
        );
        
        if (!papers.isEmpty()) {
            throw new RuntimeException("该考试配置下存在试卷，无法删除。请先删除相关试卷后再删除配置。");
        }
        
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
                EXAM_PAPER.REMARK,
                EXAM_CONFIG.USER_CATEGORY.as("userCategories")
            )
            .from(EXAM_PAPER)
            .leftJoin(EXAM_CATEGORY).on(EXAM_PAPER.CATEGORY_ID.eq(EXAM_CATEGORY.CATEGORY_ID))
            .leftJoin(EXAM_CONFIG).on(EXAM_PAPER.CONFIG_ID.eq(EXAM_CONFIG.CONFIG_ID));
        
        // 试卷名称模糊查询
        if (examPaperQueryDTO.getPaperName() != null && !examPaperQueryDTO.getPaperName().trim().isEmpty()) {
            queryWrapper.and(EXAM_PAPER.PAPER_NAME.like(examPaperQueryDTO.getPaperName().trim()));
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
        // 1. 根据试卷ID查询试卷题目关联表中的所有题目ID和分数
        List<ExamPaperQuestion> paperQuestions = examPaperQuestionMapper.selectListByQuery(
            QueryWrapper.create()
                .where(EXAM_PAPER_QUESTION.PAPER_ID.eq(paperId))
                .orderBy(EXAM_PAPER_QUESTION.QUESTION_ORDER.asc())
        );
        
        if (paperQuestions == null || paperQuestions.isEmpty()) {
            return new ArrayList<>();
        }
        
        // 2. 获取题目ID列表
        List<String> questionIds = paperQuestions.stream()
                .map(ExamPaperQuestion::getQuestionId)
                .collect(Collectors.toList());
        
        // 3. 根据题目ID查询完整的题目信息
        List<ExamQuestion> questions = examQuestionMapper.selectListByQuery(
            QueryWrapper.create()
                .where(EXAM_QUESTION.QUESTION_ID.in(questionIds))
                .and(EXAM_QUESTION.STATUS.eq("1")) // 只查询有效的题目
        );
        
        // 4. 为每个题目设置分数（从试卷题目关联表中获取）
        Map<String, Integer> questionScoreMap = paperQuestions.stream()
                .collect(Collectors.toMap(
                    ExamPaperQuestion::getQuestionId,
                    ExamPaperQuestion::getQuestionScore
                ));
        
        questions.forEach(question -> {
            Integer score = questionScoreMap.get(question.getQuestionId());
            if (score != null) {
                question.setScore(score);
            }
        });
        
        return questions;
    }

    public void updateGeneratedPaper(ExamPaperDTO examPaperDTO) {
        examPaperMapper.update(ExamPaper.builder()
                        .status(examPaperDTO.getStatus())
                        .paperId(examPaperDTO.getPaperId())
                .build());
    }

    @Transactional(rollbackFor = Exception.class)
    public void deleteExamPaper(String paperId) {
        // 检查该试卷是否有考试记录
        List<ExamRecord> records = examRecordMapper.selectListByQuery(
            QueryWrapper.create()
                .where(EXAM_RECORD.PAPER_ID.eq(paperId))
        );
        
        if (!records.isEmpty()) {
            throw new RuntimeException("该试卷已有考试记录，无法删除。");
        }
        
        // 删除试卷相关的题目关联
        examPaperQuestionMapper.deleteByQuery(
            QueryWrapper.create()
                .where(EXAM_PAPER_QUESTION.PAPER_ID.eq(paperId))
        );
        
        // 删除试卷
        examPaperMapper.deleteById(paperId);
    }

    public List<ExamPaper> getAvailablePapers(AvailablePaperQueryDTO result) {
        CustomToken customToken = JwtAccessContext.getLoginInfo();
        
        // 获取当前用户的人员类别
        SysUser currentUser = sysUserMapper.selectOneByQuery(QueryWrapper.create()
                .where(SYS_USER.USER_ID.eq(customToken.getUserId())));
        
        if (currentUser == null) {
            return new ArrayList<>();
        }
        
        // 查出所有试卷，并根据人员类别进行过滤（支持多选）
        List<ExamPaper> papers = examPaperMapper.selectListByQuery(QueryWrapper.create()
                .select(EXAM_PAPER.ALL_COLUMNS, EXAM_CONFIG.USER_CATEGORY.as("userCategories"))
                .from(EXAM_PAPER)
                .leftJoin(EXAM_CONFIG).on(EXAM_PAPER.CONFIG_ID.eq(EXAM_CONFIG.CONFIG_ID))
                .where(EXAM_PAPER.STATUS.eq("1"))
                .and(EXAM_CONFIG.USER_CATEGORY.like(currentUser.getUserCategory())));
        
        // 注意：userCategories 字段现在通过 ExamPaperVo 传递，不需要在 ExamPaper 实体中设置
        
        //查出所有参加考试的记录（包括重考记录）
        List<ExamRecord> records = examRecordMapper.selectListByQuery(QueryWrapper.create()
                .where(EXAM_RECORD.USER_ID.eq(customToken.getUserId()))
                .orderBy(EXAM_RECORD.END_TIME.desc()));

        //查出该用户的强制重考配置
        List<ExamForceRetake> forceRetakes = examForceRetakeMapper.selectListByQuery(QueryWrapper.create()
                .where(EXAM_FORCE_RETAKE.USER_ID.eq(customToken.getUserId()))
                .and(EXAM_FORCE_RETAKE.FORCE_RETAKE.eq(1)));

        papers.forEach(paper -> {
            // 检查是否有强制重考配置
            boolean hasForceRetake = forceRetakes.stream()
                    .anyMatch(forceRetake -> paper.getPaperId().equals(forceRetake.getPaperId()));
            
            // 找到该试卷的最新考试记录
            ExamRecord latestRecord = records.stream()
                    .filter(record -> paper.getPaperId().equals(record.getPaperId()))
                    .findFirst()
                    .orElse(null);
            
            if (latestRecord == null) {
                // 未考试的情况
                if (hasForceRetake) {
                    paper.setStatus("pending"); // 未考试 + 管理员安排重考 = 可以考试
                } else {
                    paper.setStatus("notStarted"); // 未考试 + 无重考安排 = 不能考试
                }
            } else {
                // 已考试的情况
                if ("in-progress".equals(latestRecord.getStatus())) {
                    paper.setStatus("in-progress"); // 进行中
                } else if ("completed".equals(latestRecord.getStatus())) {
                    if (hasForceRetake) {
                        paper.setStatus("pending"); // 已完成 + 管理员安排重考 = 可以重考
                    } else {
                        paper.setStatus("completed"); // 已完成 + 无重考安排 = 不能重考
                    }
                } else if ("timeout".equals(latestRecord.getStatus())) {
                    if (hasForceRetake) {
                        paper.setStatus("pending"); // 超时 + 管理员安排重考 = 可以重考
                    } else {
                        paper.setStatus("timeout"); // 超时 + 无重考安排 = 不能重考
                    }
                } else {
                    if (hasForceRetake) {
                        paper.setStatus("pending"); // 其他状态 + 管理员安排重考 = 可以重考
                    } else {
                        paper.setStatus("completed"); // 其他状态都视为已完成
                    }
                }
            }
        });
        return papers;
    }

    /**
     * 设置特定用户的试卷强制重考标识（完成后自动复位）
     * @param userId 用户ID
     * @param paperId 试卷ID
     */
    public void setForceRetake(String userId, String paperId) {
        // 检查是否已存在配置
        ExamForceRetake existing = examForceRetakeMapper.selectOneByQuery(
            QueryWrapper.create()
                .where(EXAM_FORCE_RETAKE.USER_ID.eq(userId))
                .and(EXAM_FORCE_RETAKE.PAPER_ID.eq(paperId))
        );
        
        if (existing != null) {
            // 更新现有配置
            existing.setForceRetake(1);
            examForceRetakeMapper.update(existing);
        } else {
            // 创建新配置
            ExamForceRetake forceRetake = ExamForceRetake.builder()
                    .userId(userId)
                    .paperId(paperId)
                    .forceRetake(1)
                    .createBy(JwtAccessContext.getLoginInfo().getUserName())
                    .build();
            examForceRetakeMapper.insert(forceRetake);
        }
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

        // 获取层级结构的分类统计
        List<CategoryCount> categorySummary = buildCategoryCountTree();

        return DashboardVo.builder()
                .questionCount((int) examQuestionCount)
                .examResultCountToday((int)examResultCountToday)
                .categoryCount((int)categoryCount)
                .avgExamScore(avgExamScore== null ? BigDecimal.ZERO : new BigDecimal(avgExamScore.toString()).setScale(2, RoundingMode.HALF_UP))
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

        // 获取分类树形结构
        List<ExamCategoryVo> categoryTree = getCategoriesTree();

        return Options.builder()
                .roles(roleMap)
                .categories(categoryTree)
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
        // 1. 根据试卷ID查询试卷题目关联表中的所有题目ID和分数
        List<ExamPaperQuestion> paperQuestions = examPaperQuestionMapper.selectListByQuery(
            QueryWrapper.create()
                .where(EXAM_PAPER_QUESTION.PAPER_ID.eq(paperId))
                .orderBy(EXAM_PAPER_QUESTION.QUESTION_ORDER.asc())
        );
        
        if (paperQuestions == null || paperQuestions.isEmpty()) {
            return new ArrayList<>();
        }
        
        // 2. 获取题目ID列表
        List<String> questionIds = paperQuestions.stream()
                .map(ExamPaperQuestion::getQuestionId)
                .collect(Collectors.toList());
        
        // 3. 根据题目ID查询完整的题目信息
        List<ExamQuestion> questions = examQuestionMapper.selectListByQuery(
            QueryWrapper.create()
                .where(EXAM_QUESTION.QUESTION_ID.in(questionIds))
                .and(EXAM_QUESTION.STATUS.eq("1")) // 只查询有效的题目
        );
        
        // 4. 为每个题目设置分数（从试卷题目关联表中获取）
        Map<String, Integer> questionScoreMap = paperQuestions.stream()
                .collect(Collectors.toMap(
                    ExamPaperQuestion::getQuestionId,
                    ExamPaperQuestion::getQuestionScore
                ));
        
        questions.forEach(question -> {
            Integer score = questionScoreMap.get(question.getQuestionId());
            if (score != null) {
                question.setScore(score);
            }
        });
        
        // 5. 随机打乱题目顺序
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

    // 获取试卷考试情况统计
    public PaperExamStatusDTO getPaperExamStatus(String paperId) {
        // 1. 获取试卷信息
        ExamPaper paper = examPaperMapper.selectOneByQuery(
            QueryWrapper.create()
                .where(EXAM_PAPER.PAPER_ID.eq(paperId))
        );
        
        if (paper == null) {
            throw new RuntimeException("试卷不存在");
        }
        
        // 2. 获取试卷对应的人员类别
        ExamConfig config = examConfigMapper.selectOneByQuery(
            QueryWrapper.create()
                .where(EXAM_CONFIG.CONFIG_ID.eq(paper.getConfigId()))
        );
        
        if (config == null) {
            throw new RuntimeException("考试配置不存在");
        }
        
        // 3. 统计该人员类别下的总用户数（支持多选）
        String[] allowedCategories = config.getUserCategory().split(",");
        Long totalUsers = sysUserMapper.selectCountByQuery(
            QueryWrapper.create()
                .where(SYS_USER.USER_CATEGORY.in(allowedCategories))
                .and(SYS_USER.STATUS.eq("1"))
                .and(SYS_USER.ROLE.eq("student"))
        );
        
        // 4. 统计已考试的用户数（去重）
        List<Object> examedUserIds = examRecordMapper.selectObjectListByQuery(
            QueryWrapper.create()
                .select(EXAM_RECORD.USER_ID)
                .from(EXAM_RECORD)
                .leftJoin(SYS_USER).on(EXAM_RECORD.USER_ID.eq(SYS_USER.USER_ID))
                .where(EXAM_RECORD.PAPER_ID.eq(paperId))
                .and(SYS_USER.USER_CATEGORY.eq(config.getUserCategory()))
                .and(EXAM_RECORD.STATUS.eq("completed"))
                .groupBy(EXAM_RECORD.USER_ID)
        );
        Long examedUsers = (long) examedUserIds.size();
        
        // 5. 计算未考试用户数
        Integer notExamedUsers = totalUsers.intValue() - examedUsers.intValue();
        
        // 6. 计算考试率
        Double examRate = totalUsers > 0 ? (examedUsers.doubleValue() / totalUsers.doubleValue()) * 100 : 0.0;
        
        return PaperExamStatusDTO.builder()
                .paperId(paperId)
                .paperName(paper.getPaperName())
                .userCategory(config.getUserCategory())
                .totalUsers(totalUsers.intValue())
                .examedUsers(examedUsers.intValue())
                .notExamedUsers(notExamedUsers)
                .examRate(Math.round(examRate * 100.0) / 100.0)
                .build();
    }
    
    // 获取试卷考试详细情况
    public List<PaperExamDetailVo> getPaperExamDetail(String paperId) {
        // 1. 获取试卷对应的人员类别
        ExamConfig config = examConfigMapper.selectOneByQuery(
            QueryWrapper.create()
                .from(EXAM_CONFIG)
                .leftJoin(EXAM_PAPER).on(EXAM_CONFIG.CONFIG_ID.eq(EXAM_PAPER.CONFIG_ID))
                .where(EXAM_PAPER.PAPER_ID.eq(paperId))
        );
        
        if (config == null) {
            throw new RuntimeException("考试配置不存在");
        }
        
        // 2. 获取该人员类别下的所有用户（支持多选）
        List<SysUser> allUsers = sysUserMapper.selectListByQuery(
            QueryWrapper.create()
                .where(SYS_USER.USER_CATEGORY.in(config.getUserCategory().split(",")))
                .and(SYS_USER.STATUS.eq("1"))
                .and(SYS_USER.ROLE.eq("student"))
        );
        
        // 3. 获取已考试的用户记录，按用户ID和结束时间排序
        List<ExamRecord> examRecords = examRecordMapper.selectListByQuery(
            QueryWrapper.create()
                .where(EXAM_RECORD.PAPER_ID.eq(paperId))
                .and(EXAM_RECORD.STATUS.eq("completed"))
                .orderBy(EXAM_RECORD.USER_ID.asc(), EXAM_RECORD.END_TIME.desc())
        );
        
        // 4. 创建已考试用户的映射，如果有重复用户，取最新的考试记录
        Map<String, ExamRecord> examedUserMap = examRecords.stream()
                .collect(Collectors.toMap(
                    ExamRecord::getUserId, 
                    record -> record,
                    (existing, replacement) -> {
                        // 如果有重复的userId，保留最新的考试记录（按endTime排序）
                        if (existing.getEndTime() != null && replacement.getEndTime() != null) {
                            return existing.getEndTime().after(replacement.getEndTime()) ? existing : replacement;
                        } else if (existing.getEndTime() != null) {
                            return existing;
                        } else {
                            return replacement;
                        }
                    }
                ));
        
        // 5. 构建结果列表
        List<PaperExamDetailVo> result = new ArrayList<>();
        
        for (SysUser user : allUsers) {
            PaperExamDetailVo detail = new PaperExamDetailVo();
            detail.setUserId(user.getUserId());
            detail.setUserName(user.getUserName());
            detail.setIdNumber(user.getIdNumber());
            detail.setDepartment(user.getDepartment());
            detail.setUserCategory(user.getUserCategory());
            
            ExamRecord examRecord = examedUserMap.get(user.getUserId());
            if (examRecord != null) {
                // 已考试
                detail.setExamStatus("已考试");
                detail.setExamDate(examRecord.getEndTime() != null ? 
                    new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(examRecord.getEndTime()) : "");
                detail.setScore(examRecord.getScore());
                detail.setStatus(examRecord.getStatus());
            } else {
                // 未考试
                detail.setExamStatus("未考试");
                detail.setExamDate("");
                detail.setScore(null);
                detail.setStatus("");
            }
            
            result.add(detail);
        }
        
        // 6. 按考试状态和姓名排序
        result.sort((a, b) -> {
            // 先按考试状态排序（未考试的在前）
            int statusCompare = a.getExamStatus().compareTo(b.getExamStatus());
            if (statusCompare != 0) {
                return statusCompare;
            }
            // 再按姓名排序
            return a.getUserName().compareTo(b.getUserName());
        });
        
        return result;
    }

    /**
     * 获取考试结果数据用于导出（不分页）
     * @param request 查询条件
     * @return 考试结果列表
     */
    private List<ExamResultVo> getExamResultsForExport(ExamResultQueryDTO request) {
        // 如果是不及格筛选，需要特殊处理
        if ("fail".equals(request.getPassStatus())) {
            return getLatestFailedExamResultsForExport(request);
        }
        
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select(EXAM_RECORD.RECORD_ID,SYS_USER.USER_NAME,SYS_USER.DEPARTMENT.as("categoryName"),SYS_USER.USER_CATEGORY,SYS_USER.ID_NUMBER,EXAM_RECORD.EXAM_NAME
                        ,EXAM_RECORD.END_TIME.as("examDate"),EXAM_RECORD.DURATION,EXAM_RECORD.SCORE,EXAM_RECORD.TOTAL_SCORE,EXAM_RECORD.STATUS,EXAM_RECORD.RETAKE,EXAM_RECORD.PASS_SCORE)
                .leftJoin(SYS_USER).on(SYS_USER.USER_ID.eq(EXAM_RECORD.USER_ID))
                .leftJoin(EXAM_PAPER).on(EXAM_PAPER.PAPER_ID.eq(EXAM_RECORD.PAPER_ID))
                .leftJoin(EXAM_CONFIG).on(EXAM_CONFIG.CONFIG_ID.eq(EXAM_PAPER.CONFIG_ID))
                .where(EXAM_RECORD.STATUS.ne("in-progress")); // 导出时排除进行中的考试
        
        // 添加关键词筛选 - 导出时处理空值
        if (request.getKeyword() != null && !request.getKeyword().trim().isEmpty()) {
            queryWrapper.and(SYS_USER.USER_NAME.like(request.getKeyword()).or(SYS_USER.ID_NUMBER.like(request.getKeyword())));
        }
        
        // 添加分类筛选 - 导出时处理"all"值
        if (request.getCategory() != null && !request.getCategory().trim().isEmpty() && !"all".equals(request.getCategory())) {
            queryWrapper.and(EXAM_PAPER.CATEGORY_ID.eq(request.getCategory()));
        }
        
        // 添加状态筛选 - 导出时处理"all"值，但排除in-progress
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty() && !"all".equals(request.getStatus())) {
            queryWrapper.and(EXAM_RECORD.STATUS.eq(request.getStatus()));
        }
        
        // 添加及格筛选
        if ("pass".equals(request.getPassStatus())) {
            queryWrapper.and(EXAM_RECORD.SCORE.ge(EXAM_RECORD.PASS_SCORE));
        }
        
        // 添加重考筛选
        if ("retake".equals(request.getRetakeStatus())) {
            queryWrapper.and(EXAM_RECORD.RETAKE.eq(1));
        } else if ("normal".equals(request.getRetakeStatus())) {
            queryWrapper.and(EXAM_RECORD.RETAKE.eq(0));
        }
        
        // 添加考试名称筛选
        if (request.getExamName() != null && !request.getExamName().trim().isEmpty()) {
            queryWrapper.and(EXAM_RECORD.EXAM_NAME.like(request.getExamName()));
        }
        
        // 查询所有数据（不分页）
        List<ExamResultVo> results = examRecordMapper.selectListByQueryAs(
                queryWrapper.orderBy(EXAM_RECORD.END_TIME.desc()),
                ExamResultVo.class);
        
        // 转换重考字段显示
        for (ExamResultVo result : results) {
            if (result.getRetake() != null) {
                result.setRetake(result.getRetake().equals("1") ? "是" : "否");
            }
        }
        
        return results;
    }

    /**
     * 获取不及格考试结果数据用于导出（不分页）
     * @param request 查询条件
     * @return 考试结果列表
     */
    private List<ExamResultVo> getLatestFailedExamResultsForExport(ExamResultQueryDTO request) {
        try {
            // 构建基础查询条件
            StringBuilder whereClause = new StringBuilder();
            List<Object> params = new ArrayList<>();
            
            if (request.getStatus() != null && !request.getStatus().trim().isEmpty() && !"all".equals(request.getStatus())) {
                whereClause.append(" er.status = ?");
                params.add(request.getStatus());
            } else {
                whereClause.append(" 1=1 "); // 没有状态条件时，防止SQL语法错误
            }
            
            // 只有当keyword不为空时才添加keyword条件
            if (request.getKeyword() != null && !request.getKeyword().trim().isEmpty()) {
                whereClause.append(" AND (su.user_name LIKE ? OR su.id_number LIKE ?)");
                params.add("%" + request.getKeyword() + "%");
                params.add("%" + request.getKeyword() + "%");
            }
            
            // 添加分类筛选 - 导出时处理"all"值
            if (request.getCategory() != null && !request.getCategory().trim().isEmpty() && !"all".equals(request.getCategory())) {
                whereClause.append(" AND ep.category_id = ?");
                params.add(request.getCategory());
            }
            
            // 添加重考筛选
            if ("retake".equals(request.getRetakeStatus())) {
                whereClause.append(" AND er.retake = 1");
            } else if ("normal".equals(request.getRetakeStatus())) {
                whereClause.append(" AND er.retake = 0");
            }
            
            // 添加考试名称筛选
            if (request.getExamName() != null && !request.getExamName().trim().isEmpty()) {
                whereClause.append(" AND er.exam_name LIKE ?");
                params.add("%" + request.getExamName() + "%");
            }
            
            // 构建完整查询SQL（不分页）
            String dataSql = """
                SELECT er.record_id, su.user_name, su.department as categoryName, su.user_category, su.id_number, er.exam_name, 
                       er.end_time as examDate, er.duration, er.score, er.total_score, er.status, er.retake, er.pass_score
                FROM exam_record er 
                LEFT JOIN sys_user su ON su.user_id = er.user_id 
                LEFT JOIN exam_paper ep ON ep.paper_id = er.paper_id 
                LEFT JOIN exam_config ec ON ec.config_id = ep.config_id 
                WHERE er.record_id IN ( 
                    SELECT er2.record_id 
                    FROM exam_record er2 
                    WHERE er2.user_id = er.user_id 
                    AND er2.exam_name = er.exam_name 
                    AND er2.status = 'completed' 
                    AND er2.end_time = ( 
                        SELECT MAX(er3.end_time) 
                        FROM exam_record er3 
                        WHERE er3.user_id = er2.user_id 
                        AND er3.exam_name = er2.exam_name 
                        AND er3.status = 'completed' 
                    ) 
                    AND er2.score < er2.pass_score 
                ) 
                AND """ + whereClause + """
                ORDER BY er.end_time DESC
                """;
            
            // 执行查询
            List<Row> rows = Db.selectListBySql(dataSql, params.toArray());
            List<ExamResultVo> results = rows.stream()
                    .map(row -> RowUtil.toEntity(row, ExamResultVo.class))
                    .collect(Collectors.toList());
            
            // 转换重考字段显示
            for (ExamResultVo result : results) {
                if (result.getRetake() != null) {
                    result.setRetake(result.getRetake().equals("1") ? "是" : "否");
                }
            }
            
            return results;
        } catch (Exception e) {
            log.error("查询不及格考试结果失败", e);
            return new ArrayList<>();
        }
    }

    /**
     * 导出考试结果到Excel
     * @param request 查询条件
     * @param response HTTP响应
     */
    public void exportExamResults(ExamResultQueryDTO request, HttpServletResponse response) {
        ExcelWriter writer = null;
        try {
            // 获取完整数据 - 使用专门的导出查询方法
            List<ExamResultVo> results = getExamResultsForExport(request);
            
            // 生成带时间戳的英文文件名
            String timestamp = new java.text.SimpleDateFormat("yyyyMMdd_HHmmss").format(new java.util.Date());
            String filename = "exam_results_" + timestamp + ".xlsx";
            
            // 设置响应头，确保Windows环境下的编码兼容性
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8");
            response.setCharacterEncoding("UTF-8");
            // Windows环境下使用URL编码处理中文文件名
            String encodedFilename = java.net.URLEncoder.encode(filename, "UTF-8");
            response.setHeader("Content-Disposition", "attachment;filename*=UTF-8''" + encodedFilename);
            
            // 创建ExcelWriter，指定为xlsx格式
            writer = ExcelUtil.getWriter(true);
            
            // 设置表头
            writer.addHeaderAlias("userName", "姓名");
            writer.addHeaderAlias("idNumber", "身份证号");
            writer.addHeaderAlias("examName", "考试名称");
            writer.addHeaderAlias("categoryName", "题目分类");
            writer.addHeaderAlias("userCategory", "人员类别");
            writer.addHeaderAlias("score", "得分");
            writer.addHeaderAlias("totalScore", "总分");
            writer.addHeaderAlias("duration", "用时(分钟)");
            writer.addHeaderAlias("examDate", "完成时间");
            writer.addHeaderAlias("status", "状态");
            writer.addHeaderAlias("retake", "重考");
            
            // 写入数据
            writer.write(results, true);
            
            // 自适应列宽
            writer.autoSizeColumnAll();
            
            // 将Excel文件写入响应流
            writer.flush(response.getOutputStream());
            
            log.info("考试结果导出成功，共导出{}条记录", results.size());
            
        } catch (Exception e) {
            log.error("导出考试结果失败", e);
            throw new CustomException("导出考试结果失败: " + e.getMessage());
        } finally {
            // 确保资源被正确关闭
            if (writer != null) {
                try {
                    writer.close();
                } catch (Exception e) {
                    log.error("关闭ExcelWriter失败", e);
                }
            }
        }
    }

    /**
     * 导出试卷人员列表到Excel
     * @param paperId 试卷ID
     * @param response HTTP响应
     */
    public void exportPaperPersonnelList(String paperId, HttpServletResponse response) {
        ExcelWriter writer = null;
        try {
            // 获取人员列表数据
            List<PaperExamDetailVo> personnelList = getPaperExamDetail(paperId);
            
            // 生成带时间戳的英文文件名
            String timestamp = new java.text.SimpleDateFormat("yyyyMMdd_HHmmss").format(new java.util.Date());
            String filename = "personnel_list_" + paperId + "_" + timestamp + ".xlsx";
            
            // 设置响应头，确保Windows环境下的编码兼容性
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8");
            response.setCharacterEncoding("UTF-8");
            // Windows环境下使用URL编码处理中文文件名
            String encodedFilename = java.net.URLEncoder.encode(filename, "UTF-8");
            response.setHeader("Content-Disposition", "attachment;filename*=UTF-8''" + encodedFilename);
            
            // 创建ExcelWriter，指定为xlsx格式
            writer = ExcelUtil.getWriter(true);
            
            // 设置表头 - 根据PaperExamDetailVo的实际字段，移除userId和status
            writer.addHeaderAlias("userName", "姓名");
            writer.addHeaderAlias("idNumber", "身份证号");
            writer.addHeaderAlias("department", "部门");
            writer.addHeaderAlias("userCategory", "人员类别");
            writer.addHeaderAlias("examStatus", "考试状态");
            writer.addHeaderAlias("examDate", "考试日期");
            writer.addHeaderAlias("score", "分数");
            
            // 排除不需要导出的字段
            writer.setOnlyAlias(true);
            
            // 写入数据
            writer.write(personnelList, true);
            
            // 自适应列宽
            writer.autoSizeColumnAll();
            
            // 将Excel文件写入响应流
            writer.flush(response.getOutputStream());
            
            log.info("人员列表导出成功，共导出{}条记录", personnelList.size());
            
        } catch (Exception e) {
            log.error("导出人员列表失败", e);
            throw new CustomException("导出人员列表失败: " + e.getMessage());
        } finally {
            // 确保资源被正确关闭
            if (writer != null) {
                try {
                    writer.close();
                } catch (Exception e) {
                    log.error("关闭ExcelWriter失败", e);
                }
            }
        }
    }

}
