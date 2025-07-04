package com.medical.exam.service;

import com.medical.exam.dto.AnswerDTO;
import com.medical.exam.dto.StartExamDTO;
import com.medical.exam.dto.SubmitExamRequest;
import com.medical.exam.entity.ExamRecord;
import com.medical.exam.entity.ExamAnswer;
import com.medical.exam.entity.ExamQuestion;
import com.medical.exam.entity.SysLog;
import com.medical.exam.entity.table.ExamRecordTableDef;
import com.medical.exam.mapper.ExamRecordMapper;
import com.medical.exam.mapper.ExamAnswerMapper;
import com.medical.exam.mapper.ExamQuestionMapper;
import com.medical.exam.mapper.SysLogMapper;
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
    private SysLogMapper sysLogMapper;

    public String startExam(StartExamDTO startExamDTO) {
        CustomToken customToken = JwtAccessContext.getLoginInfo();
        
        //查询有没有考试记录,这里有几种情况，1-考试记录不存在，新建，2-考试记录存在但未完成，页面刷新了，更新创建时间
        // 3-重考了 retake=1 这种情况会查不到。
        List<ExamRecord> examRecords =  examRecordMapper.selectListByQuery(QueryWrapper.create()
                .where(EXAM_RECORD.USER_ID.eq(customToken.getUserId()))
                .and(EXAM_RECORD.PAPER_ID.eq(startExamDTO.getPaperId()))
                .and(EXAM_RECORD.RETAKE.eq(0))
        );
        String recordId = "";
        if(examRecords.isEmpty()){
            ExamRecord record = ExamRecord.builder()
                    .userId(customToken.getUserId())
                    .paperId(startExamDTO.getPaperId())
                    //试卷名称
                    .examName(startExamDTO.getExamName())
                    .startTime(new Date())
                    .passScore(startExamDTO.getPassScore())
                    // 默认及格分60分
                    .status("in-progress")
                    .retake(0)
                    .build();
            examRecordMapper.insert(record);
            recordId = record.getRecordId();
        }else{
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

    @Transactional
    public void submitExam(SubmitExamRequest request) {
        CustomToken customToken = JwtAccessContext.getLoginInfo();
        
        // 1. 查找并验证考试记录
        ExamRecord record = examRecordMapper.selectOneByQuery(
                QueryWrapper.create()
                        .where(EXAM_RECORD.RECORD_ID.eq(request.getRecordId()))
                        .and(EXAM_RECORD.USER_ID.eq(customToken.getUserId()))
                        .and(EXAM_RECORD.STATUS.eq("in-progress"))
        );
        
        if (record == null) {
            throw new RuntimeException("考试记录不存在或不属于当前用户");
        }
        
        if (!"in-progress".equals(record.getStatus())) {
            throw new RuntimeException("考试记录状态不正确");
        }
        
        // 2. 计算每题得分并保存答题详情
        int totalScore = 0;
        int correctCount = 0;
        
        for (AnswerDTO answerDto : request.getAnswers()) {
            // 获取题目信息
            ExamQuestion question = examQuestionMapper.selectOneByQuery(
                QueryWrapper.create().where(EXAM_QUESTION.QUESTION_ID.eq(answerDto.getQuestionId()))
            );
            
            if (question != null) {
                boolean isCorrect = answerDto.getUserAnswer().equals(question.getCorrectAnswer());
                int score = isCorrect ? question.getScore() : 0;
                
                if (isCorrect) {
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
        
        // 3. 更新考试记录
        record.setScore(totalScore);
        record.setStatus("completed");
        record.setEndTime(new Date());
        record.setDuration((int) ((new Date().getTime() - record.getStartTime().getTime()) / (1000 * 60)));
        examRecordMapper.update(record);

        log.info("考试提交成功，记录ID: {}, 得分: {}, 正确题数: {}", request.getRecordId(), totalScore, correctCount);
        sysLogMapper.insert(SysLog.builder()
                .userId(customToken.getUserId())
                .userName(customToken.getUserName())
                .content("提交考试")
                .build());
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
