import { useGameStore } from '../store/gameStore';
import { POTENTIAL_RANKS } from '../data/gameConfig';
import { useWebSocket } from '../contexts/WebSocketContext';

export default function MainMenu() {
  const currentPlayer = useGameStore(state => state.currentPlayer);
  const setCurrentScreen = useGameStore(state => state.setCurrentScreen);

  const { isConnected, onlinePlayers } = useWebSocket();

  if (!currentPlayer) {
    setCurrentScreen('Start');
    return null;
  }

  const potentialData = POTENTIAL_RANKS.find(p => p.id === currentPlayer.potentialRank);

  const menuItems = [
    { id: 'StreetBall', icon: '🏀', label: '街头2', desc: '挑战AI球队' },
    { id: 'RoomList', icon: '🏠', label: '自建房间', desc: '创建真人对战' },
    { id: 'OnlinePlayers', icon: '🌐', label: '在线对战', desc: '与玩家对战' },
    { id: 'Training', icon: '💪', label: '训练中心', desc: '提升能力' },
    { id: 'Talents', icon: '✨', label: '天赋系统', desc: '选择天赋' },
    { id: 'Equipment', icon: '🎒', label: '装备系统', desc: '管理装备' },
    { id: 'Draft', icon: '🎯', label: '选秀中心', desc: '参与职业选秀' },
    { id: 'Staff', icon: '🏢', label: '职员管理', desc: '经纪人和球探' },
    { id: 'Leaderboard', icon: '📊', label: '排行榜', desc: '查看排名' },
    { id: 'Profile', icon: '👤', label: '球员信息', desc: '查看详情' },
    { id: 'MatchHistory', icon: '📝', label: '比赛记录', desc: '历史战绩' },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
              篮场崛起
            </h1>
            <p className="text-gray-400">从零到巨星</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span className="text-sm text-gray-400">
                {isConnected ? `在线 ${onlinePlayers.length} 人` : '离线'}
              </span>
            </div>
            <button
              onClick={() => setCurrentScreen('Start')}
              className="btn-secondary btn-sm"
            >
              返回首页
            </button>
          </div>
        </div>

        <div className="card mb-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-2xl font-bold text-black">
                {currentPlayer.playerName.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-lg">{currentPlayer.playerName}</div>
                <div className="text-sm text-gray-400">{currentPlayer.positionAbbr} | 总评: {currentPlayer.overall}</div>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-3 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-yellow-400 font-bold">{currentPlayer.economy.gold}</div>
                <div className="text-xs text-gray-400">金币</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-bold">{currentPlayer.status.currentStamina}/{currentPlayer.status.maxStamina}</div>
                <div className="text-xs text-gray-400">体力</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 font-bold">{currentPlayer.statistics.fame}</div>
                <div className="text-xs text-gray-400">名气</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-bold">Lv.{currentPlayer.level}</div>
                <div className="text-xs text-gray-400">等级</div>
              </div>
              <div className="text-center">
                <div className="font-bold" style={{ color: potentialData?.color }}>{currentPlayer.potential}</div>
                <div className="text-xs text-gray-400">潜力</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className="card text-left hover:bg-white/20 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div>
                  <div className="font-bold text-lg">{item.label}</div>
                  <div className="text-sm text-gray-400">{item.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
