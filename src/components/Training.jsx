import { useGameStore } from '../store/gameStore';

export default function Training() {
  const currentPlayer = useGameStore(state => state.currentPlayer);
  const train = useGameStore(state => state.train);
  const rest = useGameStore(state => state.rest);
  const showMessagePopup = useGameStore(state => state.showMessagePopup);
  const setCurrentScreen = useGameStore(state => state.setCurrentScreen);

  const trainingTypes = [
    { id: 'Offense', icon: '🏀', name: '进攻训练', attrs: ['三分', '内线', '运球'] },
    { id: 'Defense', icon: '🛡️', name: '防守训练', attrs: ['防守', '弹跳', '力量'] },
    { id: 'Physical', icon: '💪', name: '体能训练', attrs: ['速度', '力量', '体能'] },
    { id: 'Mental', icon: '🧠', name: '心理训练', attrs: ['传球', '运球', '防守'] },
  ];

  const handleTrain = (type) => {
    const result = train(type);
    showMessagePopup(result.message);
  };

  const handleRest = () => {
    const result = rest();
    showMessagePopup(result.message);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">💪 训练中心</h1>
            <p className="text-gray-400">提升球员能力</p>
          </div>
          <button onClick={() => setCurrentScreen('Main')} className="btn-secondary btn-sm">
            返回
          </button>
        </div>

        <div className="card mb-6">
          <div className="flex flex-wrap gap-4 text-center">
            <div className="flex-1">
              <div className="text-green-400 font-bold text-xl">{currentPlayer?.status.currentStamina || 0}/{currentPlayer?.status.maxStamina || 100}</div>
              <div className="text-xs text-gray-400">体力</div>
            </div>
            <div className="flex-1">
              <div className="text-blue-400 font-bold text-xl">Lv.{currentPlayer?.level || 1}</div>
              <div className="text-xs text-gray-400">等级</div>
            </div>
            <div className="flex-1">
              <div className="text-yellow-400 font-bold text-xl">{currentPlayer?.exp || 0}/{(currentPlayer?.level || 1) * 100}</div>
              <div className="text-xs text-gray-400">经验</div>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-bold mb-4">选择训练类型</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trainingTypes.map(type => (
            <button
              key={type.id}
              onClick={() => handleTrain(type.id)}
              className="card text-left hover:bg-white/20 transition-all group"
            >
              <div className="flex items-center gap-4 mb-3">
                <span className="text-4xl group-hover:scale-110 transition-transform">
                  {type.icon}
                </span>
                <div>
                  <div className="font-bold text-lg">{type.name}</div>
                  <div className="text-sm text-gray-400">消耗20体力</div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {type.attrs.map(attr => (
                  <span key={attr} className="px-2 py-1 bg-white/10 rounded text-xs">
                    {attr}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6">
          <button onClick={handleRest} className="btn-success w-full">
            😴 休息恢复体力
          </button>
        </div>
      </div>
    </div>
  );
}
