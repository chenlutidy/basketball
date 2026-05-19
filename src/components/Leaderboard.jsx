import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { LEADERBOARD_TYPES } from '../data/gameConfig';
import { useWebSocket } from '../contexts/WebSocketContext';

export default function Leaderboard() {
  const leaderboard = useGameStore(state => state.leaderboard);
  const currentPlayer = useGameStore(state => state.currentPlayer);
  const generateLeaderboard = useGameStore(state => state.generateLeaderboard);
  const showMessagePopup = useGameStore(state => state.showMessagePopup);
  const setCurrentScreen = useGameStore(state => state.setCurrentScreen);
  
  const { onlinePlayers, addFriend, removeFriend, friends } = useWebSocket();

  const [activeTab, setActiveTab] = useState('overall');

  useEffect(() => {
    generateLeaderboard();
  }, []);

  const isFriend = (playerId) => friends.some(f => f.id === playerId);
  const isCurrentPlayer = (playerId) => playerId === 'current_player' || playerId === currentPlayer?.id;

  const mergedLeaderboard = () => {
    const aiPlayers = leaderboard.map(player => ({
      ...player,
      isOnline: false,
      isRealPlayer: false
    }));

    const realPlayers = onlinePlayers.map(player => ({
      id: player.id,
      name: player.name,
      overall: player.overall,
      fame: player.fame || 0,
      level: player.level || 1,
      gold: player.gold || 0,
      title: player.title,
      isOnline: true,
      isRealPlayer: true,
      online: true
    }));

    const allPlayers = [...aiPlayers, ...realPlayers];
    
    allPlayers.sort((a, b) => {
      const aScore = a[activeTab] || 0;
      const bScore = b[activeTab] || 0;
      return bScore - aScore;
    });

    return allPlayers.slice(0, 15);
  };

  const handleAddFriend = (player) => {
    addFriend(player.id);
    showMessagePopup(`已添加 ${player.name} 为好友！`);
  };

  const handleRemoveFriend = (player) => {
    removeFriend(player.id);
    showMessagePopup(`已删除好友 ${player.name}！`);
  };

  const sortedPlayers = mergedLeaderboard();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">📊 排行榜</h1>
            <p className="text-gray-400">查看玩家排名（包含真人玩家）</p>
          </div>
          <button onClick={() => setCurrentScreen('Main')} className="btn-secondary btn-sm">
            返回
          </button>
        </div>

        <div className="card">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {LEADERBOARD_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => setActiveTab(type.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === type.id
                    ? 'bg-yellow-500 text-black'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {type.icon} {type.name}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {sortedPlayers.map((player, index) => {
              const rank = index + 1;
              const isFriendFlag = isFriend(player.id);
              const isCurrent = isCurrentPlayer(player.id);

              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    isCurrent ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-white/5'
                  }`}
                >
                  <div className="w-8 text-center">
                    {rank === 1 && '🥇'}
                    {rank === 2 && '🥈'}
                    {rank === 3 && '🥉'}
                    {rank > 3 && rank}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${player.isRealPlayer ? 'animate-pulse' : ''}`} 
                         style={{ backgroundColor: player.online ? '#22c55e' : '#6b7280' }} />
                    {player.isRealPlayer && (
                      <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">真人</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">
                      {player.name} {isCurrent && '(你)'}{player.isRealPlayer && ' 👤'}
                    </div>
                    {player.title && (
                      <div className="text-xs text-yellow-400">{player.title}</div>
                    )}
                  </div>
                  <div className="font-bold">{player[activeTab]}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}