import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { POSITIONS, POTENTIAL_RANKS, HIDDEN_ATTRIBUTES } from '../data/gameConfig';

export default function Profile() {
  const [showHiddenAttributes, setShowHiddenAttributes] = useState(false);
  const currentPlayer = useGameStore(state => state.currentPlayer);
  const setCurrentScreen = useGameStore(state => state.setCurrentScreen);

  if (!currentPlayer) {
    setCurrentScreen('Start');
    return null;
  }

  const position = POSITIONS[currentPlayer.position];
  const potentialData = POTENTIAL_RANKS.find(p => p.id === currentPlayer.potentialRank);
  const attrs = currentPlayer.attributes;
  const hiddenAttrs = currentPlayer.hiddenAttributes || {};
  const scoutedAttributes = currentPlayer.draft?.scoutedAttributes || {}; // 已探测的属性
  const hasScout = currentPlayer.staff?.some(s => s.type === 'scout'); // 是否有球探

  const attributeList = [
    { key: 'speed', label: '速度', value: attrs.speed || 0 },
    { key: 'jump', label: '弹跳', value: attrs.jump || 0 },
    { key: 'strength', label: '力量', value: attrs.strength || 0 },
    { key: 'threePoint', label: '三分', value: attrs.threePoint || 0 },
    { key: 'inside', label: '内线', value: attrs.inside || 0 },
    { key: 'defense', label: '防守', value: attrs.defense || 0 },
    { key: 'dribble', label: '运球', value: attrs.dribble || 0 },
    { key: 'pass', label: '传球', value: attrs.pass || 0 },
    { key: 'stamina', label: '体能', value: attrs.stamina || 0 },
  ];

  const maxAttrValue = Math.floor((currentPlayer.potential || 0) / 10);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">👤 球员信息</h1>
            <p className="text-gray-400">查看球员详细信息</p>
          </div>
          <button onClick={() => setCurrentScreen('Main')} className="btn-secondary btn-sm">
            返回
          </button>
        </div>

        <div className="card mb-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-4xl font-bold text-black">
              {currentPlayer.playerName.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold">{currentPlayer.playerName}</div>
              <div className="text-gray-400">{position.name} ({currentPlayer.positionAbbr})</div>
              {currentPlayer.title && (
                <div className="text-yellow-400">🏆 {currentPlayer.title}</div>
              )}
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-yellow-400">{currentPlayer.overall}</div>
              <div className="text-gray-400">总评</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-blue-400 font-bold text-xl">Lv.{currentPlayer.level}</div>
            <div className="text-xs text-gray-400">等级</div>
          </div>
          <div className="card text-center">
            <div className="text-green-400 font-bold text-xl">{currentPlayer.age}</div>
            <div className="text-xs text-gray-400">年龄</div>
          </div>
          <div className="card text-center">
            <div className="text-purple-400 font-bold text-xl">{currentPlayer.height}cm</div>
            <div className="text-xs text-gray-400">身高</div>
          </div>
          <div className="card text-center">
            <div className="text-orange-400 font-bold text-xl">{currentPlayer.weight}kg</div>
            <div className="text-xs text-gray-400">体重</div>
          </div>
        </div>

        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
                style={{ backgroundColor: `${potentialData?.color}30`, color: potentialData?.color }}
              >
                {currentPlayer.potential}
              </div>
              <div>
                <div className="font-bold" style={{ color: potentialData?.color }}>
                  {potentialData?.name}
                </div>
                <div className="text-xs text-gray-400">潜力值决定属性成长上限</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">属性上限</div>
              <div className="font-bold">{maxAttrValue}</div>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-bold mb-4">能力属性</h2>
        <div className="card">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {attributeList.map(attr => (
              <div key={attr.key} className="flex items-center justify-between">
                <div className="text-gray-400">{attr.label}</div>
                <div className="font-bold text-yellow-400">{attr.value}</div>
              </div>
            ))}
          </div>
        </div>

        <h2 className="text-lg font-bold mt-6 mb-4">统计数据</h2>
        <div className="card">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{currentPlayer.statistics.gamesPlayed}</div>
              <div className="text-xs text-gray-400">比赛场次</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{currentPlayer.statistics.streetWins}</div>
              <div className="text-xs text-gray-400">街头获胜</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{currentPlayer.statistics.streetMVP}</div>
              <div className="text-xs text-gray-400">街头MVP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{currentPlayer.statistics.totalPoints}</div>
              <div className="text-xs text-gray-400">总得分</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{currentPlayer.statistics.totalRebounds}</div>
              <div className="text-xs text-gray-400">总篮板</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-400">{currentPlayer.statistics.totalAssists}</div>
              <div className="text-xs text-gray-400">总助攻</div>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-bold mt-6 mb-4">经济状况</h2>
        <div className="card">
          <div className="flex gap-6">
            <div>
              <div className="text-yellow-400 font-bold text-2xl">💰 {currentPlayer.economy.gold}</div>
              <div className="text-xs text-gray-400">金币</div>
            </div>
            <div>
              <div className="text-purple-400 font-bold text-2xl">💫 {currentPlayer.statistics.fame}</div>
              <div className="text-xs text-gray-400">名气</div>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-bold mt-6 mb-4 flex items-center justify-between">
          <span>隐藏属性</span>
          {hasScout && (
            <button
              onClick={() => setShowHiddenAttributes(!showHiddenAttributes)}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              {showHiddenAttributes ? '▼ 收起' : '▶ 展开'}
            </button>
          )}
        </h2>
        {!hasScout ? (
          <div className="card text-center py-8">
            <div className="text-gray-400 mb-2">🔒 隐藏属性未解锁</div>
            <p className="text-sm text-gray-500">
              雇佣球探并探测后才能查看隐藏属性<br/>
              前往 <span className="text-blue-400 cursor-pointer" onClick={() => setCurrentScreen('Staff')}>职员管理</span> 雇佣球探
            </p>
          </div>
        ) : showHiddenAttributes ? (
          <div className="card">
            <p className="text-xs text-gray-400 mb-4">
              这些属性不会直接显示，但会影响你的比赛表现和成长速度（仅显示已探测的属性）
            </p>
            {Object.keys(scoutedAttributes).length === 0 ? (
              <div className="text-center py-4">
                <div className="text-gray-400 mb-2">暂无已探测的属性</div>
                <p className="text-sm text-gray-500">
                  前往 <span className="text-blue-400 cursor-pointer" onClick={() => setCurrentScreen('Staff')}>职员管理 → 球探服务</span> 进行探测
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(scoutedAttributes).map(([key, data]) => {
                  const config = HIDDEN_ATTRIBUTES[key];
                  if (!config) return null;
                  
                  // 处理趋势数据或纯数值
                  const isTrendData = typeof data === 'object' && data.value !== undefined;
                  const value = isTrendData ? data.value : data;
                  const percentage = Math.round((value / config.max) * 100);
                  let colorClass = 'bg-gray-500';
                  if (percentage >= 80) colorClass = 'bg-green-500';
                  else if (percentage >= 60) colorClass = 'bg-blue-500';
                  else if (percentage >= 40) colorClass = 'bg-yellow-500';
                  else colorClass = 'bg-red-500';

                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">{config.name}</span>
                        <span className="text-sm font-bold">{value}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${colorClass}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      {isTrendData && data.trend && (
                        <div className={`text-xs text-center ${
                          data.trend === '上升' ? 'text-green-400' :
                          data.trend === '下降' ? 'text-red-400' : 'text-gray-400'
                        }`}>
                          {data.trend === '上升' && '↑'}
                          {data.trend === '下降' && '↓'}
                          {data.trend === '稳定' && '→'}
                          {' '}{data.trend}
                          {data.changeAmount !== 0 && ` (${data.changeAmount > 0 ? '+' : ''}${data.changeAmount})`}
                        </div>
                      )}
                      <p className="text-xs text-gray-500">{config.desc}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="card text-center py-4">
            <div className="text-gray-400">点击"展开"查看已探测的隐藏属性</div>
          </div>
        )}
      </div>
    </div>
  );
}
