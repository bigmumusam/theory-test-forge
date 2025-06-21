# 医学理论考试系统 API 接口文档

---

## 目录
1. [认证相关接口](#认证相关接口)
2. [学员端接口](#学员端接口)
3. [管理员端接口](#管理员端接口)
4. [数据结构说明](#数据结构说明)
5. [错误码说明](#错误码说明)
6. [通用响应格式](#通用响应格式)
7. [认证说明](#认证说明)
8. [权限说明](#权限说明)

---

## 1. 认证相关接口

### 1.1 用户登录
- **接口地址**: `POST /api/auth/login`
- **请求参数**:
```json
{
  "idNumber": "110101199001011234",
  "name": "管理员"
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "name": "管理员",
      "idNumber": "110101199001011234",
      "role": "admin",
      "department": "系统管理"
    }
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

### 1.2 用户退出
- **接口地址**: `POST /api/auth/logout`
- **请求头**: `Authorization: Bearer {token}`
- **响应数据**:
```json
{
  "code": 200,
  "message": "退出成功",
  "data": null,
  "timestamp": "2024-01-15T10:30:00"
}
```

---

## 2. 学员端接口

### 2.1 获取可参加的考试列表
- **接口地址**: `GET /api/exam/available`
- **请求头**: `Authorization: Bearer {token}`
- **响应数据**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": "digestive-exam",
      "name": "消化内科理论考试",
      "category": "消化内科",
      "description": "涵盖消化系统疾病的诊断、治疗和护理知识",
      "duration": 30,
      "questionCount": 4,
      "totalScore": 6,
      "difficulty": "中等",
      "available": true
    }
  ],
  "timestamp": "2024-01-15T10:30:00"
}
```

### 2.2 开始考试
- **接口地址**: `POST /api/exam/start`
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
```json
{
  "examId": "digestive-exam",
  "category": "消化内科"
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "考试开始",
  "data": {
    "recordId": "123456",
    "examName": "消化内科理论考试",
    "duration": 30,
    "totalScore": 6,
    "questions": [
      {
        "id": "1",
        "type": "choice",
        "content": "胃溃疡最常见的并发症是？",
        "options": ["穿孔", "出血", "幽门梗阻", "癌变"],
        "score": 2
      }
    ],
    "startTime": "2024-01-15T10:30:00"
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

### 2.3 提交考试
- **接口地址**: `POST /api/exam/submit`
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
```json
{
  "recordId": "123456",
  "answers": [
    {
      "questionId": "1",
      "userAnswer": "1"
    },
    {
      "questionId": "2",
      "userAnswer": "正确"
    }
  ]
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "考试提交成功",
  "data": null,
  "timestamp": "2024-01-15T10:30:00"
}
```

### 2.4 获取考试记录列表（学员）
- **接口地址**: `GET /api/exam/records`
- **请求头**: `Authorization: Bearer {token}`
- **查询参数**:
  - `page`: 页码（默认1）
  - `size`: 每页大小（默认10）
- **响应数据**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "list": [
      {
        "id": "1",
        "examName": "消化内科理论考试",
        "category": "消化内科",
        "score": 85,
        "totalScore": 100,
        "status": "completed",
        "startTime": "2024-01-15 10:30:00",
        "endTime": "2024-01-15 11:00:00"
      }
    ],
    "total": 1,
    "page": 1,
    "size": 10
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

### 2.5 获取考试详情（学员）
- **接口地址**: `GET /api/exam/records/{id}`
- **请求头**: `Authorization: Bearer {token}`
- **响应数据**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": "1",
    "examName": "消化内科理论考试",
    "category": "消化内科",
    "score": 85,
    "totalScore": 100,
    "status": "completed",
    "startTime": "2024-01-15 10:30:00",
    "endTime": "2024-01-15 11:00:00",
    "answers": [
      {
        "questionId": "1",
        "questionContent": "胃溃疡最常见的并发症是？",
        "userAnswer": "1",
        "correctAnswer": "1",
        "isCorrect": true,
        "score": 2
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

### 2.x 分页响应格式建议
所有分页接口建议响应结构如下：
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "list": [ ... ],
    "total": 100,
    "page": 1,
    "size": 10
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

### 2.x 字段说明
- `id`: 主键ID
- `examName`: 考试名称
- `category`: 科室/分类
- `score`: 得分
- `totalScore`: 总分
- `status`: 考试状态（pending, in-progress, completed, timeout）
- `startTime`: 考试开始时间
- `endTime`: 考试结束时间
- `answers`: 答题详情数组
  - `questionId`: 题目ID
  - `questionContent`: 题目内容
  - `userAnswer`: 用户答案
  - `correctAnswer`: 正确答案
  - `isCorrect`: 是否答对
  - `score`: 本题得分

---

## 3. 管理员端接口

### 3.1 用户管理

#### 3.1.1 获取用户列表
- **接口地址**: `GET /api/admin/users`
- **请求头**: `Authorization: Bearer {token}`
- **查询参数**:
  - `role`: 角色筛选（可选）
  - `department`: 科室筛选（可选）
  - `keyword`: 搜索关键词（可选）
  - `page`: 页码（默认1）
  - `size`: 每页大小（默认10）
- **响应数据**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "list": [
      {
        "id": "1",
        "name": "管理员",
        "idNumber": "110101199001011234",
        "role": "admin",
        "department": "系统管理",
        "status": "1",
        "createTime": "2024-01-15 10:00:00"
      }
    ],
    "total": 1,
    "page": 1,
    "size": 10
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

#### 3.1.2 添加用户
- **接口地址**: `POST /api/admin/users`
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
```json
{
  "name": "张医生",
  "idNumber": "110101199001011111",
  "role": "student",
  "department": "消化内科"
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "用户添加成功",
  "data": null,
  "timestamp": "2024-01-15T10:30:00"
}
```

#### 3.1.3 修改用户
- **接口地址**: `PUT /api/admin/users/{id}`
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
```json
{
  "name": "张医生",
  "idNumber": "110101199001011111",
  "role": "student",
  "department": "消化内科",
  "status": "1"
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "用户更新成功",
  "data": null,
  "timestamp": "2024-01-15T10:30:00"
}
```

#### 3.1.4 删除用户
- **接口地址**: `DELETE /api/admin/users/{id}`
- **请求头**: `Authorization: Bearer {token}`
- **响应数据**:
```json
{
  "code": 200,
  "message": "用户删除成功",
  "data": null,
  "timestamp": "2024-01-15T10:30:00"
}
```

#### 3.1.5 批量导入用户
- **接口地址**: `POST /api/admin/users/import`
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**: `multipart/form-data`，文件字段名 `file`
- **响应数据**:
```json
{
  "code": 200,
  "message": "导入成功",
  "data": {
    "successCount": 10,
    "failCount": 0,
    "total": 10
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

#### 3.1.6 批量删除用户
- **接口地址**: `POST /api/admin/users/batch-delete`
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
```json
{
  "userIds": ["1", "2", "3"]
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "批量删除成功",
  "data": null,
  "timestamp": "2024-01-15T10:30:00"
}
```

### 3.2 题库管理

#### 3.2.1 获取题库列表
- **接口地址**: `GET /api/admin/questions`
- **请求头**: `Authorization: Bearer {token}`
- **查询参数**:
  - `category`: 科室筛选（可选）
  - `difficulty`: 难度筛选（可选）
  - `keyword`: 搜索关键词（可选）
  - `page`: 页码（默认1）
  - `size`: 每页大小（默认10）
- **响应数据**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "list": [
      {
        "id": "1",
        "questionType": "choice",
        "questionContent": "胃溃疡最常见的并发症是？",
        "questionOptions": ["穿孔", "出血", "幽门梗阻", "癌变"],
        "correctAnswer": "1",
        "category": "消化内科",
        "difficulty": "medium",
        "score": 2,
        "createTime": "2024-01-15 10:00:00"
      }
    ],
    "total": 1,
    "page": 1,
    "size": 10
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

#### 3.2.2 添加题目
- **接口地址**: `POST /api/admin/questions`
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
```json
{
  "questionType": "choice",
  "questionContent": "胃溃疡最常见的并发症是？",
  "questionOptions": ["穿孔", "出血", "幽门梗阻", "癌变"],
  "correctAnswer": "1",
  "category": "消化内科",
  "difficulty": "medium",
  "score": 2
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "题目添加成功",
  "data": null,
  "timestamp": "2024-01-15T10:30:00"
}
```

#### 3.2.3 修改题目
- **接口地址**: `PUT /api/admin/questions/{id}`
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**: 同添加题目
- **响应数据**:
```json
{
  "code": 200,
  "message": "题目更新成功",
  "data": null,
  "timestamp": "2024-01-15T10:30:00"
}
```

#### 3.2.4 删除题目
- **接口地址**: `DELETE /api/admin/questions/{id}`
- **请求头**: `Authorization: Bearer {token}`
- **响应数据**:
```json
{
  "code": 200,
  "message": "题目删除成功",
  "data": null,
  "timestamp": "2024-01-15T10:30:00"
}
```

#### 3.2.5 批量导入题目
- **接口地址**: `POST /api/admin/questions/import`
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**: `multipart/form-data`，文件字段名 `file`
- **响应数据**:
```json
{
  "code": 200,
  "message": "导入成功",
  "data": {
    "successCount": 10,
    "failCount": 0,
    "total": 10
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

#### 3.2.6 批量删除题目
- **接口地址**: `POST /api/admin/questions/batch-delete`
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
```json
{
  "questionIds": ["1", "2", "3"]
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "批量删除成功",
  "data": null,
  "timestamp": "2024-01-15T10:30:00"
}
```

### 3.3 考试配置管理

#### 3.3.1 获取考试配置列表
- **接口地址**: `GET /api/admin/exam-configs`
- **请求头**: `Authorization: Bearer {token}`
- **查询参数**:
  - `category`: 科室筛选（可选）
  - `status`: 状态筛选（可选）
  - `page`: 页码（默认1）
  - `size`: 每页大小（默认10）
- **响应数据**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "list": [
      {
        "id": "1",
        "examName": "消化内科理论考试",
        "category": "消化内科",
        "duration": 30,
        "totalScore": 100,
        "passScore": 60,
        "questionCount": 50,
        "status": "1"
      }
    ],
    "total": 1,
    "page": 1,
    "size": 10
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

#### 3.3.2 添加考试配置
- **接口地址**: `POST /api/admin/exam-configs`
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
```json
{
  "examName": "消化内科理论考试",
  "category": "消化内科",
  "duration": 30,
  "totalScore": 100,
  "passScore": 60,
  "questionCount": 50,
  "status": "1"
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "考试配置添加成功",
  "data": null,
  "timestamp": "2024-01-15T10:30:00"
}
```

### 3.4 试卷生成与管理

#### 3.4.1 生成试卷
- **接口地址**: `POST /api/admin/generate-paper`
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
```json
{
  "name": "消化内科理论考试",
  "category": "消化内科",
  "choiceCount": 40,
  "judgmentCount": 20,
  "duration": 90
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "试卷生成成功",
  "data": {
    "id": "123456",
    "name": "消化内科理论考试",
    "category": "消化内科",
    "totalQuestions": "40+20",
    "totalScore": "100",
    "duration": 90,
    "generateTime": "2024-01-15 10:00:00"
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

#### 3.4.2 获取已生成试卷列表
- **接口地址**: `GET /api/admin/generated-papers`
- **请求头**: `Authorization: Bearer {token}`
- **查询参数**:
  - `page`: 页码（默认1）
  - `size`: 每页大小（默认10）
- **响应数据**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "list": [
      {
        "id": "1",
        "name": "消化内科理论考试",
        "category": "消化内科",
        "questionCount": 50,
        "totalScore": 100,
        "generateTime": "2024-01-15 10:00:00"
      }
    ],
    "total": 1,
    "page": 1,
    "size": 10
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

### 3.5 考试结果管理

#### 3.5.1 获取考试结果列表
- **接口地址**: `GET /api/admin/exam-results`
- **请求头**: `Authorization: Bearer {token}`
- **查询参数**:
  - `category`: 科室筛选（可选）
  - `status`: 状态筛选（可选）
  - `keyword`: 搜索关键词（可选）
  - `page`: 页码（默认1）
  - `size`: 每页大小（默认10）
- **响应数据**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "list": [
      {
        "id": "1",
        "userName": "张医生",
        "examName": "消化内科理论考试",
        "category": "消化内科",
        "score": 85,
        "totalScore": 100,
        "status": "completed",
        "startTime": "2024-01-15 10:30:00",
        "endTime": "2024-01-15 11:00:00"
      }
    ],
    "total": 1,
    "page": 1,
    "size": 10
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

#### 3.5.2 获取考试结果详情
- **接口地址**: `GET /api/admin/exam-results/{id}`
- **请求头**: `Authorization: Bearer {token}`
- **响应数据**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": "1",
    "userName": "张医生",
    "examName": "消化内科理论考试",
    "category": "消化内科",
    "score": 85,
    "totalScore": 100,
    "status": "completed",
    "startTime": "2024-01-15 10:30:00",
    "endTime": "2024-01-15 11:00:00",
    "answers": [
      {
        "questionId": "1",
        "questionContent": "胃溃疡最常见的并发症是？",
        "userAnswer": "1",
        "correctAnswer": "1",
        "isCorrect": true,
        "score": 2
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

#### 3.5.3 安排重新考试
- **接口地址**: `POST /api/admin/exam-results/{id}/retake`
- **请求头**: `Authorization: Bearer {token}`
- **响应数据**:
```json
{
  "code": 200,
  "message": "重新考试安排成功",
  "data": null,
  "timestamp": "2024-01-15T10:30:00"
}
```

#### 3.5.4 批量安排重新考试
- **接口地址**: `POST /api/admin/exam-results/batch-retake`
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
```json
{
  "recordIds": ["1", "2", "3"]
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "批量重新考试安排成功",
  "data": null,
  "timestamp": "2024-01-15T10:30:00"
}
```

### 3.6 角色管理

#### 3.6.1 获取角色列表
- **接口地址**: `GET /api/admin/roles`
- **请求头**: `Authorization: Bearer {token}`
- **查询参数**:
  - `status`: 状态筛选（可选）
  - `keyword`: 搜索关键词（可选）
  - `page`: 页码（默认1）
  - `size`: 每页大小（默认10）
- **响应数据**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "list": [
      {
        "id": "1",
        "roleName": "系统管理员",
        "roleKey": "admin",
        "roleSort": 1,
        "status": "1",
        "remark": "超级管理员，拥有所有权限",
        "createTime": "2024-01-15 10:00:00"
      }
    ],
    "total": 1,
    "page": 1,
    "size": 10
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

#### 3.6.2 添加角色
- **接口地址**: `POST /api/admin/roles`
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
```json
{
  "roleName": "考试管理员",
  "roleKey": "exam_admin",
  "roleSort": 2,
  "status": "1",
  "remark": "负责考试管理"
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "角色添加成功",
  "data": null,
  "timestamp": "2024-01-15T10:30:00"
}
```

#### 3.6.3 修改角色
- **接口地址**: `PUT /api/admin/roles/{id}`
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**: 同添加角色
- **响应数据**:
```json
{
  "code": 200,
  "message": "角色更新成功",
  "data": null,
  "timestamp": "2024-01-15T10:30:00"
}
```

#### 3.6.4 删除角色
- **接口地址**: `DELETE /api/admin/roles/{id}`
- **请求头**: `Authorization: Bearer {token}`
- **响应数据**:
```json
{
  "code": 200,
  "message": "角色删除成功",
  "data": null,
  "timestamp": "2024-01-15T10:30:00"
}
```

### 3.7 科室/分类管理

#### 3.7.1 获取科室列表
- **接口地址**: `GET /api/admin/departments`
- **请求头**: `Authorization: Bearer {token}`
- **响应数据**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": "1",
      "name": "消化内科",
      "code": "DEPT_01"
    },
    {
      "id": "2",
      "name": "肝胆外科",
      "code": "DEPT_02"
    }
  ],
  "timestamp": "2024-01-15T10:30:00"
}
```

#### 3.7.2 添加科室
- **接口地址**: `POST /api/admin/departments`
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
```json
{
  "name": "心血管内科",
  "code": "DEPT_03"
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "科室添加成功",
  "data": null,
  "timestamp": "2024-01-15T10:30:00"
}
```

#### 3.7.3 获取分类列表
- **接口地址**: `GET /api/admin/categories`
- **请求头**: `Authorization: Bearer {token}`
- **响应数据**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": [
    {
      "id": "1",
      "name": "消化内科",
      "code": "CAT_01",
      "questionCount": 10
    }
  ],
  "timestamp": "2024-01-15T10:30:00"
}
```

#### 3.7.4 添加分类
- **接口地址**: `POST /api/admin/categories`
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
```json
{
  "name": "呼吸内科",
  "code": "CAT_02"
}
```
- **响应数据**:
```json
{
  "code": 200,
  "message": "分类添加成功",
  "data": null,
  "timestamp": "2024-01-15T10:30:00"
}
```

### 3.8 统计分析

#### 3.8.1 获取仪表盘统计数据
- **接口地址**: `GET /api/admin/statistics/dashboard`
- **请求头**: `Authorization: Bearer {token}`
- **响应数据**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "totalUsers": 125,
    "totalQuestions": 1200,
    "totalExams": 450,
    "todayExams": 15,
    "passRate": 85.5,
    "avgScore": 78.2,
    "examTrends": [
      { "date": "06-01", "count": 12 },
      { "date": "06-02", "count": 18 }
    ]
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

#### 3.8.2 获取考试趋势
- **接口地址**: `GET /api/admin/statistics/exam-trends`
- **请求头**: `Authorization: Bearer {token}`
- **查询参数**:
  - `startDate`: 开始日期（可选，格式yyyy-MM-dd）
  - `endDate`: 结束日期（可选，格式yyyy-MM-dd）
- **响应数据**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "data": [
      { "date": "2024-06-01", "examCount": 20, "passCount": 18 }
    ]
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

#### 3.8.3 获取科室/分类考试表现
- **接口地址**: `GET /api/admin/statistics/category-performance`
- **请求头**: `Authorization: Bearer {token}`
- **响应数据**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "data": [
      { "category": "消化内科", "examCount": 100, "avgScore": 85.5, "passRate": 90.0 }
    ]
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

---

## 4. 数据结构说明

### 4.1 用户角色
- `admin`: 管理员
- `student`: 学员

### 4.2 题目类型
- `choice`: 选择题
- `judgment`: 判断题

### 4.3 考试状态
- `pending`: 待开始
- `in-progress`: 进行中
- `completed`: 已完成
- `timeout`: 超时

### 4.4 难度等级
- `easy`: 简单
- `medium`: 中等
- `hard`: 困难

### 4.5 用户状态
- `1`: 正常
- `0`: 停用

---

## 5. 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 操作成功 |
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 6. 通用响应格式

所有接口都遵循统一的响应格式：

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": "2024-01-15T10:30:00"
}
```

---

## 7. 认证说明

除了登录接口外，所有接口都需要在请求头中携带JWT令牌：

```
Authorization: Bearer {token}
```

令牌有效期为24小时，过期后需要重新登录获取新令牌。

---

## 8. 权限说明

- **管理员权限**: 可以访问所有 `/api/admin/*` 接口
- **学员权限**: 只能访问考试相关接口 `/api/exam/*`

权限验证在JWT令牌中包含用户角色信息，后端会根据角色进行权限控制。
