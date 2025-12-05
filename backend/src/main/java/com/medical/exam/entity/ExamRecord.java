package com.medical.exam.entity;

import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.KeyType;
import com.mybatisflex.annotation.Table;
import com.mybatisflex.core.keygen.KeyGenerators;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Builder;
import java.util.Date;
import com.mybatisflex.annotation.Column;
import lombok.NoArgsConstructor;

@Data
@Builder
@Table("exam_record")
@NoArgsConstructor
@AllArgsConstructor
public class ExamRecord {
    
    @Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
    private String recordId;
    private String userId;
    private String paperId;
    private String examName;
    private Date startTime;
    private Date endTime;
    private Integer duration;
    private Integer totalScore;
    private Integer score;
    private Integer passScore;

    //状态(pending:待开始,in-progress:进行中,completed:已完成,timeout:超时)
    private String status;
    private String createDept;
    private String createBy;
    @Column(onInsertValue = "now()")
    private Date createTime;
    private String updateBy;
    @Column(onUpdateValue = "now()")
    private Date updateTime;
    private String remark;
    // 0 正常 1 作废
    private Integer retake;
    // 逻辑删除标识
    @Column(isLogicDelete = true)
    private Boolean deleted;
}
