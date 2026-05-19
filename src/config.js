// 配置文件 - 使用线上域名
// 🔧 配置你的线上域名
const ONLINE_DOMAIN = 'agile-achievement-production-3c20.up.railway.app'; // 你的实际线上域名，如: 'game.abc.com'
const ONLINE_PORT = ''; // 线上端口，通常为空

const getConfig = () => {
  // 始终使用线上域名，默认 https
  return {
    apiUrl: `https://${ONLINE_DOMAIN}${ONLINE_PORT}`,
    socketUrl: `https://${ONLINE_DOMAIN}${ONLINE_PORT}`,
    onlineDomain: ONLINE_DOMAIN,
    mode: 'online'
  };
};

export default getConfig;
