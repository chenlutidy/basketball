import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { DRAFT_CONFIG } from '../data/gameConfig';
import { useWebSocket } from '../contexts/WebSocketContext';

export default function DraftLive() {
  const currentPlayer = useGameStore(state => state.currentPlayer);
  const setCurrentScreen = useGameStore(state => state.setCurrentScreen);
  const draftHistory = useGameStore(state => state.draftHistory);
  
  const { socket } = useWebSocket();
  
  const [liveState, setLiveState] = useState({
    phase: 'waiting', // waiting, countdown, drafting, finished
    countdown: 60, // 60秒倒计时
    targetOverall: null,
    currentRound: 0,
    draftPool: [],
    results: [],
    numberOnePick: null, // 状元信息
    currentPick: 0, // 当前正在抽取的顺位
  });

  const [showNotification, setShowNotification] = useState(false);

  // 监听服务器事件
  useEffect(() => {
    if (!socket) return;

    // 接收选秀状态更新
    socket.on('draft_status_update', (data) => {
      console.log('直播间接收到状态更新:', data);
      setLiveState(prev => ({
        ...prev,
        phase: data.phase === 'drafting' ? 'countdown' : 
               data.phase === 'finished' ? 'finished' : prev.phase,
        countdown: data.countdown !== undefined ? data.countdown : prev.countdown,
        targetOverall: data.targetOverall || prev.targetOverall,
        currentRound: data.currentRound || prev.currentRound,
        draftPool: data.draftPool || prev.draftPool,
      }));
    });

    // 接收选秀开始通知（报名结束时）- 自动弹框
    socket.on('draft_start_notification', (data) => {
      console.log('选秀开始通知:', data);
      setLiveState(prev => ({
        ...prev,
        targetOverall: data.targetOverall,
        currentRound: data.currentRound,
        draftPool: data.draftPool,
        phase: 'countdown',
        countdown: data.countdown,
      }));
      // 自动显示通知
      setShowNotification(true);
    });

    // 接收选秀结果
    socket.on('draft_results', (data) => {
      console.log('直播间接收到选秀结果:', data);
      setLiveState(prev => ({
        ...prev,
        phase: 'finished',
        results: data.results || [],
        numberOnePick: data.numberOnePick || null,
      }));
      // 关闭通知
      setShowNotification(false);
    });

    return () => {
      socket.off('draft_status_update');
      socket.off('draft_start_notification');
      socket.off('draft_results');
    };
  }, [socket]);

  // 获取状元信息
  const getNumberOnePick = () => {
    if (liveState.results.length === 0) return null;
    return liveState.results.find(r => r.draftPick === 1) || 
           liveState.results.find(r => r.result === 'selected' && r.pickRank === 1);
  };

  // 格式化倒计时
  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // 顺位名称
  const pickNames = ['状元', '榜眼', '探花', '第4顺位', '第5顺位', '第6顺位', '第7顺位', '第8顺位', '第9顺位', '第10顺位'];

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-purple-900/20 to-blue-900/20">
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-purple-500">
              选秀直播间
            </h1>
            <p className="text-gray-400">第 {liveState.currentRound} 轮</p>
          </div>
          <button 
            onClick={() => setCurrentScreen('Draft')} 
            className="btn-secondary btn-sm"
          >
            返回选秀中心
          </button>
        </div>

        {/* 通知弹框 */}
        {showNotification && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="card max-w-lg w-full mx-4 animate-pulse">
              <div className="text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h2 className="text-2xl font-bold mb-4 text-yellow-400">选秀即将开始！</h2>
                <div className="space-y-2 text-gray-300 mb-6">
                  <p>盲盒目标总评：<span className="text-purple-400 font-bold text-xl">{liveState.targetOverall}</span></p>
                  <p>参与人数：<span className="text-blue-400 font-bold">{liveState.draftPool.filter(p => !p.isAI).length}</span> 名玩家</p>
                  <p>AI填充：<span className="text-gray-400 font-bold">{liveState.draftPool.filter(p => p.isAI).length}</span> 名</p>
                </div>
                <button
                  onClick={() => setShowNotification(false)}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-purple-500 hover:from-yellow-600 hover:to-purple-600 rounded-lg font-bold text-lg"
                >
                  确定，开始观看
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 盲盒目标总评展示 */}
        {liveState.targetOverall && (
          <div className="card mb-6 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-2 border-purple-500/50">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">本轮盲盒目标总评</div>
              <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-purple-500">
                {liveState.targetOverall}
              </div>
              <div className="mt-4 text-sm text-gray-400">
                差值越小，选中概率越高
              </div>
            </div>
          </div>
        )}

        {/* 倒计时 */}
        {liveState.phase === 'countdown' && liveState.countdown > 0 && (
          <div className="card mb-6 text-center">
            <div className="text-sm text-gray-400 mb-2">AI开始选秀倒计时</div>
            <div className="text-5xl font-bold text-red-400 animate-pulse">
              {formatCountdown(liveState.countdown)}
            </div>
            <div className="mt-4 text-sm text-gray-500">
              倒计时结束后将自动开始选秀直播
            </div>
          </div>
        )}

        {/* 选秀结果 */}
        {(liveState.phase === 'drafting' || liveState.phase === 'finished') && liveState.results.length > 0 && (
          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-4 text-center">选秀结果</h2>
            
            {/* 状元展示 */}
            {liveState.numberOnePick && (
              <div className="mb-6 p-6 bg-gradient-to-r from-yellow-900/50 to-purple-900/50 border-2 border-yellow-500 rounded-lg text-center">
                <div className="text-sm text-yellow-400 mb-2">本轮状元</div>
                <div className="text-3xl font-bold text-white mb-2">{liveState.numberOnePick.playerName}</div>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <span className="text-yellow-400">总评: {liveState.numberOnePick.overall}</span>
                  <span className="text-purple-400">差值: {liveState.numberOnePick.diff}</span>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveState.results.map((result, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border-2 ${
                    result.result === 'selected' 
                      ? 'bg-green-900/30 border-green-500/50' 
                      : 'bg-red-900/30 border-red-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-lg">
                        {result.playerName}
                        {result.draftPick && (
                          <span className="ml-2 text-yellow-400">
                            {pickNames[result.draftPick - 1] || `第${result.draftPick}顺位`}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        总评: {result.overall} | 差值: {result.diff !== undefined ? Math.abs(result.diff) : 'N/A'}
                      </div>
                    </div>
                    <div className="text-right">
                      {result.result === 'selected' ? (
                        <span className="text-green-400 font-bold">选中</span>
                      ) : (
                        <span className="text-red-400 font-bold">落选</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 选秀完成 */}
        {liveState.phase === 'finished' && (
          <div className="card mb-6 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-4 text-yellow-400">本轮选秀已结束</h2>
            {getNumberOnePick() && (
              <div className="mb-6">
                <div className="text-sm text-gray-400 mb-2">本轮状元</div>
                <div className="text-3xl font-bold text-purple-400">
                  {getNumberOnePick().playerName}
                </div>
                <div className="text-lg text-gray-400">
                  总评: {getNumberOnePick().overall}
                </div>
              </div>
            )}
            <button
              onClick={() => setCurrentScreen('Draft')}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-bold"
            >
              查看选秀历史
            </button>
          </div>
        )}

        {/* 等待中 */}
        {liveState.phase === 'waiting' && (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">⏳</div>
            <div className="text-xl text-gray-400">等待报名结束...</div>
            <div className="text-sm text-gray-500 mt-2">
              报名结束后将自动进入选秀直播
            </div>
          </div>
        )}

        {/* 参与玩家列表 */}
        {liveState.draftPool.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-bold mb-4">
              参与玩家 ({liveState.draftPool.filter(p => !p.isAI).length}/{DRAFT_CONFIG.poolCapacity})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {liveState.draftPool.filter(p => !p.isAI).map((player, index) => (
                <div key={index} className="bg-gray-800/50 rounded-lg p-3 text-center">
                  <div className="font-bold text-sm truncate">{player.playerName}</div>
                  <div className="text-yellow-400 font-bold">{player.overall}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
