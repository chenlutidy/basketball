import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { STAFF_TYPES, STAFF_LEVELS, HIDDEN_ATTRIBUTES } from '../data/gameConfig';

export default function Staff() {
  const [activeTab, setActiveTab] = useState('list');
  const [scoutResults, setScoutResults] = useState({});
  const [agentResult, setAgentResult] = useState(null);
  const [detectingAttr, setDetectingAttr] = useState(null);

  const currentPlayer = useGameStore(state => state.currentPlayer);
  const setCurrentScreen = useGameStore(state => state.setCurrentScreen);
  const hireStaff = useGameStore(state => state.hireStaff);
  const upgradeStaff = useGameStore(state => state.upgradeStaff);
  const scoutSingleAttribute = useGameStore(state => state.scoutSingleAttribute);
  const scoutAttributeTrend = useGameStore(state => state.scoutAttributeTrend);
  const agentDraftHelp = useGameStore(state => state.agentDraftHelp);
  const agentContractHelp = useGameStore(state => state.agentContractHelp);
  const showMessagePopup = useGameStore(state => state.showMessagePopup);

  if (!currentPlayer) {
    setCurrentScreen('Start');
    return null;
  }

  const handleHire = (staffType) => {
    const result = hireStaff(staffType);
    showMessagePopup(result.message);
    if (result.success) {
      setActiveTab('list');
    }
  };

  const handleUpgrade = (staffId) => {
    const result = upgradeStaff(staffId);
    showMessagePopup(result.message);
  };

  const handleDetectAttribute = (attributeKey, mode = 'value') => {
    setDetectingAttr(attributeKey);
    
    const scoutFunc = mode === 'trend' ? scoutAttributeTrend : scoutSingleAttribute;
    const result = scoutFunc(attributeKey);
    
    if (result.success && result.revealed) {
      setScoutResults(prev => ({
        ...prev,
        [attributeKey]: result.revealed
      }));
      setAgentResult(null);
    }
    
    showMessagePopup(result.message);
    setDetectingAttr(null);
  };

  const handleAgentDraft = () => {
    const result = agentDraftHelp();
    setAgentResult(result);
    setScoutResults({});
    showMessagePopup(result.message);
  };

  const handleAgentContract = () => {
    const result = agentContractHelp();
    setAgentResult(result);
    setScoutResults({});
    showMessagePopup(result.message);
  };

  const getStaffLevelName = (level) => {
    return STAFF_LEVELS[level - 1]?.name || '未知';
  };

  const getSuccessRate = (level) => {
    return Math.round((STAFF_LEVELS[level - 1]?.successRate || 0.6) * 100);
  };

  const getUpgradeCost = (level) => {
    return STAFF_LEVELS[level]?.upgradeCost || 0;
  };

  const hasStaff = (type) => {
    return currentPlayer.staff?.some(s => s.type === type);
  };

  const getDetectCost = () => {
    return STAFF_TYPES.scout.detectCost;
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">🏢 职员管理</h1>
            <p className="text-gray-400">雇佣和管理你的团队</p>
          </div>
          <button onClick={() => setCurrentScreen('Main')} className="btn-secondary btn-sm">
            返回
          </button>
        </div>

        {/* 标签页 */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            我的职员
          </button>
          <button
            onClick={() => setActiveTab('hire')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeTab === 'hire' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            雇佣职员
          </button>
          {hasStaff('scout') && (
            <button
              onClick={() => setActiveTab('scout')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                activeTab === 'scout' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              🔍 球探服务
            </button>
          )}
          {hasStaff('agent') && (
            <button
              onClick={() => setActiveTab('agent')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                activeTab === 'agent' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              💼 经纪人服务
            </button>
          )}
        </div>

        {/* 职员列表 */}
        {activeTab === 'list' && (
          <div>
            <h2 className="text-lg font-bold mb-4">已雇佣的职员</h2>
            {currentPlayer.staff && currentPlayer.staff.length > 0 ? (
              <div className="space-y-4">
                {currentPlayer.staff.map(staff => {
                  const config = STAFF_TYPES[staff.type];
                  const upgradeCost = getUpgradeCost(staff.level);
                  const canUpgrade = staff.level < STAFF_LEVELS.length;

                  return (
                    <div key={staff.id} className="card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{config.icon}</div>
                          <div>
                            <div className="font-bold text-lg">{staff.name}</div>
                            <div className="text-gray-400">{config.name} · {getStaffLevelName(staff.level)}</div>
                            <div className="text-xs text-gray-500">入职时间: {staff.hiredAt}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-bold">成功率: {getSuccessRate(staff.level)}%</div>
                          {canUpgrade ? (
                            <button
                              onClick={() => handleUpgrade(staff.id)}
                              className="mt-2 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 rounded text-sm"
                              disabled={currentPlayer.economy.gold < upgradeCost}
                            >
                              升级 ({upgradeCost}金币)
                            </button>
                          ) : (
                            <div className="text-yellow-400 text-sm">已达最高等级</div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <div className="text-sm text-gray-400">技能:</div>
                        <div className="flex gap-2 mt-1">
                          {config.skills.map(skill => (
                            <span key={skill} className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs">
                              {skill === 'draft_negotiation' && '选秀谈判'}
                              {skill === 'contract_signing' && '合同签约'}
                              {skill === 'hidden_attr_detect' && '隐藏属性探测'}
                              {skill === 'potential_analyze' && '潜力分析'}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="card text-center py-8">
                <div className="text-gray-400 mb-4">暂无职员，去雇佣一些吧！</div>
                <button
                  onClick={() => setActiveTab('hire')}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded"
                >
                  前往雇佣
                </button>
              </div>
            )}
          </div>
        )}

        {/* 雇佣职员 */}
        {activeTab === 'hire' && (
          <div>
            <h2 className="text-lg font-bold mb-4">可雇佣的职员</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(STAFF_TYPES).map(type => {
                const alreadyHired = hasStaff(type.id);
                const cost = type.hireCost;

                return (
                  <div key={type.id} className="card">
                    <div className="text-center">
                      <div className="text-5xl mb-3">{type.icon}</div>
                      <h3 className="text-xl font-bold">{type.name}</h3>
                      <p className="text-gray-400 text-sm mt-2">{type.desc}</p>
                      <div className="mt-4 space-y-2">
                        <div className="text-sm text-gray-400">雇佣费用:</div>
                        <div className="text-yellow-400 font-bold">{cost} 金币</div>
                        {type.id === 'scout' && (
                          <div className="text-xs text-gray-500">
                            探测费用: {type.detectCost} 金币/次
                          </div>
                        )}
                      </div>
                      <div className="mt-4">
                        {alreadyHired ? (
                          <div className="px-4 py-2 bg-gray-600 rounded text-gray-400">已雇佣</div>
                        ) : (
                          <button
                            onClick={() => handleHire(type.id)}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded"
                            disabled={currentPlayer.economy.gold < cost}
                          >
                            雇佣
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 球探服务 */}
        {activeTab === 'scout' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">球探服务</h2>
              <div className="text-sm text-gray-400">
                探测费用: <span className="text-yellow-400 font-bold">{getDetectCost()} 金币</span>/次
              </div>
            </div>
            
            <p className="text-sm text-gray-400 mb-6">
              每次只能探测一个隐藏属性，有失败概率。球探等级越高，成功率越高。
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Object.entries(HIDDEN_ATTRIBUTES).map(([key, config]) => {
                const isDetected = scoutResults[key];
                const isDetecting = detectingAttr === key;

                return (
                  <div key={key} className="card">
                    <div className="text-center">
                      <h3 className="font-bold mb-2">{config.name}</h3>
                      <p className="text-xs text-gray-400 mb-4">{config.desc}</p>
                      
                      {isDetected ? (
                        <div>
                          <div className="text-2xl font-bold text-green-400 mb-2">
                            {isDetected.value}
                          </div>
                          {isDetected.trend && (
                            <div className={`text-sm ${
                              isDetected.trend === '上升' ? 'text-green-400' :
                              isDetected.trend === '下降' ? 'text-red-400' : 'text-gray-400'
                            }`}>
                              {isDetected.trend === '上升' && '↑'}
                              {isDetected.trend === '下降' && '↓'}
                              {isDetected.trend === '稳定' && '→'}
                              {' '}{isDetected.trend}
                              {isDetected.changeAmount !== 0 && ` (${isDetected.changeAmount > 0 ? '+' : ''}${isDetected.changeAmount})`}
                            </div>
                          )}
                          <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                isDetected.value >= 80 ? 'bg-green-500' :
                                isDetected.value >= 60 ? 'bg-blue-500' :
                                isDetected.value >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${(isDetected.value / config.max) * 100}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-2xl mb-2">?</div>
                      )}

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleDetectAttribute(key, 'value')}
                          disabled={isDetecting}
                          className={`flex-1 px-2 py-1 rounded text-xs ${
                            isDetecting ? 'bg-gray-600' : 'bg-purple-500 hover:bg-purple-600'
                          }`}
                        >
                          {isDetecting ? '探测中...' : '探测数值'}
                        </button>
                        <button
                          onClick={() => handleDetectAttribute(key, 'trend')}
                          disabled={isDetecting}
                          className={`flex-1 px-2 py-1 rounded text-xs ${
                            isDetecting ? 'bg-gray-600' : 'bg-blue-500 hover:bg-blue-600'
                          }`}
                        >
                          {isDetecting ? '分析中...' : '分析趋势'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {Object.keys(scoutResults).length > 0 && (
              <div className="text-center">
                <button
                  onClick={() => setScoutResults({})}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded text-sm"
                >
                  清除探测结果
                </button>
              </div>
            )}
          </div>
        )}

        {/* 经纪人服务 */}
        {activeTab === 'agent' && (
          <div>
            <h2 className="text-lg font-bold mb-4">经纪人服务</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="card">
                <h3 className="font-bold mb-2">选秀谈判</h3>
                <p className="text-sm text-gray-400 mb-4">让经纪人在选秀中为你争取更好的位置和资源</p>
                <button
                  onClick={handleAgentDraft}
                  className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded"
                >
                  开始谈判
                </button>
              </div>
              <div className="card">
                <h3 className="font-bold mb-2">合同签约</h3>
                <p className="text-sm text-gray-400 mb-4">让经纪人协助与球队签约，提高成功率</p>
                <button
                  onClick={handleAgentContract}
                  className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 rounded"
                >
                  促成签约
                </button>
              </div>
            </div>

            {agentResult && (
              <div className={`card ${agentResult.success ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{agentResult.success ? '✅' : '❌'}</span>
                  <div>
                    <div className="font-bold">{agentResult.success ? '成功' : '失败'}</div>
                    <div className="text-sm text-gray-400">{agentResult.message}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
