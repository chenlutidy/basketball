# 🚀 Railway 部署 - 详细步骤

## 📝 第一步：准备项目

### 1. 检查 git 状态
```bash
cd /Users/mac/Downloads/basketball-react
git status
```

### 2. 如果还没有 git 仓库，初始化
```bash
git init
git add .
git commit -m "Initial commit - Basketball React Game"
```

---

## 🌐 第二步：在 GitHub 上创建仓库

1. 访问 https://github.com/new
2. 创建新仓库（public 或 private 都可以）
3. 不用添加 README、.gitignore 或 LICENSE
4. 复制仓库地址

### 推送到 GitHub
```bash
git remote add origin https://github.com/你的用户名/你的仓库名.git
git branch -M main
git push -u origin main
```

---

## 🚀 第三步：在 Railway 上部署

### 1. 访问 Railway
去 https://railway.app

### 2. 登录
用 GitHub 账号登录（最方便）

### 3. 新建项目
- 点击 **"New Project"**
- 选择 **"Deploy from GitHub repo"**
- 授权并选择你的仓库

### 4. 配置（如果需要）
Railway 应该会自动检测这是个 Node.js 项目：
- Build Command: `npm install` (自动)
- Start Command: `npm start` (自动，因为 package.json 有)
- 端口: 3001 (自动识别或设置 PORT 环境变量)

### 5. 部署
点击 **"Deploy"**

### 6. 获得域名！
部署成功后，Railway 给你免费域名：
- `https://你自定义的前缀.railway.app`

---

## 🎉 部署成功后做的

### 1. 测试网站
访问 Railway 给你的域名，测试游戏！

### 2. 享受免费额度
- 500 小时/月（个人项目足够）
- 数据保存（用我们 SQLite 数据库）

---

## ⚙️ 可选配置

### 如果需要设置环境变量
在 Railway 项目设置里，添加：
```
PORT=3001
NODE_ENV=production
```

### 数据库自动保存
- 数据库在 `data/` 目录
- Railway 会自动持久化这个目录（只要没配置 ephemeral storage）

---

## 🔄 后续更新

### 本地修改代码后
```bash
git add .
git commit -m "你的更新描述"
git push
```
Railway 自动重新部署！

---

## 💡 快速检查清单

- [ ] 代码已推送到 GitHub
- [ ] Railway 项目已连接到 GitHub 仓库
- [ ] 部署成功（绿色 checkmark）
- [ ] 访问 Railway 给的域名，测试成功

---

## 🎮 开始玩！

你的篮球游戏现在在公网上了！
