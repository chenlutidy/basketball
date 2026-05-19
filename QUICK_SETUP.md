# ⚙️ 快速配置线上域名

## 🎯 简单三步配置你的域名

### 1️⃣ 编辑配置文件

打开文件：`src/config.js`

修改第 3 行：
```javascript
const ONLINE_DOMAIN = 'yourdomain.com';  // 改为你的实际域名
```

改为：
```javascript
const ONLINE_DOMAIN = 'game.yourdomain.com';  // 或你的具体域名
```

### 2️⃣ 修改后端配置

创建或编辑 `.env` 文件：
```env
CORS_ORIGIN=https://game.yourdomain.com
```

### 3️⃣ 本地测试线上域名（可选）

如果你想在本地用线上域名测试（需要修改 hosts 文件）：

**Windows/Mac:**
编辑 `hosts` 文件，添加：
```
127.0.0.1    game.yourdomain.com
```

然后在浏览器访问：`http://game.yourdomain.com:3001`

---

## 📋 现在的配置说明

| 环境 | API/Socket 地址 |
|------|----------------|
| 本地（localhost） | `http://localhost:3001` |
| 线上域名 | 自动使用你的配置域名 |

---

## 💡 如果你现在没有线上域名

没关系！你可以：

1. **先本地测试** - 用现在的配置继续开发
2. **等有了域名再改** - 只需要改 `src/config.js` 一行即可

---

## 🚀 完整配置后的运行方式

### 本地开发
```bash
node server.js
# 浏览器打开 http://localhost:3001
```

### 线上部署
```bash
node server.js
# 浏览器打开 https://yourdomain.com
```

## 📁 修改过的文件

- `src/config.js` - 统一配置文件
- `src/hooks/useWebSocket.js` - 使用配置文件
- `src/contexts/WebSocketContext.jsx` - 使用配置文件
