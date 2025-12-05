## 项目简介

**Theory Test Forge** 是一个用于在线理论考试与练习的系统，包含：

- **考生端**：考试列表、考试作答、答题卡、计时与自动交卷等能力  
- **管理端**：题库管理、试卷生成、考试配置、用户与角色管理、成绩查询等  
- **后端服务**：提供题库、考试记录、成绩统计等 REST API，并集成认证与权限控制

## 技术栈概览

- **前端**：Vite + React + TypeScript + Tailwind CSS + shadcn-ui  
- **路由与状态**：`react-router-dom`、`@tanstack/react-query` 等  
- **后端**：Spring Boot 3、MyBatis-Flex、Spring Security、JWT  
- **数据库**：MySQL（连接配置见 `backend/src/main/resources/application-*.yml`）

## 本地开发与运行

- **环境要求**
  - Node.js（建议 ≥ 18）
  - npm 或 pnpm
  - JDK 21
  - MySQL 数据库

- **初始化步骤**
  1. 克隆仓库并进入项目根目录  
  2. 在数据库中创建对应库，并根据 `backend/src/main/resources/sql/schema.sql` 初始化表结构  
  3. 根据本地环境修改 `backend/src/main/resources/application-dev.yml` 中的数据库连接信息

### 启动前端

在项目根目录执行：

```bash
npm install
npm run dev
```

默认通过 `http://localhost:5173` 访问前端应用（端口以终端输出为准）。

### 启动后端

进入 `backend` 目录：

```bash
mvn spring-boot:run
```

后端默认运行在 `http://localhost:8080`（具体端口以配置为准）。

## 常用脚本（前端）

- **开发调试**：`npm run dev`  
- **生产构建**：`npm run build`  
- **预览构建结果**：`npm run preview`  
- **代码检查**：`npm run lint`

## 后续计划（示例）

- **多选题顺序化记录与展示**（角标顺序、可调整顺序等交互优化）  
- 考试记录与错题分析页面优化  
- 权限与角色配置的可视化配置体验提升
