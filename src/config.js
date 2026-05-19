// 配置文件 - 选择使用本地或线上
// 使用方式：
// 1. 本地开发：MODE = 'local'
// 2. 线上部署：MODE = 'online'，并修改 ONLINE_DOMAIN 为你的域名

const MODE = 'local'; // 改为 'online' 强制使用线上域名

// 🔧 配置你的线上域名
const ONLINE_DOMAIN = 'yourgame.com'; // 你的实际线上域名，如: 'game.abc.com'
const ONLINE_PORT = ''; // 线上端口，通常为空

// 本地配置
const LOCAL_DOMAIN = 'localhost';
const LOCAL_PORT = ':3001';

const getConfig = () => {
  const protocol = window.location.protocol;
  
  if (MODE === 'online') {
    // 强制使用线上域名
    return {
      apiUrl: `${protocol}//${ONLINE_DOMAIN}${ONLINE_PORT}`,
      socketUrl: `${protocol}//${ONLINE_DOMAIN}${ONLINE_PORT}`,
      onlineDomain: ONLINE_DOMAIN,
      mode: 'online'
    };
  }
  
  // 本地模式
  return {
    apiUrl: `http://${LOCAL_DOMAIN}${LOCAL_PORT}`,
    socketUrl: `http://${LOCAL_DOMAIN}${LOCAL_PORT}`,
    onlineDomain: LOCAL_DOMAIN,
    mode: 'local'
  };
};

export default getConfig;
