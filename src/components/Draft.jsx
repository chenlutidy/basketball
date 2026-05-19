import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { DRAFT_CONFIG } from '../data/gameConfig';
import { useWebSocket } from '../contexts/WebSocketContext';

export default function Draft() {
  const [activeTab, setActiveTab] = useState('apply'); // apply, pool, history
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const currentPlayer = useGameStore(state => state.currentPlayer);
  const setCurrentScreen = useGameStore(state => state.setCurrentScreen);
  const getDraftInfo = useGameStore(state => state.getDraftInfo);
  const applyForDraft = useGameStore(state => state.applyForDraft);
  const showMessagePopup = useGameStore(state => state.showMessagePopup);
  const draftPool = useGameStore(state => state.draftPool);
  const draftHistory = useGameStore(state => state.draftHistory);
  
  // 从服务器接收的选秀状态（不再从store读取）
  const [serverDraftState, setServerDraftState] = useState({
    phase: 'idle',
    countdown: 0,
    targetOverall: null,
    poolSize: 0,
    poolCapacity: 30,
    currentRound: 0,
    draftPool: []
  });
  
  const { socket } = useWebSocket();

  const draftInfo = getDraftInfo();

  // 组件挂载时请求当前选秀状态并监听更新
  useEffect(() => {
    if (!socket) {
      console.log('Draft.jsx: socket未连接');
      return;
    }
    
    console.log('Draft.jsx: socket已连接，请求选秀状态...');
    
    // 确保socket已连接后请求当前选秀状态
    const requestStatus = () => {
      console.log('Draft.jsx: 发送draft_get_status请求');
      socket.emit('draft_get_status');
    };
    
    // 立即请求一次
    requestStatus();
    
    // 500ms后再请求一次（确保服务器已处理）
    const timer = setTimeout(requestStatus, 500);
    
    // 监听选秀状态更新（来自服务器的权威数据）
    socket.on('draft_status_update', (data) => {
      console.log('Draft.jsx: 收到服务器选秀状态:', JSON.stringify(data, null, 2));
      setServerDraftState(prev => {
        const newState = {
          ...prev,
          phase: data.phase !== undefined ? data.phase : prev.phase,
          countdown: data.countdown !== undefined ? data.countdown : prev.countdown,
          targetOverall: data.targetOverall !== undefined ? data.targetOverall : prev.targetOverall,
          poolSize: data.poolSize !== undefined ? data.poolSize : prev.poolSize,
          poolCapacity: data.poolCapacity || prev.poolCapacity,
          currentRound: data.currentRound !== undefined ? data.currentRound : prev.currentRound,
          draftPool: data.draftPool || prev.draftPool
        };
        console.log('Draft.jsx: 更新后的serverDraftState:', JSON.stringify(newState, null, 2));
        return newState;
      });
      
      // 如果报名结束，自动跳转到直播间
      if (data.phase === 'drafting' && data.countdown > 0) {
        console.log('Draft.jsx: 自动跳转到选秀直播间');
        setCurrentScreen('DraftLive');
      }
    });
    
    // 监听选秀结果
    socket.on('draft_results', (data) => {
      console.log('选秀结果:', data);
      showMessagePopup(`第${data.round}轮选秀结束！盲盒目标总评: ${data.targetOverall}`);
    });
    
    // 监听错误
    socket.on('draft_error', (data) => {
      showMessagePopup(data.message);
    });
    
    return () => {
      clearTimeout(timer);
      socket.off('draft_status_update');
      socket.off('draft_results');
      socket.off('draft_error');
    };
  }, [socket, showMessagePopup, setCurrentScreen]);

  const formatCountdown = (seconds) => {
    if (!seconds || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const handleApplyClick = () => {
    // 检查每日参与次数
    if (draftInfo?.remainingDrafts <= 0) {
      showMessagePopup('该球员今日参与次数已用完（每日最多2次）');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmApply = () => {
    setShowConfirmModal(false);
    
    // 先调用本地函数检查次数等
    const result = applyForDraft();
    if (!result.success) {
      showMessagePopup(result.message);
      return;
    }
    
    // 发送socket事件通知服务器（服务器是权威）
    if (socket && currentPlayer) {
      socket.emit('draft_apply', {
        playerId: currentPlayer.id,
        playerName: currentPlayer.playerName,
        overall: currentPlayer.overall
      });
      
      // 立即请求最新的选秀状态
      setTimeout(() => {
        socket.emit('draft_get_status');
      }, 100);
      
      showMessagePopup('报名成功！');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">选秀中心</h1>
            <p className="text-gray-400">盲盒选秀机制 · 随时参与</p>
          </div>
          <button onClick={() => setCurrentScreen('Main')} className="btn-secondary btn-sm">
            返回
          </button>
        </div>

        {/* 状态栏 */}
        <div className="card mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-sm text-gray-400">当前状态</div>
                <div className={`font-bold ${
                  serverDraftState.phase === 'registration' ? 'text-green-400' : 
                  serverDraftState.phase === 'drafting' ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  {serverDraftState.phase === 'idle' ? '等待报名' : 
                   serverDraftState.phase === 'registration' ? '报名中' : 
                   serverDraftState.phase === 'drafting' ? '选秀进行中' : '已结束'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">你的总评</div>
                <div className="font-bold text-yellow-400 text-xl">{currentPlayer?.overall || 0}</div>
              </div>
              {serverDraftState.countdown > 0 && (
                <div>
                  <div className="text-sm text-gray-400">剩余时间</div>
                  <div className="font-bold text-red-400 text-xl">{formatCountdown(serverDraftState.countdown)}</div>
                </div>
              )}
              {serverDraftState.targetOverall && (
                <div>
                  <div className="text-sm text-gray-400">盲盒目标</div>
                  <div className="font-bold text-purple-400 text-xl">{serverDraftState.targetOverall}</div>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">今日剩余次数</div>
              <div className="font-bold text-blue-400">{draftInfo?.remainingDrafts || 0}/{DRAFT_CONFIG.dailyFreeDrafts}</div>
            </div>
          </div>
        </div>

        {/* 连续落选提示 */}
        {draftInfo?.consecutiveFailures > 0 && (
          <div className="card mb-6 border-l-4 border-orange-500">
            <div className="flex items-center gap-3">
              <span className="text-2xl"></span>
              <div>
                <div className="font-bold">连续落选 {draftInfo.consecutiveFailures} 次</div>
                <div className="text-sm text-gray-400">
                  {draftInfo.consecutiveFailures >= 2 
                    ? '下次选秀概率 +10%' 
                    : '继续加油，保底机制会帮助你'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 标签页 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('apply')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'apply' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            参与选秀
          </button>
          <button
            onClick={() => setActiveTab('pool')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'pool' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            选秀名单 ({draftPool.length}/{DRAFT_CONFIG.poolCapacity})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'history' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            选秀历史
          </button>
        </div>

        {/* 参与选秀 */}
        {activeTab === 'apply' && (
          <div>
            <div className="card mb-6">
              <h2 className="text-lg font-bold mb-4">选秀规则</h2>
              <div className="space-y-2 text-sm text-gray-300">
                <p>• <strong>无门槛参与</strong>：无任何总评、等级、任务要求</p>
                <p>• <strong>盲盒机制</strong>：每轮随机生成目标总评（50-80），无需消耗选秀券</p>
                <p>• <strong>报名时间</strong>：1分钟（测试用），报满30人即止</p>
                <p>• <strong>选秀时间</strong>：报名截止后立即开始，1分钟（测试用）内完成</p>
                <p>• <strong>每日限制</strong>：每个球员每日最多参与2次，0点重置</p>
                <p>• <strong>AI填充</strong>：玩家不足30人时，系统自动生成AI球员填充</p>
                <p>• <strong>10个顺位</strong>：第1顺位（状元）概率最低，第10顺位概率最高</p>
                <p>• <strong>差值影响</strong>：球员总评与目标总评差值≤10增加概率，＞10减少概率</p>
                <p>• <strong>保底机制</strong>：连续2次落选后，第3次+10%概率</p>
                <p>• <strong>落选无消耗</strong>：落选可直接参与下一轮</p>
              </div>
            </div>

            <div className="card mb-6">
              <h2 className="text-lg font-bold mb-4">顺位概率说明</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2">顺位</th>
                      <th className="text-left py-2">基础概率</th>
                      <th className="text-left py-2">差值≤10</th>
                      <th className="text-left py-2">差值11-20</th>
                      <th className="text-left py-2">差值＞20</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DRAFT_CONFIG.draftPicks.map(pick => (
                      <tr key={pick.pick} className="border-b border-white/5">
                        <td className="py-2">{pick.name}</td>
                        <td className="py-2 text-yellow-400">{pick.baseProbability}%</td>
                        <td className="py-2 text-green-400">+{DRAFT_CONFIG.differenceImpact.smallDiff.bonus[pick.pick]}%</td>
                        <td className="py-2 text-orange-400">{DRAFT_CONFIG.differenceImpact.mediumDiff.penalty[pick.pick]}%</td>
                        <td className="py-2 text-red-400">{DRAFT_CONFIG.differenceImpact.largeDiff.penalty[pick.pick]}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-3">* 最终概率还受保底机制、徽章加成影响，最高不超过40%</p>
            </div>

            <button
              onClick={handleApplyClick}
              disabled={
                draftInfo?.remainingDrafts <= 0 ||
                serverDraftState.phase === 'registration' ||
                serverDraftState.phase === 'drafting'
              }
              className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {draftInfo?.remainingDrafts <= 0 
                ? '今日次数已用完'
                : serverDraftState.phase === 'registration'
                ? `报名进行中... (${formatCountdown(serverDraftState.countdown)})`
                : serverDraftState.phase === 'drafting'
                ? `选秀进行中... (${formatCountdown(serverDraftState.countdown)})`
                : serverDraftState.phase === 'finished'
                ? '本轮已结束，等待下一轮'
                : '参与选秀'}
            </button>
          </div>
        )}

        {/* 选秀名单 */}
        {activeTab === 'pool' && (
          <div>
            <h2 className="text-lg font-bold mb-4">当期选秀名单</h2>
            <p className="text-sm text-gray-400 mb-4">第 {serverDraftState.currentRound} 轮 | {serverDraftState.draftPool.length}/{serverDraftState.poolCapacity} 人</p>
            {serverDraftState.draftPool.length > 0 ? (
              <div className="space-y-2">
                {serverDraftState.draftPool.map((entry, index) => (
                  <div key={index} className="card flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-gray-500">#{index + 1}</div>
                      <div>
                        <div className="font-bold">
                          {entry.isAI ? 'AI球员' : entry.playerName}
                        </div>
                        <div className="text-sm text-gray-400">{entry.isAI ? '系统填充' : '玩家'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold text-xl">{entry.overall}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-8">
                <div className="text-gray-400">当前选秀池为空</div>
                <div className="text-sm text-gray-500 mt-2">等待玩家报名...</div>
              </div>
            )}
          </div>
        )}

        {/* 选秀历史 */}
        {activeTab === 'history' && (
          <div>
            <h2 className="text-lg font-bold mb-4">选秀历史</h2>
            {draftHistory.length > 0 ? (
              <div className="space-y-2">
                {draftHistory.slice().reverse().map((entry, index) => (
                  <div key={index} className={`card ${entry.result === 'selected' ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold">{entry.playerName || entry.playerId}</div>
                        <div className="text-sm text-gray-400">
                          {new Date(entry.timestamp).toLocaleDateString()} 
                          {entry.draftPick && ` - 第${entry.draftPick}顺位`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${entry.result === 'selected' ? 'text-green-400' : 'text-red-400'}`}>
                          {entry.result === 'selected' ? ' 选中' : ' 落选'}
                        </div>
                        <div className="text-xs text-gray-400">总评 {entry.overall}</div>
                        {entry.targetOverall && (
                          <div className="text-xs text-purple-400">目标 {entry.targetOverall}</div>
                        )}
                        {entry.badge && (
                          <div className="text-xs text-yellow-400 mt-1">获得徽章: {entry.badge.name}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card text-center py-8">
                <div className="text-gray-400">暂无选秀记录</div>
              </div>
            )}
          </div>
        )}

        {/* 确认弹窗 */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="card max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">确认参与选秀</h3>
              <div className="space-y-3 text-gray-300">
                <p>您当前球员总评为 <span className="text-yellow-400 font-bold">{currentPlayer?.overall || 0}</span></p>
                <p className="text-sm">本次选秀为盲盒机制（每轮最多30名球员参与，玩家不足时AI填充）</p>
                <p className="text-sm">无需消耗选秀券，报名1分钟截止、选秀1分钟完成</p>
                <p className="text-sm text-purple-400">所有玩家共享同一倒计时，时间由服务器统一管理</p>
                <p>该球员今日剩余参与次数为 <span className="text-blue-400 font-bold">{draftInfo?.remainingDrafts || 0}</span></p>
                <p className="text-sm text-gray-500 mt-4">是否确认参与？</p>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmApply}
                  className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded font-bold"
                >
                  确认参与
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
