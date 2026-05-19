# 🎮 免费部署 & 域名方案

## 🚀 最简单方案：免费部署到 Railway

### 步骤
1. 去 https://railway.app/ 注册（支持 GitHub 登录）
2. 创建仓库，把项目代码推上去
3. 在 Railway 点击 "New Project" → "Deploy from GitHub repo"
4. 自动部署，免费获得域名：`xxxxx.railway.app`

### Railway 免费额度
- 500 小时每月
- 足够测试和小流量

---

## 🌐 方案二：Render (更稳定免费)

### Render 同样支持免费部署
1. https://render.com/ 注册
2. 点 "New" → "Web Service"
3. 选你的 GitHub 仓库
4. 免费域名：`your-app.onrender.com`

---

## 📋 本地开发

### 本地运行
```bash
# 安装依赖
npm install

# 启动服务端
node server.js

# 访问 http://localhost:3001
```

### 数据保存位置
- 数据库：`data/basketball.db`
- 自动每60秒保存，退出时也会保存

---

## 🎯 功能完成

### ✅ 已实现：
- 纯 Node.js SQL.js 数据库（无需额外数据库服务）
- WebSocket 多人联机
- 球员训练
- 装备系统
- 选秀系统
- 比赛记录
- 房间对战
- 排行榜
- 装备掉落

---

## 📊 数据库结构

### 玩家表（players）
- 完整属性保存，包括训练后的属性
- 隐藏属性
- 装备和状态
- 选秀记录
- 比赛统计

---

## 💡 本地使用

### 1. 玩游戏
浏览器打开 http://localhost:3001

### 2. 创建球员
输入名字，选择位置，开始玩

### 3. 训练提高属性
训练界面，训练后刷新页面，数据都在！

---

## 🚀 部署到生产（完整步骤）

### 使用 Railway
1. 创建 GitHub 仓库，把所有代码推上去
2. Railway 连接到 GitHub 仓库
3. 自动部署，获得免费域名

### 或者本地电脑公网访问（临时方案）
1. 内网穿透工具如 ngrok：https://ngrok.com/
2. 命令 `ngrok http 3001`
3. 获得临时公网链接

---

## ⚡ 快速开始

```bash
git clone <your repo>
cd basketball-react
npm install
node server.js
```
