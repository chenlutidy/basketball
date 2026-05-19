import { useWebSocket } from '../contexts/WebSocketContext';
import { useGameStore } from '../store/gameStore';
import { useState, useEffect } from 'react';

export default function OnlinePlayers() {
  const currentPlayer = useGameStore(state => state.currentPlayer);
  const setCurrentScreen = useGameStore(state => state.setCurrentScreen);
  const showMessagePopup = useGameStore(state => state.showMessagePopup);
  
  const {
    isConnected,
    onlinePlayers,
    pendingChallenges,
    challengeResult,
    friends,
    joinServer,
    sendChallenge,
    addFriend,
    removeFriend,
    acceptChallenge,
    rejectChallenge,
    clearChallengeResult
  } = useWebSocket();

  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const handleJoinServer = () => {
    if (currentPlayer) {
      joinServer({
        name: currentPlayer.playerName,
        overall: currentPlayer.overall,
        position: currentPlayer.positionAbbr
      });
      showMessagePopup('已连接到服务器！');
    }
  };

  const handleChallenge = (player) => {
    if (player.name === currentPlayer?.playerName) {
      showMessagePopup('不能挑战自己！');
      return;
    }
    sendChallenge(player.id, '来一场1v1吧！');
    showMessagePopup(`挑战请求已发送给 ${player.name}`);
    setSelectedPlayer(null);
  };

  const handleAcceptChallenge = (challenge) => {
    acceptChallenge(challenge);
  };

  const isFriend = (playerId) => {
    return friends.some(f => f.id === playerId);
  };

  const handleAddFriend = (player) => {
    if (isFriend(player.id)) {
      removeFriend(player.id);
      showMessagePopup(`已删除 ${player.name} 好友！`);
    } else {
      addFriend(player.id);
      showMessagePopup(`已添加 ${player.name} 为好友！`);
    }
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: '#9ca3af',
      rare: '#22c55e',
      epic: '#3b82f6',
      legendary: '#f59e0b'
    };
    return colors[rarity] || '#9ca3af';
  };

  const getRarityName = (rarity) => {
    const names = {
      common: '白色',
      rare: '绿色',
      epic: '蓝色',
      legendary: '橙色'
    };
    return names[rarity] || '白色';
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">🌐 在线玩家</h1>
            <p className="text-gray-400">与其他玩家一起游戏</p>
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

        {pendingChallenges.length > 0 && (
          <div className="card mb-6 border-red-500/50">
            <h3 className="text-lg font-bold mb-3 text-red-400">📮 待处理挑战</h3>
            {pendingChallenges.map((challenge, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center font-bold">
                    {challenge.from.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold">{challenge.from.name}</div>
                    <div className="text-sm text-gray-400">
                      {challenge.from.position} | Overall: {challenge.from.overall}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptChallenge(challenge)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400"
                  >
                    接受
                  </button>
                  <button
                    onClick={() => rejectChallenge(challenge)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400"
                  >
                    拒绝
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {friends.length > 0 && (
          <div className="card mb-6">
            <h3 className="text-lg font-bold mb-3 text-green-400">👥 我的好友 ({friends.length})</h3>
            <div className="flex flex-wrap gap-2">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-full"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {friend.name.charAt(0)}
                  </div>
                  <span className="text-sm">{friend.name}</span>
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-lg font-bold mb-4">🎮 在线玩家列表 ({onlinePlayers.length})</h2>
        <div className="card">
          <div className="space-y-2">
            {onlinePlayers.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                暂无在线玩家
              </div>
            ) : (
              onlinePlayers.map((player) => {
                // 通过 socket ID 或名字判断是否是本人
                const isMe = (player.id === currentPlayer?.socketId) || 
                             (player.name === currentPlayer?.playerName);
                
                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isMe ? 'bg-blue-500/20 border border-blue-500/50' :
                      selectedPlayer?.id === player.id ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        isMe ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                        'bg-gradient-to-br from-yellow-500 to-orange-500'
                      }`}>
                        {player.name ? player.name.charAt(0) : '?'}
                      </div>
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          {player.name || '未知玩家'}
                          {isMe && (
                            <span className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full">我</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">
                          {player.position || '未知'} | Overall: {player.overall || 0}
                        </div>
                      </div>
                    </div>
                    {!isMe && (
                      <div className="flex gap-2">
                        {selectedPlayer?.id === player.id ? (
                          <button
                            onClick={() => handleChallenge(player)}
                            className="btn-success btn-sm"
                          >
                            发送挑战
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedPlayer(player)}
                            className="btn-primary btn-sm"
                          >
                            挑战
                          </button>
                        )}
                        <button
                          onClick={() => handleAddFriend(player)}
                          className={`btn-sm ${isFriend(player.id) ? 'btn-danger' : 'btn-secondary'}`}
                        >
                          {isFriend(player.id) ? '删除好友' : '+ 好友'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {challengeResult && challengeResult.result && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-lg">
            <div className="text-center">
              <div className={`text-6xl mb-4 ${challengeResult.result.yourScore > challengeResult.result.opponentScore ? 'animate-bounce' : ''}`}>
                {challengeResult.result.yourScore > challengeResult.result.opponentScore ? '🎉' : '😢'}
              </div>
              <h3 className="text-2xl font-bold mb-4">
                {challengeResult.result.yourScore > challengeResult.result.opponentScore ? '胜利！' : '失败'}
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">你</div>
                  <div className={`text-3xl font-bold ${challengeResult.result.yourScore > challengeResult.result.opponentScore ? 'text-green-400' : 'text-red-400'}`}>
                    {challengeResult.result.yourScore || 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">分</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">{challengeResult.from.name}</div>
                  <div className={`text-3xl font-bold ${challengeResult.result.opponentScore > challengeResult.result.yourScore ? 'text-green-400' : 'text-red-400'}`}>
                    {challengeResult.result.opponentScore || 0}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">分</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-left bg-white/5 rounded-lg p-3">
                  <div className="text-sm font-bold mb-2">你的数据</div>
                  <div className="text-xs space-y-1">
                    <div>得分: {challengeResult.result.yourStats?.points || challengeResult.result.winnerStats?.points || 0}</div>
                    <div>篮板: {challengeResult.result.yourStats?.rebounds || challengeResult.result.winnerStats?.rebounds || 0}</div>
                    <div>助攻: {challengeResult.result.yourStats?.assists || challengeResult.result.winnerStats?.assists || 0}</div>
                    <div>抢断: {challengeResult.result.yourStats?.steals || challengeResult.result.winnerStats?.steals || 0}</div>
                    <div>盖帽: {challengeResult.result.yourStats?.blocks || challengeResult.result.winnerStats?.blocks || 0}</div>
                  </div>
                </div>
                <div className="text-left bg-white/5 rounded-lg p-3">
                  <div className="text-sm font-bold mb-2">{challengeResult.from.name} 数据</div>
                  <div className="text-xs space-y-1">
                    <div>得分: {challengeResult.result.opponentStats?.points || challengeResult.result.loserStats?.points || 0}</div>
                    <div>篮板: {challengeResult.result.opponentStats?.rebounds || challengeResult.result.loserStats?.rebounds || 0}</div>
                    <div>助攻: {challengeResult.result.opponentStats?.assists || challengeResult.result.loserStats?.assists || 0}</div>
                    <div>抢断: {challengeResult.result.opponentStats?.steals || challengeResult.result.loserStats?.steals || 0}</div>
                    <div>盖帽: {challengeResult.result.opponentStats?.blocks || challengeResult.result.loserStats?.blocks || 0}</div>
                  </div>
                </div>
              </div>

              {challengeResult.result.stolenEquipment && challengeResult.result.yourScore > challengeResult.result.opponentScore && (
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-4">
                  <div className="text-yellow-400 font-bold mb-2">🎁 获得装备！</div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${getRarityColor(challengeResult.result.stolenEquipment.rarity)}30` }}
                    >
                      🎒
                    </div>
                    <div>
                      <div className="font-bold" style={{ color: getRarityColor(challengeResult.result.stolenEquipment.rarity) }}>
                        {challengeResult.result.stolenEquipment.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {getRarityName(challengeResult.result.stolenEquipment.rarity)}品质
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={clearChallengeResult}
                className="btn-primary w-full"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
