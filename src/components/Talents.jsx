import { useGameStore } from '../store/gameStore';
import { TALENTS } from '../data/gameConfig';

export default function Talents() {
  const currentPlayer = useGameStore(state => state.currentPlayer);
  const selectTalent = useGameStore(state => state.selectTalent);
  const showMessagePopup = useGameStore(state => state.showMessagePopup);
  const setCurrentScreen = useGameStore(state => state.setCurrentScreen);

  if (!currentPlayer) {
    setCurrentScreen('Start');
    return null;
  }

  const positionAbbr = currentPlayer.positionAbbr;
  const positionTalents = TALENTS[positionAbbr] || [];

  const handleSelectTalent = (talent) => {
    if (currentPlayer.level < talent.unlockLevel) {
      showMessagePopup(`需要达到 ${talent.unlockLevel} 级才能解锁此天赋！`);
      return;
    }

    const result = selectTalent(talent.id);
    showMessagePopup(result.message);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">✨ 天赋系统</h1>
            <p className="text-gray-400">选择专属天赋，提升球员能力</p>
          </div>
          <button onClick={() => setCurrentScreen('Main')} className="btn-secondary btn-sm">
            返回
          </button>
        </div>

        <div className="card mb-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-400">当前等级</span>
              <span className="text-2xl font-bold text-blue-400 ml-2">Lv.{currentPlayer.level}</span>
            </div>
            <div>
              <span className="text-gray-400">已选天赋</span>
              <span className="text-2xl font-bold text-yellow-400 ml-2">{(currentPlayer.talents || []).length}/3</span>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-bold mb-4">{positionAbbr} 专属天赋</h2>
        <div className="space-y-4">
          {positionTalents.map(talent => {
            const isUnlocked = currentPlayer.level >= talent.unlockLevel;
            const isSelected = (currentPlayer.talents || []).includes(talent.id);

            return (
              <div
                key={talent.id}
                className={`card ${!isUnlocked ? 'opacity-50' : ''} ${isSelected ? 'border-green-500/50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{talent.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{talent.name}</span>
                      {isSelected && <span className="text-green-400 text-sm">✓ 已选择</span>}
                      {!isUnlocked && <span className="text-gray-400 text-sm">Lv.{talent.unlockLevel} 解锁</span>}
                    </div>
                    <div className="text-gray-400 text-sm">{talent.desc}</div>
                  </div>
                  <button
                    onClick={() => handleSelectTalent(talent)}
                    disabled={!isUnlocked || isSelected}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      isSelected
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : isUnlocked
                        ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isSelected ? '已选择' : isUnlocked ? '选择' : '未解锁'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
