import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { POSITIONS, POTENTIAL_RANKS } from '../data/gameConfig';

export default function StartScreen() {
  const createPlayer = useGameStore(state => state.createPlayer);
  const showMessagePopup = useGameStore(state => state.showMessagePopup);
  const currentPlayer = useGameStore(state => state.currentPlayer);
  const loadGame = useGameStore(state => state.loadGame);

  const [playerName, setPlayerName] = useState('');
  const [positionIndex, setPositionIndex] = useState(0);
  const [height, setHeight] = useState(0);
  const [weight, setWeight] = useState(0);
  const [potential, setPotential] = useState(0);
  const [potentialRank, setPotentialRank] = useState('common');
  const [hasSavedGame, setHasSavedGame] = useState(false);

  // 检查是否有本地存档
  useEffect(() => {
    const saved = localStorage.getItem('basketballGameState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.currentPlayer) {
          setHasSavedGame(true);
        }
      } catch (e) {
        console.error('Failed to parse saved game:', e);
      }
    }
  }, []);

  const generateRandomStats = () => {
    const pos = POSITIONS[positionIndex];
    const randomHeight = Math.floor(Math.random() * (pos.heightMax - pos.heightMin + 1)) + pos.heightMin;
    const randomWeight = Math.floor(Math.random() * (pos.weightMax - pos.weightMin + 1)) + pos.weightMin;
    setHeight(randomHeight);
    setWeight(randomWeight);

    const rand = Math.random();
    let newPotential, newRank;
    if (rand < 0.4) {
      newPotential = Math.floor(Math.random() * 11) + 60;
      newRank = 'common';
    } else if (rand < 0.75) {
      newPotential = Math.floor(Math.random() * 10) + 71;
      newRank = 'good';
    } else if (rand < 0.95) {
      newPotential = Math.floor(Math.random() * 10) + 81;
      newRank = 'elite';
    } else {
      newPotential = Math.floor(Math.random() * 10) + 91;
      newRank = 'legendary';
    }
    setPotential(newPotential);
    setPotentialRank(newRank);
  };

  useEffect(() => {
    generateRandomStats();
  }, [positionIndex]);

  const handleCreate = () => {
    if (!playerName.trim()) {
      showMessagePopup('请输入球员名称');
      return;
    }

    createPlayer(playerName.trim(), positionIndex, height, weight, potential, potentialRank);
  };

  const pos = POSITIONS[positionIndex];
  const potentialData = POTENTIAL_RANKS.find(p => p.id === potentialRank);

  return (
    <div id="startScreen" className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
        篮场崛起
      </h1>
      <p className="text-lg opacity-80 mb-8">从零到巨星</p>

      <div className="w-full max-w-md">
        <div className="card mb-4">
          <label className="block text-sm font-medium mb-2">球员名称</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="请输入球员名称"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
          />
        </div>

        <div className="card mb-4">
          <label className="block text-sm font-medium mb-2">选择位置</label>
          <div className="grid grid-cols-5 gap-2">
            {POSITIONS.map((p, index) => (
              <button
                key={index}
                onClick={() => setPositionIndex(index)}
                className={`p-2 rounded-lg text-sm font-medium transition-all ${
                  positionIndex === index
                    ? 'bg-yellow-500 text-black'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {p.abbr}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-400">{pos.name}</p>
        </div>

        <div className="card mb-4">
          <label className="block text-sm font-medium mb-2">身体数据</label>
          <div className="flex gap-4">
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold text-blue-400">{height}cm</div>
              <div className="text-xs text-gray-400">身高</div>
            </div>
            <div className="flex-1 text-center">
              <div className="text-2xl font-bold text-green-400">{weight}kg</div>
              <div className="text-xs text-gray-400">体重</div>
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <label className="block text-sm font-medium mb-2">潜力评级</label>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
                style={{ backgroundColor: `${potentialData?.color}30`, color: potentialData?.color }}
              >
                {potential}
              </div>
              <div>
                <div className="font-bold" style={{ color: potentialData?.color }}>
                  {potentialData?.name}
                </div>
                <div className="text-xs text-gray-400">潜力值决定成长上限</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">属性上限</div>
              <div className="font-bold">{Math.floor(potential / 10)}</div>
            </div>
          </div>
        </div>

        <button onClick={generateRandomStats} className="btn-secondary w-full mb-4">
          🔄 重新随机
        </button>

        <button onClick={handleCreate} className="btn-primary w-full">
          🏀 创建球员
        </button>

        {hasSavedGame && (
          <button
            onClick={() => {
              loadGame();
              useGameStore.getState().setCurrentScreen('Main');
            }}
            className="btn-success w-full mt-4"
          >
            ▶️ 继续游戏
          </button>
        )}
      </div>
    </div>
  );
}
