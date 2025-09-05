package com.medical.exam.entity.table;

import com.mybatisflex.core.query.QueryColumn;
import com.mybatisflex.core.table.TableDef;

// Auto generate by mybatis-flex, do not modify it.
public class ExamForceRetakeTableDef extends TableDef {

    public static final ExamForceRetakeTableDef EXAM_FORCE_RETAKE = new ExamForceRetakeTableDef();

    public final QueryColumn REMARK = new QueryColumn(this, "remark");

    public final QueryColumn USER_ID = new QueryColumn(this, "user_id");

    public final QueryColumn PAPER_ID = new QueryColumn(this, "paper_id");

    public final QueryColumn CREATE_BY = new QueryColumn(this, "create_by");

    public final QueryColumn UPDATE_BY = new QueryColumn(this, "update_by");

    public final QueryColumn CREATE_TIME = new QueryColumn(this, "create_time");

    public final QueryColumn UPDATE_TIME = new QueryColumn(this, "update_time");

    public final QueryColumn FORCE_RETAKE = new QueryColumn(this, "force_retake");

    public final QueryColumn FORCE_RETAKE_ID = new QueryColumn(this, "force_retake_id");

    /**
     * 所有字段。
     */
    public final QueryColumn ALL_COLUMNS = new QueryColumn(this, "*");

    /**
     * 默认字段，不包含逻辑删除或者 large 等字段。
     */
    public final QueryColumn[] DEFAULT_COLUMNS = new QueryColumn[]{REMARK, USER_ID, PAPER_ID, CREATE_BY, UPDATE_BY, CREATE_TIME, UPDATE_TIME, FORCE_RETAKE, FORCE_RETAKE_ID};

    public ExamForceRetakeTableDef() {
        super("", "exam_force_retake");
    }

    private ExamForceRetakeTableDef(String schema, String name, String alisa) {
        super(schema, name, alisa);
    }

    public ExamForceRetakeTableDef as(String alias) {
        String key = getNameWithSchema() + "." + alias;
        return getCache(key, k -> new ExamForceRetakeTableDef("", "exam_force_retake", alias));
    }

}
