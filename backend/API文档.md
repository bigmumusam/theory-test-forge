
# 医学理论考试系统 API 接口文档

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

## 2. 考试相关接口

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

## 3. 管理员接口

### 3.1 获取考试结果列表
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
  "data": [
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
  "timestamp": "2024-01-15T10:30:00"
}
```

### 3.2 获取题库列表
- **接口地址**: `GET /api/admin/questions`
- **请求头**: `Authorization: Bearer {token}`
- **查询参数**: 
  - `category`: 科室筛选（可选）
  - `difficulty`: 难度筛选（可选）
  - `keyword`: 搜索关键词（可选）
  - `page`: 页码（默认1）
  - `size`: 每页大小（默认10）

### 3.3 添加题目
- **接口地址**: `POST /api/admin/questions`
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**:
```json
{
  "questionType": "choice",
  "questionContent": "胃溃疡最常见的并发症是？",
  "questionOptions": ["穿孔", "出血", "幽门梗阻", "癌变"],
  "correctAnswer": "1",
  "categoryId": 1,
  "difficulty": "medium",
  "score": 2
}
```

### 3.4 修改题目
- **接口地址**: `PUT /api/admin/questions/{id}`
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**: 同添加题目

### 3.5 删除题目
- **接口地址**: `DELETE /api/admin/questions/{id}`
- **请求头**: `Authorization: Bearer {token}`

### 3.6 获取用户列表
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
  "data": [
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
  "timestamp": "2024-01-15T10:30:00"
}
```

### 3.7 添加用户
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

### 3.8 修改用户
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

### 3.9 删除用户
- **接口地址**: `DELETE /api/admin/users/{id}`
- **请求头**: `Authorization: Bearer {token}`

### 3.10 获取角色列表
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
  "data": [
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
  "timestamp": "2024-01-15T10:30:00"
}
```

### 3.11 添加角色
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

### 3.12 修改角色
- **接口地址**: `PUT /api/admin/roles/{id}`
- **请求头**: `Authorization: Bearer {token}`
- **请求参数**: 同添加角色

### 3.13 删除角色
- **接口地址**: `DELETE /api/admin/roles/{id}`
- **请求头**: `Authorization: Bearer {token}`

### 3.14 获取科室列表
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

## 5. 错误码说明

| 错误码 | 说明 |
|--------|------|
| 200 | 操作成功 |
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

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

## 7. 认证说明

除了登录接口外，所有接口都需要在请求头中携带JWT令牌：

```
Authorization: Bearer {token}
```

令牌有效期为24小时，过期后需要重新登录获取新令牌。

## 8. 权限说明

- **管理员权限**: 可以访问所有 `/api/admin/*` 接口
- **学员权限**: 只能访问考试相关接口 `/api/exam/*`

权限验证在JWT令牌中包含用户角色信息，后端会根据角色进行权限控制。
