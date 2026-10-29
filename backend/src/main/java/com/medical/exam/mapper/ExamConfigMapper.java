package com.medical.exam.mapper;

import com.medical.exam.entity.ExamConfig;
import com.mybatisflex.core.BaseMapper;
import com.mybatisflex.core.logicdelete.LogicDeleteManager;
import com.mybatisflex.core.query.QueryWrapper;
import org.apache.ibatis.annotations.Mapper;

import static com.medical.exam.entity.table.ExamConfigTableDef.EXAM_CONFIG;
import static com.medical.exam.entity.table.ExamPaperTableDef.EXAM_PAPER;

@Mapper
public interface ExamConfigMapper extends BaseMapper<ExamConfig> {

    /**
     * 取试卷对应的考试配置。试卷生成后配置就是它的考试规则（人员类别、及格分等），
     * 因此即使配置已被逻辑删除也要能取到，否则已生成的试卷无法查看考试情况、开考或交卷。
     */
    default ExamConfig selectByPaperId(String paperId) {
        return LogicDeleteManager.execWithoutLogicDelete(() -> selectOneByQuery(
                QueryWrapper.create()
                        .select(EXAM_CONFIG.ALL_COLUMNS)
                        .from(EXAM_CONFIG)
                        .innerJoin(EXAM_PAPER).on(EXAM_CONFIG.CONFIG_ID.eq(EXAM_PAPER.CONFIG_ID))
                        .where(EXAM_PAPER.PAPER_ID.eq(paperId))));
    }
}
