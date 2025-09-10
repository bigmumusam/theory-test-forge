package com.medical.exam.service;

import com.medical.exam.dto.AnswerDTO;
import com.medical.exam.dto.StartExamDTO;
import com.medical.exam.dto.SubmitExamRequest;
import com.medical.exam.entity.ExamRecord;
import com.medical.exam.entity.ExamAnswer;
import com.medical.exam.entity.ExamQuestion;
import com.medical.exam.entity.ExamConfig;
import com.medical.exam.entity.ExamPaper;
import com.medical.exam.entity.ExamForceRetake;
import com.medical.exam.entity.SysLog;
import com.medical.exam.entity.SysUser;
import com.medical.exam.mapper.ExamRecordMapper;
import com.medical.exam.mapper.ExamAnswerMapper;
import com.medical.exam.mapper.ExamQuestionMapper;
import com.medical.exam.mapper.ExamConfigMapper;
import com.medical.exam.mapper.ExamPaperMapper;
import com.medical.exam.mapper.ExamForceRetakeMapper;
import com.medical.exam.mapper.SysLogMapper;
import com.medical.exam.mapper.SysUserMapper;
import com.medical.exam.security.JwtAccessContext;
import com.medical.exam.vo.CustomToken;
import com.mybatisflex.core.query.QueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.Resource;
import java.util.*;

import static com.medical.exam.entity.table.ExamRecordTableDef.EXAM_RECORD;
import static com.medical.exam.entity.table.ExamAnswerTableDef.EXAM_ANSWER;
import static com.medical.exam.entity.table.ExamQuestionTableDef.EXAM_QUESTION;
import static com.medical.exam.entity.table.ExamConfigTableDef.EXAM_CONFIG;
import static com.medical.exam.entity.table.ExamPaperTableDef.EXAM_PAPER;
import static com.medical.exam.entity.table.ExamForceRetakeTableDef.EXAM_FORCE_RETAKE;
import static com.medical.exam.entity.table.SysUserTableDef.SYS_USER;

@Service
@Slf4j
public class ExamService {

    @Resource
    private ExamRecordMapper examRecordMapper;
    
    @Resource
    private ExamAnswerMapper examAnswerMapper;
    
    @Resource
    private ExamQuestionMapper examQuestionMapper;

    @Resource
    private ExamConfigMapper examConfigMapper;

    @Resource
    private ExamPaperMapper examPaperMapper;
    @Resource
    private ExamForceRetakeMapper examForceRetakeMapper;

    @Resource
    private SysLogMapper sysLogMapper;
    
    @Resource
    private SysUserMapper sysUserMapper;

    @Transactional(rollbackFor = Exception.class)
    public String startExam(StartExamDTO startExamDTO) {
        CustomToken customToken = JwtAccessContext.getLoginInfo();
        
        // 查询当前用户是否有该试卷的未完成考试记录
        List<ExamRecord> examRecords = examRecordMapper.selectListByQuery(QueryWrapper.create()
                .where(EXAM_RECORD.USER_ID.eq(customToken.getUserId()))
                .and(EXAM_RECORD.PAPER_ID.eq(startExamDTO.getPaperId()))
                .and(EXAM_RECORD.STATUS.eq("in-progress"))
        );
        
        // 获取考试配置信息，用于设置总分
        ExamConfig examConfig = examConfigMapper.selectOneByQuery(
            QueryWrapper.create()
                .from(EXAM_CONFIG)
                .leftJoin(EXAM_PAPER).on(EXAM_CONFIG.CONFIG_ID.eq(EXAM_PAPER.CONFIG_ID))
                .where(EXAM_PAPER.PAPER_ID.eq(startExamDTO.getPaperId()))
        );
        
        if (examConfig == null) {
            throw new RuntimeException("考试配置不存在");
        }
        
        // 验证用户人员类别是否与考试配置匹配
        SysUser currentUser = sysUserMapper.selectOneByQuery(QueryWrapper.create()
                .where(SYS_USER.USER_ID.eq(customToken.getUserId())));
        
        if (currentUser == null) {
            throw new RuntimeException("用户信息不存在");
        }
        
        // 检查用户的人员类别是否在考试配置的人员类别范围内
        String[] allowedCategories = examConfig.getUserCategory().split(",");
        boolean hasPermission = false;
        for (String category : allowedCategories) {
            if (category.trim().equals(currentUser.getUserCategory())) {
                hasPermission = true;
                break;
            }
        }
        
        if (!hasPermission) {
            throw new RuntimeException("您的人员类别不在该考试的允许范围内，无法参加此考试");
        }
        
        String recordId = "";
        if(examRecords.isEmpty()){
            // 检查是否是强制重考
            ExamForceRetake forceRetake = examForceRetakeMapper.selectOneByQuery(
                QueryWrapper.create()
                    .where(EXAM_FORCE_RETAKE.USER_ID.eq(customToken.getUserId()))
                    .and(EXAM_FORCE_RETAKE.PAPER_ID.eq(startExamDTO.getPaperId()))
                    .and(EXAM_FORCE_RETAKE.FORCE_RETAKE.eq(1))
            );
            
            // 创建新的考试记录
            ExamRecord record = ExamRecord.builder()
                    .userId(customToken.getUserId())
                    .paperId(startExamDTO.getPaperId())
                    .examName(startExamDTO.getExamName())
                    .startTime(new Date())
                    .totalScore(examConfig.getTotalScore()) // 从配置中获取总分
                    .passScore(examConfig.getPassScore() != null ? examConfig.getPassScore() : 60) // 使用考试配置中的及格分数
                    .status("in-progress")
                    .retake(forceRetake != null ? 1 : 0) // 如果是强制重考则设置为1，否则为0
                    .build();
            examRecordMapper.insert(record);
            recordId = record.getRecordId();
        }else{
            // 找到已有的考试记录，更新开始时间（页面刷新场景）
            ExamRecord record = examRecords.getFirst();
            record.setStartTime(new Date());
            examRecordMapper.update(record);
            recordId = record.getRecordId();
        }

        sysLogMapper.insert(SysLog.builder()
                        .userId(customToken.getUserId())
                        .userName(customToken.getUserName())
                        .content("开始考试")
                .build());
        return recordId;
    }

    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> submitExam(SubmitExamRequest request) {
        CustomToken customToken = JwtAccessContext.getLoginInfo();
        
        // 1. 使用悲观锁查找并验证考试记录，防止并发提交
        ExamRecord record = examRecordMapper.selectOneByQuery(
                QueryWrapper.create()
                        .where(EXAM_RECORD.RECORD_ID.eq(request.getRecordId()))
                        .and(EXAM_RECORD.USER_ID.eq(customToken.getUserId()))
                        .and(EXAM_RECORD.STATUS.eq("in-progress"))
                        .forUpdate() // 添加行锁防止并发修改
        );
        
        if (record == null) {
            throw new RuntimeException("考试记录不存在或不属于当前用户");
        }
        
        // 2. 再次检查状态，确保在锁保护下状态正确
        if (!"in-progress".equals(record.getStatus())) {
            throw new RuntimeException("考试记录状态不正确，可能已被提交");
        }
        
        // 3. 检查是否已经存在答题记录，防止重复提交
        long answerCount = examAnswerMapper.selectCountByQuery(
            QueryWrapper.create()
                .where(EXAM_ANSWER.RECORD_ID.eq(request.getRecordId()))
        );
        
        if (answerCount > 0) {
            throw new RuntimeException("该考试记录已存在答题数据，请勿重复提交");
        }
        
        // 4. 获取考试配置信息，用于计算分值
        ExamConfig examConfig = examConfigMapper.selectOneByQuery(
            QueryWrapper.create()
                .from(EXAM_CONFIG)
                .leftJoin(EXAM_PAPER).on(EXAM_CONFIG.CONFIG_ID.eq(EXAM_PAPER.CONFIG_ID))
                .where(EXAM_PAPER.PAPER_ID.eq(record.getPaperId()))
        );
        
        if (examConfig == null) {
            throw new RuntimeException("考试配置不存在");
        }
        
        // 5. 计算每题得分并保存答题详情
        int totalScore = 0;
        int correctCount = 0;
        
        for (AnswerDTO answerDto : request.getAnswers()) {
            // 获取题目信息
            ExamQuestion question = examQuestionMapper.selectOneByQuery(
                QueryWrapper.create().where(EXAM_QUESTION.QUESTION_ID.eq(answerDto.getQuestionId()))
            );
            
            if (question != null) {
                boolean isCorrect = answerDto.getUserAnswer().equals(question.getCorrectAnswer());
                
                // 根据题目类型从配置中获取分值
                int score = 0;
                if (isCorrect) {
                    if ("choice".equals(question.getQuestionType())) {
                        score = examConfig.getChoiceScore() != null ? examConfig.getChoiceScore() : 2;
                    } else if ("multi".equals(question.getQuestionType())) {
                        score = examConfig.getMultiScore() != null ? examConfig.getMultiScore() : 4;
                    } else if ("judgment".equals(question.getQuestionType())) {
                        score = examConfig.getJudgmentScore() != null ? examConfig.getJudgmentScore() : 1;
                    }
                    correctCount++;
                }
                
                totalScore += score;
                
                // 保存答题记录
                ExamAnswer answer = ExamAnswer.builder()
                        .recordId(request.getRecordId())
                        .questionId(answerDto.getQuestionId())
                        .userAnswer(answerDto.getUserAnswer())
                        .correctAnswer(question.getCorrectAnswer())
                        .isCorrect(isCorrect ? 1 : 0)
                        .score(score)
                        .createBy(customToken.getUserName())
                        .build();
                
                examAnswerMapper.insert(answer);
            }
        }
        
        // 5. 更新考试记录状态为已完成
        record.setScore(totalScore);
        record.setStatus("completed");
        record.setEndTime(new Date());
        record.setDuration((int) ((new Date().getTime() - record.getStartTime().getTime()) / (1000 * 60)));
        examRecordMapper.update(record);

        // 6. 如果是强制重考，完成后自动复位force_retake标识
        ExamForceRetake forceRetake = examForceRetakeMapper.selectOneByQuery(
            QueryWrapper.create()
                .where(EXAM_FORCE_RETAKE.USER_ID.eq(record.getUserId()))
                .and(EXAM_FORCE_RETAKE.PAPER_ID.eq(record.getPaperId()))
                .and(EXAM_FORCE_RETAKE.FORCE_RETAKE.eq(1))
        );
        if (forceRetake != null) {
            forceRetake.setForceRetake(0); // 复位强制重考标识
            examForceRetakeMapper.update(forceRetake);
            log.info("强制重考完成，已复位用户 {} 试卷 {} 的force_retake标识", record.getUserId(), record.getPaperId());
        }

        log.info("考试提交成功，记录ID: {}, 得分: {}, 正确题数: {}", request.getRecordId(), totalScore, correctCount);
        sysLogMapper.insert(SysLog.builder()
                .userId(customToken.getUserId())
                .userName(customToken.getUserName())
                .content("提交考试")
                .build());
        
        // 返回分数信息给前端
        Map<String, Object> result = new HashMap<>();
        result.put("score", totalScore);
        result.put("totalScore", record.getTotalScore());
        result.put("correctCount", correctCount);
        result.put("totalQuestions", request.getAnswers().size());
        return result;
    }


    // 获取学生考试记录详情
    public Map<String, Object> getStudentExamRecordDetail(String recordId, Long userId) {
        // 查询考试记录
        ExamRecord record = examRecordMapper.selectOneByQuery(
            QueryWrapper.create()
                .where(EXAM_RECORD.RECORD_ID.eq(recordId))
                .and(EXAM_RECORD.USER_ID.eq(userId.toString()))
        );
        
        if (record == null) {
            throw new RuntimeException("考试记录不存在或不属于当前用户");
        }
        
        // 查询答题详情
        List<ExamAnswer> answers = examAnswerMapper.selectListByQuery(
            QueryWrapper.create()
                .where(EXAM_ANSWER.RECORD_ID.eq(recordId))
                .orderBy(EXAM_ANSWER.CREATE_TIME.asc())
        );
        
        // 转换为前端需要的格式
        Map<String, Object> result = new HashMap<>();
        result.put("id", record.getRecordId());
        result.put("examName", record.getExamName());
        result.put("score", record.getScore());
        result.put("totalScore", record.getTotalScore());
        result.put("status", record.getStatus());
        result.put("startTime", record.getStartTime());
        result.put("endTime", record.getEndTime());
        result.put("duration", record.getDuration());
        
        // 答题详情
        List<Map<String, Object>> answerList = new ArrayList<>();
        for (ExamAnswer answer : answers) {
            // 获取题目信息
            ExamQuestion question = examQuestionMapper.selectOneByQuery(
                QueryWrapper.create().where(EXAM_QUESTION.QUESTION_ID.eq(answer.getQuestionId()))
            );
            
            Map<String, Object> answerMap = new HashMap<>();
            answerMap.put("questionId", answer.getQuestionId());
            answerMap.put("questionContent", question != null ? question.getQuestionContent() : "");
            answerMap.put("userAnswer", answer.getUserAnswer());
            answerMap.put("correctAnswer", answer.getCorrectAnswer());
            answerMap.put("isCorrect", answer.getIsCorrect() == 1);
            answerMap.put("score", answer.getScore());
            answerList.add(answerMap);
        }
        result.put("answers", answerList);
        
        return result;
    }
}
