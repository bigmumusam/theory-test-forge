#!/bin/bash

echo "=== 理论考试系统打包脚本 ==="

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "错误：请在项目根目录执行此脚本"
    exit 1
fi

# 前端打包
echo "1. 开始前端打包..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ 前端打包成功"
    echo "前端文件位置: dist/"
else
    echo "❌ 前端打包失败"
    exit 1
fi

# 检查 Maven 是否安装
if ! command -v mvn &> /dev/null; then
    echo "2. Maven 未安装，请先安装 Maven："
    echo "   brew install maven"
    echo "   或者下载 Maven 并配置环境变量"
    echo "   前端打包已完成，后端需要手动打包"
    exit 0
fi

# 后端打包
echo "2. 开始后端打包..."
cd backend
mvn clean package -DskipTests
if [ $? -eq 0 ]; then
    echo "✅ 后端打包成功"
    echo "后端 JAR 文件位置: backend/target/exam-system-1.0.0.jar"
else
    echo "❌ 后端打包失败"
    exit 1
fi

echo ""
echo "=== 打包完成 ==="
echo "前端文件: dist/"
echo "后端文件: backend/target/exam-system-1.0.0.jar"
echo ""
echo "部署说明："
echo "1. 前端文件可以部署到任何静态文件服务器（如 Nginx）"
echo "2. 后端 JAR 文件可以通过以下命令运行："
echo "   java -jar backend/target/exam-system-1.0.0.jar"
echo "3. 确保数据库配置正确" 