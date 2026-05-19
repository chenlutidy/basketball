# 🏀 Basketball Game - Online Multiplayer

一个基于 React + Node.js 的在线篮球对战游戏，支持多人实时对战、选秀系统、装备掉落等丰富的游戏功能。

## ✨ 特性

- 🏆 **实时对战** - 支持 1v1、2v2、3v3 多种对战模式
- 👥 **在线匹配** - 实时显示在线玩家，创建和加入房间
- 📊 **数据持久化** - SQLite 数据库存储所有游戏数据
- 🎯 **选秀系统** - 全局选秀活动，争夺状元签
- 🎒 **装备系统** - 比赛掉落装备，提升球员属性
- 📈 **排行榜** - 查看玩家胜率和排名
- 🌐 **RESTful API** - 完整的 API 接口支持

## 🚀 快速开始

### 本地开发

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动开发服务器** (需要 Node.js 18+)
   ```bash
   npm run dev
   ```

3. **启动生产服务器**
   ```bash
   # 使用启动脚本
   ./start.sh
   
   # 或手动启动
   node server.js
   ```

4. **访问游戏**
   - 前端: http://localhost:3001
   - API: http://localhost:3001/api

## 🐳 Docker 部署

### 使用 Docker Compose (推荐)

1. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，修改 CORS_ORIGIN 为你的域名
   ```

2. **启动服务**
   ```bash
   docker-compose up -d
   ```

3. **查看日志**
   ```bash
   docker-compose logs -f
   ```

4. **停止服务**
   ```bash
   docker-compose down
   ```

### 使用 Docker

```bash
# 构建镜像
docker build -t basketball-game .

# 运行容器
docker run -d \
  --name basketball-game \
  -p 3001:3001 \
  -v basketball-data:/app/data \
  -e NODE_ENV=production \
  -e CORS_ORIGIN=http://your-domain.com \
  basketball-game
```

## 📦 PM2 部署

PM2 是 Node.js 应用的进程管理器，适合在 Linux 服务器上部署。

1. **安装 PM2**
   ```bash
   npm install -g pm2
   ```

2. **启动应用**
   ```bash
   pm2 start ecosystem.config.js
   ```

3. **常用命令**
   ```bash
   # 查看状态
   pm2 status
   
   # 查看日志
   pm2 logs basketball-game
   
   # 重启应用
   pm2 restart basketball-game
   
   # 停止应用
   pm2 stop basketball-game
   
   # 保存进程列表 (开机自启)
   pm2 save
   
   # 设置开机自启
   pm2 startup
   ```

## 🔧 配置

### 环境变量

在 `.env` 文件中配置以下选项：

```env
PORT=3001                      # 服务器端口
NODE_ENV=production            # 运行环境
CORS_ORIGIN=http://localhost:3001,https://your-domain.com  # 允许的跨域来源
DB_PATH=./data/basketball.db   # 数据库文件路径
LOG_LEVEL=info                 # 日志级别
```

### API 接口

服务器启动后，可通过以下 API 接口访问数据：

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/stats` | GET | 全局统计数据 |
| `/api/players` | GET | 获取所有玩家列表 |
| `/api/players/:id` | GET | 获取玩家详情 |
| `/api/leaderboard` | GET | 获取排行榜 |
| `/api/matches` | GET | 获取比赛记录 |
| `/api/matches/:id` | GET | 获取比赛详情 |
| `/api/rooms` | GET | 获取房间列表 |
| `/api/equipment` | GET | 获取玩家装备 |
| `/api/draft` | GET | 获取选秀记录 |

### WebSocket 事件

客户端可监听以下 WebSocket 事件：

```javascript
// 连接
socket.on('connect', () => {
  console.log('Connected to server');
});

// 玩家列表更新
socket.on('player_list', (players) => {
  console.log('Online players:', players);
});

// 房间列表更新
socket.on('room_list', (rooms) => {
  console.log('Available rooms:', rooms);
});

// 比赛结果
socket.on('game_result', (result) => {
  console.log('Game result:', result);
});

// 选秀状态更新
socket.on('draft_status_update', (status) => {
  console.log('Draft status:', status);
});
```

## 🗄️ 数据库

使用 SQLite 作为数据库，数据文件存储在 `data/basketball.db`。

### 数据表

- **players** - 玩家信息
- **matches** - 比赛记录
- **rooms** - 房间信息
- **equipment** - 装备掉落
- **draft_records** - 选秀记录

### 备份数据库

```bash
# 备份
cp data/basketball.db data/backup_$(date +%Y%m%d_%H%M%S).db

# 恢复
cp data/backup_xxx.db data/basketball.db
```

## 🛠️ 生产环境优化

### Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### HTTPS 配置

使用 Let's Encrypt 免费证书：

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

## 📊 监控

### 使用 PM2 Plus (可选)

```bash
# 链接你的应用
pm2 link <key> <id>

# 在 PM2 Plus Dashboard 查看
```

### 日志管理

```bash
# 查看错误日志
tail -f logs/error.log

# 轮转日志 (需要 logrotate)
sudo cat > /etc/logrotate.d/basketball-game << EOF
/data/basketball-react/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
    postrotate
        pm2 reload logs
    endscript
}
EOF
```

## 🔒 安全建议

1. **使用 HTTPS** - 生产环境必须启用 HTTPS
2. **限制 CORS** - 只允许信任的域名
3. **定期备份** - 定期备份数据库文件
4. **监控日志** - 关注错误和异常登录
5. **更新依赖** - 定期更新 npm 包版本

## 🐛 故障排除

### 数据库锁定

如果遇到数据库锁定错误：
```bash
# 删除锁文件
rm -f data/*.db-shm data/*.db-wal

# 重启服务
pm2 restart basketball-game
```

### 端口被占用

```bash
# 查看端口占用
lsof -i :3001

# 杀死进程
kill -9 <PID>

# 或使用其他端口
PORT=3002 node server.js
```

## 📝 开发指南

### 项目结构

```
basketball-react/
├── database/           # 数据库相关
│   ├── init.js        # 数据库初始化
│   └── models.js      # 数据模型
├── routes/            # API 路由
│   └── api.js         # RESTful API
├── dist/              # 前端构建文件
├── data/              # 数据库文件
├── logs/              # 日志文件
├── server.js          # 主服务器文件
├── ecosystem.config.js # PM2 配置
├── Dockerfile         # Docker 配置
└── docker-compose.yml # Docker Compose 配置
```

### 构建前端

```bash
# 安装开发依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build
```

## 📄 License

MIT License

## 🙏 致谢

- React - UI 框架
- Socket.IO - WebSocket 通信
- SQLite - 数据库
- Tailwind CSS - 样式框架
