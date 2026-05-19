# 🎯 部署指南 - 纯 Node.js 数据库 + 自动适配

## ✅ 已经实现的功能

### 1. **纯 Node.js 数据库 (SQLite with sql.js)
- ✅ 不需要任何额外的数据库服务器
- ✅ 纯 JavaScript 实现
- ✅ 自动数据持久化到文件
- ✅ 数据文件：`data/basketball.db`

### 2. **WebSocket 自动适配本地/线上**
- ✅ 前端自动检测环境
- ✅ 本地：`http://localhost:3001`
- ✅ 线上：自动使用当前域名

## 🚀 部署步骤

### 方式一：直接运行（最简单）

```bash
# 1. 安装依赖
npm install

# 2. 启动服务
node server.js

# 3. 访问游戏
# 浏览器打开：http://localhost:3001
```

### 方式二：PM2 生产部署

```bash
# 1. 安装 PM2
npm install -g pm2

# 2. 启动服务
pm2 start ecosystem.config.js

# 3. 查看状态
pm2 status

# 4. 开机自启
pm2 save
pm2 startup
```

### 方式三：Docker 环境变量配置

创建 `.env` 文件：

```env
# 服务器端口
PORT=3001

# 生产环境模式
NODE_ENV=production

# 允许的 CORS 源（线上必须填你的域名）
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# 数据库路径
DB_PATH=./data/basketball.db
```

## 📊 数据库文件位置

所有数据保存在：
- `data/basketball.db`

备份方法：

```bash
# 备份数据库
cp data/basketball.db data/backup-$(date +%Y%m%d-%H%M%S).db

# 恢复数据库
cp data/backup-xxx.db data/basketball.db
```

## 🔧 技术说明

### 纯 Node.js 数据库的优势

1. **零依赖** - 不需要安装任何数据库服务
2. **简单部署** - 直接运行 `node server.js` 即可
3. **易于备份** - 复制数据库文件即可
4. **跨平台** - Windows/Mac/Linux 都能用

### 数据表

1. **players** - 玩家信息
2. **matches** - 比赛记录
3. **rooms** - 房间状态
4. **equipment** - 装备掉落
5. **draft_records** - 选秀历史
6. **friends** - 好友关系

## 📝 验证部署

测试以下功能都正常工作时验证方法

## 💡 提示

如果需要支持更多数据，请更新 `.env` 文件，配置环境变量即可！
