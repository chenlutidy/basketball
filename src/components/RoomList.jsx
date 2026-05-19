import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useWebSocket } from '../contexts/WebSocketContext';
import RoomDetail from './RoomDetail';

export default function RoomList() {
  const currentPlayer = useGameStore(state => state.currentPlayer);
  const setCurrentScreen = useGameStore(state => state.setCurrentScreen);
  const showMessagePopup = useGameStore(state => state.showMessagePopup);
  
  const {
    isConnected,
    rooms,
    currentRoom,
    joinServer,
    createRoom,
    joinRoom,
    getRooms
  } = useWebSocket();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [selectedMode, setSelectedMode] = useState('1v1');

  useEffect(() => {
    if (isConnected) {
      getRooms();
    }
  }, [isConnected, getRooms]);

  const handleJoinServer = () => {
    if (currentPlayer) {
      joinServer({
        name: currentPlayer.playerName,
        overall: currentPlayer.overall,
        position: currentPlayer.positionAbbr,
        wins: currentPlayer.statistics.streetWins,
        streak: 0,
        rank: calculateRank(currentPlayer.statistics.streetWins)
      });
      showMessagePopup('已连接到服务器！');
    }
  };

  const handleCreateRoom = () => {
    if (!roomName.trim()) {
      showMessagePopup('请输入房间名称');
      return;
    }
    
    createRoom(selectedMode, roomName.trim(), {
      name: currentPlayer.playerName,
      overall: currentPlayer.overall,
      position: currentPlayer.positionAbbr,
      wins: currentPlayer.statistics.streetWins,
      streak: 0,
      rank: calculateRank(currentPlayer.statistics.streetWins)
    });
    
    setShowCreateModal(false);
    setRoomName('');
  };

  const handleJoinRoom = (room) => {
    joinRoom(room.id, {
      name: currentPlayer.playerName,
      overall: currentPlayer.overall,
      position: currentPlayer.positionAbbr,
      wins: currentPlayer.statistics.streetWins,
      streak: 0,
      rank: calculateRank(currentPlayer.statistics.streetWins)
    });
  };

  const calculateRank = (wins) => {
    if (wins >= 100) return 'diamond';
    if (wins >= 50) return 'platinum';
    if (wins >= 25) return 'gold';
    if (wins >= 10) return 'silver';
    return 'bronze';
  };

  const getModeInfo = (mode) => {
    switch(mode) {
      case '1v1': return { label: '1V1', players: 2, icon: '⚔️' };
      case '2v2': return { label: '2V2', players: 4, icon: '👥' };
      case '3v3': return { label: '3V3', players: 6, icon: '👨‍👩‍👧' };
      default: return { label: '1V1', players: 2, icon: '⚔️' };
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'waiting': return 'text-yellow-400';
      case 'ready': return 'text-green-400';
      case 'playing': return 'text-red-400';
      case 'finished': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'waiting': return '等待中';
      case 'ready': return '准备开始';
      case 'playing': return '进行中';
      case 'finished': return '已结束';
      default: return '未知';
    }
  };

  if (currentRoom) {
    return <RoomDetail />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">🏀 自建房间</h1>
            <p className="text-gray-400">创建或加入真人对战房间</p>
          </div>
          <button onClick={() => setCurrentScreen('Main')} className="btn-secondary btn-sm">
            返回
          </button>
        </div>

        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-400">连接状态:</span>
              <span className={`ml-2 font-bold ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? '✓ 已连接' : '✗ 未连接'}
              </span>
            </div>
            {!isConnected && (
              <button onClick={handleJoinServer} className="btn-primary">
                🔌 连接服务器
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={!isConnected}
            className={`btn-primary flex-1 ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            ➕ 创建房间
          </button>
          <button
            onClick={getRooms}
            disabled={!isConnected}
            className={`btn-secondary flex-1 ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            🔄 刷新列表
          </button>
        </div>

        <h2 className="text-lg font-bold mb-4">📋 房间列表 ({rooms.length})</h2>
        <div className="card">
          <div className="space-y-2">
            {rooms.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                暂无房间，点击上方按钮创建房间
              </div>
            ) : (
              rooms.map((room) => {
                const modeInfo = getModeInfo(room.mode);
                return (
                  <div
                    key={room.id}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      room.status === 'waiting' ? 'bg-white/5 hover:bg-white/10 cursor-pointer' : 'bg-white/5'
                    }`}
                    onClick={() => room.status === 'waiting' && handleJoinRoom(room)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{modeInfo.icon}</div>
                      <div>
                        <div className="font-bold">{room.name}</div>
                        <div className="text-sm text-gray-400">
                          {modeInfo.label} | {room.players.length}/{modeInfo.players} 人
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`font-bold ${getStatusColor(room.status)}`}>
                        {getStatusText(room.status)}
                      </span>
                      {room.status === 'waiting' && (
                        <button className="btn-primary btn-sm">
                          加入
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="card w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">创建房间</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">房间名称</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="请输入房间名称"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">选择模式</label>
                <div className="grid grid-cols-3 gap-2">
                  {['1v1', '2v2', '3v3'].map((mode) => {
                    const info = getModeInfo(mode);
                    return (
                      <button
                        key={mode}
                        onClick={() => setSelectedMode(mode)}
                        className={`p-3 rounded-lg ${
                          selectedMode === mode
                            ? 'bg-yellow-500 text-black'
                            : 'bg-white/10 hover:bg-white/20'
                        }`}
                      >
                        <div className="text-xl">{info.icon}</div>
                        <div className="font-bold">{info.label}</div>
                        <div className="text-xs opacity-70">{info.players}人</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary flex-1"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateRoom}
                  className="btn-primary flex-1"
                >
                  创建
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
