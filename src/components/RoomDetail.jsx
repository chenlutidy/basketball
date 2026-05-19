import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useWebSocket } from '../contexts/WebSocketContext';

export default function RoomDetail() {
  const currentPlayer = useGameStore(state => state.currentPlayer);
  const setCurrentScreen = useGameStore(state => state.setCurrentScreen);
  const showMessagePopup = useGameStore(state => state.showMessagePopup);
  
  const {
    socket,
    currentRoom,
    gameResult,
    leaveRoom,
    startGame,
    clearGameResult
  } = useWebSocket();

  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (gameResult) {
      console.log('🏀 收到比赛结果:', gameResult);
      setShowResult(true);
      handleGameResult(gameResult);
    }
  }, [gameResult]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGameResult = (result) => {
    // 使用 currentPlayer.socketId 或 socket.id
    const mySocketId = currentPlayer?.socketId || socket?.id;
    
    console.log('📥 处理比赛结果:', {
      result,
      mySocketId,
      currentPlayerSocketId: currentPlayer?.socketId,
      socketId: socket?.id,
      currentPlayerName: currentPlayer?.playerName,
      winningPlayers: result.winningPlayers,
      playerStatsCount: result.playerStats?.length,
      playerStats: result.playerStats?.map(s => ({
        playerId: s.playerId,
        playerName: s.playerName,
        points: s.points
      }))
    });
    
    // 通过 socket ID 查找玩家统计
    const myStats = result.playerStats?.find(s => s.playerId === mySocketId);
    
    console.log('🔍 查找我的统计数据:', {
      mySocketId,
      found: !!myStats,
      myStats
    });
    
    const isWinner = result.winningPlayers?.includes(mySocketId);
    
    if (isWinner) {
      useGameStore.setState(state => {
        const updates = {
          currentPlayer: {
            ...state.currentPlayer,
            economy: {
              ...state.currentPlayer.economy,
              gold: state.currentPlayer.economy.gold + result.goldReward
            },
            exp: state.currentPlayer.exp + result.expReward
          }
        };
        
        // 如果有掉落装备，添加到装备库
        if (result.droppedEquipment) {
          updates.currentPlayer.equipment = {
            ...state.currentPlayer.equipment,
            worn: {
              ...state.currentPlayer.equipment.worn,
              [result.droppedEquipment.id]: result.droppedEquipment
            }
          };
        }
        
        return updates;
      });
      
      showMessagePopup(`🎉 胜利！获得 ${result.goldReward} 金币 + ${result.expReward} 经验`);
      
      if (result.droppedEquipment) {
        showMessagePopup(`🎁 获得装备: ${result.droppedEquipment.name}`);
      }
    } else {
      // 失败也给予部分奖励
      const consolationGold = Math.floor(result.goldReward * 0.5);
      const consolationExp = Math.floor(result.expReward * 0.5);
      
      useGameStore.setState(state => ({
        currentPlayer: {
          ...state.currentPlayer,
          economy: {
            ...state.currentPlayer.economy,
            gold: state.currentPlayer.economy.gold + consolationGold
          },
          exp: state.currentPlayer.exp + consolationExp
        }
      }));
      
      showMessagePopup(`😢 失败了，获得 ${consolationGold} 金币 + ${consolationExp} 经验`);
    }
    
    // 添加比赛记录到历史
    const record = {
      id: Date.now().toString(),
      type: 'custom_room',
      date: new Date().toLocaleDateString(),
      opponent: `${result.roomName} (${result.mode?.toUpperCase() || '1V1'})`,
      opponentOverall: '-',
      result: isWinner ? '胜利' : '失败',
      points: myStats?.points ?? 0,
      rebounds: myStats?.rebounds ?? 0,
      assists: myStats?.assists ?? 0,
      steals: myStats?.steals ?? 0,
      blocks: myStats?.blocks ?? 0,
      isMVP: false,
      goldGain: isWinner ? result.goldReward : Math.floor(result.goldReward * 0.5),
      expGain: isWinner ? result.expReward : Math.floor(result.expReward * 0.5),
      fameGain: isWinner ? 10 : 5,
      equipmentDrop: result.droppedEquipment?.id || null,
      teamAScore: result.teamAScore,
      teamBScore: result.teamBScore,
      myTeam: myStats?.team || 'A'
    };
    
    console.log('💾 保存比赛记录:', record);
    
    useGameStore.setState(state => ({
      matchHistory: [record, ...state.matchHistory].slice(0, 50)
    }));
  };

  const handleLeaveRoom = () => {
    if (currentRoom) {
      leaveRoom(currentRoom.id);
    }
  };

  const handleStartGame = () => {
    if (currentRoom && currentRoom.status === 'ready') {
      console.log('点击开始比赛按钮', {
        currentRoom,
        status: currentRoom?.status,
        canStart: currentRoom?.status === 'ready'
      });
      startGame(currentRoom.id);
    } else {
      showMessagePopup('❌ 无法开始比赛：房间状态不是准备就绪');
    }
  };

  const getModeInfo = (mode) => {
    switch(mode) {
      case '1v1': return { label: '1V1', players: 2 };
      case '2v2': return { label: '2V2', players: 4 };
      case '3v3': return { label: '3V3', players: 6 };
      default: return { label: '1V1', players: 2 };
    }
  };

  const getRankColor = (rank) => {
    const colors = {
      bronze: '#cd7f32',
      silver: '#c0c0c0',
      gold: '#ffd700',
      platinum: '#e5e4e2',
      diamond: '#b9f2ff'
    };
    return colors[rank] || '#9ca3af';
  };

  const getRankName = (rank) => {
    const names = {
      bronze: '青铜',
      silver: '白银',
      gold: '黄金',
      platinum: '铂金',
      diamond: '钻石'
    };
    return names[rank] || '青铜';
  };

  // 如果有比赛结果需要显示，即使 currentRoom 为 null 也要显示结果界面
  if (showResult && gameResult) {
    console.log('🎮 渲染比赛结果界面:', {
      teamAScore: gameResult.teamAScore,
      teamBScore: gameResult.teamBScore,
      winningTeam: gameResult.winningTeam,
      playerStatsCount: gameResult.playerStats?.length,
      roomName: gameResult.roomName
    });
    
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="card w-full my-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">🏀 比赛结束</h2>
              <p className="text-gray-400">{gameResult.roomName || '未知房间'} - {gameResult.mode?.toUpperCase() || '1V1'}</p>
            </div>

            <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-red-600/20 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-blue-400 mb-2">🔵 A队</div>
                  <div className={`text-6xl font-bold ${gameResult.winningTeam === 'A' ? 'text-green-400' : 'text-white'}`}>
                    {gameResult.teamAScore ?? 0}
                  </div>
                </div>
                
                <div className="text-3xl font-bold mx-4 text-white">VS</div>
                
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold text-red-400 mb-2">🔴 B队</div>
                  <div className={`text-6xl font-bold ${gameResult.winningTeam === 'B' ? 'text-green-400' : 'text-white'}`}>
                    {gameResult.teamBScore ?? 0}
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <div className="text-xl font-bold">
                  {gameResult.winningTeam === 'A' ? '🏆 A队获胜' : '🏆 B队获胜'}
                </div>
              </div>
            </div>

            <div className="text-center mb-6">
              <div className={`text-6xl mb-4 ${gameResult.winningPlayers?.includes(currentPlayer?.socketId) ? 'animate-bounce' : ''}`}>
                {gameResult.winningPlayers?.includes(currentPlayer?.socketId) ? '🎉' : '😢'}
              </div>
              <h3 className="text-2xl font-bold mb-4">
                {gameResult.winningPlayers?.includes(currentPlayer?.socketId) ? '胜利！' : '失败'}
              </h3>
              
              {gameResult.winningPlayers?.includes(currentPlayer?.socketId) && (
                <div className="space-y-2 mb-4">
                  <div className="text-lg">💰 +{gameResult.goldReward || 0} 金币</div>
                  <div className="text-lg">⭐ +{gameResult.expReward || 0} 经验</div>
                  {gameResult.droppedEquipment && (
                    <div className="text-lg text-yellow-400">🎁 {gameResult.droppedEquipment.name}</div>
                  )}
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold mb-4">📊 球员数据统计</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gameResult.playerStats?.map((stats, index) => (
                  <div 
                    key={stats.playerId || index} 
                    className={`card p-4 ${stats.isWinner ? 'border-2 border-green-500/30' : 'border border-white/20'}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                          stats.team === 'A' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {stats.playerName?.charAt(0) || '?'}
                        </div>
                        <div className="font-bold">{stats.playerName || '未知玩家'}</div>
                        <div className="text-sm text-gray-400">{stats.team === 'A' ? 'A队' : 'B队'}</div>
                      </div>
                      {stats.isWinner && <span className="text-green-400 text-xl">🏆</span>}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center bg-white/5 rounded p-2">
                        <div className="text-lg font-bold text-yellow-400">{stats.points ?? 0}</div>
                        <div className="text-xs text-gray-400">得分</div>
                      </div>
                      <div className="text-center bg-white/5 rounded p-2">
                        <div className="text-lg font-bold text-blue-400">{stats.rebounds ?? 0}</div>
                        <div className="text-xs text-gray-400">篮板</div>
                      </div>
                      <div className="text-center bg-white/5 rounded p-2">
                        <div className="text-lg font-bold text-green-400">{stats.assists ?? 0}</div>
                        <div className="text-xs text-gray-400">助攻</div>
                      </div>
                      <div className="text-center bg-white/5 rounded p-2">
                        <div className="text-lg font-bold text-purple-400">{stats.steals ?? 0}</div>
                        <div className="text-xs text-gray-400">抢断</div>
                      </div>
                      <div className="text-center bg-white/5 rounded p-2">
                        <div className="text-lg font-bold text-orange-400">{stats.blocks ?? 0}</div>
                        <div className="text-xs text-gray-400">盖帽</div>
                      </div>
                      <div className="text-center bg-white/5 rounded p-2">
                        <div className="text-lg font-bold text-cyan-400">{stats.minutesPlayed ?? 0}</div>
                        <div className="text-xs text-gray-400">分钟</div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center bg-white/5 rounded p-2">
                        <div className="text-sm font-bold">{stats.fieldGoalsMade ?? 0}/{stats.fieldGoalsAttempted ?? 0}</div>
                        <div className="text-gray-400">两分球</div>
                      </div>
                      <div className="text-center bg-white/5 rounded p-2">
                        <div className="text-sm font-bold">{stats.threePointsMade ?? 0}/{stats.threePointsAttempted ?? 0}</div>
                        <div className="text-gray-400">三分球</div>
                      </div>
                      <div className="text-center bg-white/5 rounded p-2">
                        <div className="text-sm font-bold">{stats.freeThrowsMade ?? 0}/{stats.freeThrowsAttempted ?? 0}</div>
                        <div className="text-gray-400">罚球</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (currentRoom) {
                  leaveRoom(currentRoom.id);
                }
                clearGameResult();
                setShowResult(false);
                setCurrentScreen('RoomList');
              }}
              className="btn-primary w-full"
            >
              返回房间列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 如果没有 currentRoom，返回 null
  if (!currentRoom) {
    return null;
  }

  const modeInfo = getModeInfo(currentRoom.mode);
  const teamAPlayers = currentRoom.players.filter(p => p.team === 'A');
  const teamBPlayers = currentRoom.players.filter(p => p.team === 'B');
  const isReady = currentRoom.status === 'ready';
  const isPlaying = currentRoom.status === 'playing';
  const playersNeeded = modeInfo.players - currentRoom.players.length;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">🏀 {currentRoom.name}</h1>
            <p className="text-gray-400">{modeInfo.label} 对战 | {currentRoom.players.length}/{modeInfo.players} 人</p>
          </div>
          <button onClick={handleLeaveRoom} className="btn-secondary btn-sm">
            离开房间
          </button>
        </div>

        <div className="card mb-6">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className={`text-4xl font-bold ${isReady ? 'text-green-400 animate-pulse' : 'text-gray-400'}`}>
                {currentRoom.status === 'waiting' ? '⏳' : isPlaying ? '⚡' : '✅'}
              </div>
              <div className="text-lg font-bold mt-2">
                {currentRoom.status === 'waiting' ? '等待玩家' : isPlaying ? '比赛中' : '准备开始'}
              </div>
              {!isReady && !isPlaying && playersNeeded > 0 && (
                <div className="text-sm text-yellow-400 mt-2">
                  还需要 {playersNeeded} 名玩家才能开始比赛
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card">
            <h3 className="text-lg font-bold mb-4 text-blue-400">🔵 A队</h3>
            <div className="space-y-2">
              {teamAPlayers.map((player, index) => (
                <div key={player.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {player.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">{player.name}</div>
                    <div className="text-xs text-gray-400">
                      {player.position} | Overall: {player.overall}
                    </div>
                  </div>
                  <div
                    className="px-2 py-1 rounded text-xs font-bold"
                    style={{ backgroundColor: `${getRankColor(player.rank)}30`, color: getRankColor(player.rank) }}
                  >
                    {getRankName(player.rank)}
                  </div>
                </div>
              ))}
              {teamAPlayers.length < modeInfo.players / 2 && (
                <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg opacity-50">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm text-gray-400">
                    ?
                  </div>
                  <div className="text-gray-400">等待玩家...</div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold mb-4 text-red-400">🔴 B队</h3>
            <div className="space-y-2">
              {teamBPlayers.map((player, index) => (
                <div key={player.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {player.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">{player.name}</div>
                    <div className="text-xs text-gray-400">
                      {player.position} | Overall: {player.overall}
                    </div>
                  </div>
                  <div
                    className="px-2 py-1 rounded text-xs font-bold"
                    style={{ backgroundColor: `${getRankColor(player.rank)}30`, color: getRankColor(player.rank) }}
                  >
                    {getRankName(player.rank)}
                  </div>
                </div>
              ))}
              {teamBPlayers.length < modeInfo.players / 2 && (
                <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg opacity-50">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm text-gray-400">
                    ?
                  </div>
                  <div className="text-gray-400">等待玩家...</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {!isReady && !isPlaying && (
          <div className="card text-center py-8">
            <div className="text-4xl mb-4">⏳</div>
            <div className="text-xl font-bold text-yellow-400">等待玩家加入</div>
            <div className="text-gray-400 mt-2">
              当前 {currentRoom.players.length}/{modeInfo.players} 人，还需要 {playersNeeded} 人
            </div>
          </div>
        )}

        {isReady && !isPlaying && (
          <button
            onClick={handleStartGame}
            className="btn-success w-full text-xl py-4"
          >
            🎮 开始比赛
          </button>
        )}

        {isPlaying && (
          <div className="card text-center py-8">
            <div className="text-4xl mb-4">⚡</div>
            <div className="text-xl font-bold">比赛进行中...</div>
            <div className="text-gray-400 mt-2">请稍候，正在计算结果...</div>
          </div>
        )}

        {showResult && gameResult && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="card w-full max-w-4xl my-8">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-2">🏀 比赛结束</h2>
                <p className="text-gray-400">{gameResult.roomName} - {gameResult.mode?.toUpperCase() || '1V1'}</p>
              </div>

              <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-red-600/20 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-blue-400 mb-2">🔵 A队</div>
                    <div className={`text-6xl font-bold ${gameResult.winningTeam === 'A' ? 'text-green-400' : 'text-white'}`}>
                      {gameResult.teamAScore}
                    </div>
                  </div>
                  
                  <div className="text-3xl font-bold mx-4 text-white">VS</div>
                  
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-red-400 mb-2">🔴 B队</div>
                    <div className={`text-6xl font-bold ${gameResult.winningTeam === 'B' ? 'text-green-400' : 'text-white'}`}>
                      {gameResult.teamBScore}
                    </div>
                  </div>
                </div>
                
                <div className="text-center mt-4">
                  <div className="text-xl font-bold">
                    {gameResult.winningTeam === 'A' ? '🏆 A队获胜' : '🏆 B队获胜'}
                  </div>
                </div>
              </div>

              <div className="text-center mb-6">
                <div className={`text-6xl mb-4 ${gameResult.winningPlayers.includes(currentPlayer?.socketId) ? 'animate-bounce' : ''}`}>
                  {gameResult.winningPlayers.includes(currentPlayer?.socketId) ? '🎉' : '😢'}
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  {gameResult.winningPlayers.includes(currentPlayer?.socketId) ? '胜利！' : '失败'}
                </h3>
                
                {gameResult.winningPlayers.includes(currentPlayer?.socketId) && (
                  <div className="space-y-2 mb-4">
                    <div className="text-lg">💰 +{gameResult.goldReward} 金币</div>
                    <div className="text-lg">⭐ +{gameResult.expReward} 经验</div>
                    {gameResult.droppedEquipment && (
                      <div className="text-lg text-yellow-400">🎁 {gameResult.droppedEquipment.name}</div>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">📊 球员数据统计</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gameResult.playerStats?.map((stats, index) => (
                    <div 
                      key={stats.playerId || index} 
                      className={`card p-4 ${stats.isWinner ? 'border-2 border-green-500/30' : 'border border-white/20'}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                            stats.team === 'A' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {stats.playerName.charAt(0)}
                          </div>
                          <div className="font-bold">{stats.playerName}</div>
                          <div className="text-sm text-gray-400">{stats.team === 'A' ? 'A队' : 'B队'}</div>
                        </div>
                        {stats.isWinner && <span className="text-green-400 text-xl">🏆</span>}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center bg-white/5 rounded p-2">
                          <div className="text-lg font-bold text-yellow-400">{stats.points}</div>
                          <div className="text-xs text-gray-400">得分</div>
                        </div>
                        <div className="text-center bg-white/5 rounded p-2">
                          <div className="text-lg font-bold text-blue-400">{stats.rebounds}</div>
                          <div className="text-xs text-gray-400">篮板</div>
                        </div>
                        <div className="text-center bg-white/5 rounded p-2">
                          <div className="text-lg font-bold text-green-400">{stats.assists}</div>
                          <div className="text-xs text-gray-400">助攻</div>
                        </div>
                        <div className="text-center bg-white/5 rounded p-2">
                          <div className="text-lg font-bold text-purple-400">{stats.steals}</div>
                          <div className="text-xs text-gray-400">抢断</div>
                        </div>
                        <div className="text-center bg-white/5 rounded p-2">
                          <div className="text-lg font-bold text-orange-400">{stats.blocks}</div>
                          <div className="text-xs text-gray-400">盖帽</div>
                        </div>
                        <div className="text-center bg-white/5 rounded p-2">
                          <div className="text-lg font-bold text-cyan-400">{stats.minutesPlayed}</div>
                          <div className="text-xs text-gray-400">分钟</div>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center bg-white/5 rounded p-2">
                          <div className="text-sm font-bold">{stats.fieldGoalsMade}/{stats.fieldGoalsAttempted}</div>
                          <div className="text-gray-400">两分球</div>
                        </div>
                        <div className="text-center bg-white/5 rounded p-2">
                          <div className="text-sm font-bold">{stats.threePointsMade}/{stats.threePointsAttempted}</div>
                          <div className="text-gray-400">三分球</div>
                        </div>
                        <div className="text-center bg-white/5 rounded p-2">
                          <div className="text-sm font-bold">{stats.freeThrowsMade}/{stats.freeThrowsAttempted}</div>
                          <div className="text-gray-400">罚球</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  if (currentRoom) {
                    leaveRoom(currentRoom.id);
                  }
                  clearGameResult();
                  setShowResult(false);
                  setCurrentScreen('RoomList');
                }}
                className="btn-primary w-full"
              >
                返回房间列表
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
