import { useGameStore } from '../store/gameStore';
import { APPEARANCE } from '../data/gameConfig';

export default function Appearance() {
  const currentPlayer = useGameStore(state => state.currentPlayer);
  const equipAppearance = useGameStore(state => state.equipAppearance);
  const showMessagePopup = useGameStore(state => state.showMessagePopup);
  const setCurrentScreen = useGameStore(state => state.setCurrentScreen);

  if (!currentPlayer) {
    setCurrentScreen('Start');
    return null;
  }

  const handleEquip = (type, item) => {
    const isUnlocked = checkUnlocked(item);
    if (!isUnlocked) {
      showMessagePopup(getUnlockMessage(item));
      return;
    }

    const result = equipAppearance(type, item.id);
    showMessagePopup(result.message);
  };

  const checkUnlocked = (item) => {
    if (item.unlocked) return true;
    if (item.requirement?.fame && currentPlayer.statistics.fame >= item.requirement.fame) return true;
    if (item.requirement?.level && currentPlayer.level >= item.requirement.level) return true;
    return false;
  };

  const getUnlockMessage = (item) => {
    if (item.requirement?.fame) {
      return `需要 ${item.requirement.fame} 名气才能解锁！`;
    }
    if (item.requirement?.level) {
      return `需要达到 ${item.requirement.level} 级才能解锁！`;
    }
    return '需要完成特定成就才能解锁！';
  };

  const renderItems = (type, items) => (
    <div className="mb-6">
      <h3 className="font-bold mb-3">{getTypeName(type)}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map(item => {
          const isUnlocked = checkUnlocked(item);
          const isEquipped = currentPlayer.appearance[type] === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleEquip(type, item)}
              disabled={!isUnlocked}
              className={`relative p-3 rounded-lg border-2 transition-all ${
                isEquipped
                  ? 'border-yellow-500 bg-yellow-500/20'
                  : isUnlocked
                  ? 'border-white/20 hover:border-white/40'
                  : 'border-white/10 opacity-50 cursor-not-allowed'
              }`}
            >
              {type === 'jerseys' && (
                <div
                  className="w-full aspect-square rounded-lg mb-2"
                  style={{ backgroundColor: item.color }}
                />
              )}
              {type === 'skins' && (
                <div
                  className="w-full aspect-square rounded-full mb-2"
                  style={{ backgroundColor: item.color }}
                />
              )}
              {type === 'hairs' && (
                <div className="w-full aspect-square flex items-center justify-center text-3xl mb-2">
                  {item.id === 'hair_1' && '💇'}
                  {item.id === 'hair_2' && '👱'}
                  {item.id === 'hair_3' && '👨'}
                  {item.id === 'hair_4' && '👨‍🦰'}
                  {item.id === 'hair_5' && '🧑‍🦱'}
                </div>
              )}
              {type === 'accessories' && (
                <div className="w-full aspect-square flex items-center justify-center text-3xl mb-2">
                  {item.id === 'acc_1' && '💪'}
                  {item.id === 'acc_2' && '🎧'}
                  {item.id === 'acc_3' && '⚡'}
                  {item.id === 'acc_4' && '👟'}
                  {item.id === 'acc_5' && '🥽'}
                </div>
              )}
              <div className="text-center">
                <div className="text-sm font-medium">{item.name}</div>
                {item.bonus && Object.keys(item.bonus).length > 0 && (
                  <div className="text-xs text-green-400">
                    {Object.entries(item.bonus).map(([key, value]) => (
                      <span key={key}>{getAttrName(key)}+{value}</span>
                    ))}
                  </div>
                )}
                {isEquipped && <div className="text-xs text-yellow-400">✓ 已装备</div>}
                {!isUnlocked && <div className="text-xs text-gray-400">🔒 未解锁</div>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const getTypeName = (type) => {
    const names = { jerseys: '球衣', hairs: '发型', skins: '肤色', accessories: '配饰' };
    return names[type] || type;
  };

  const getAttrName = (key) => {
    const names = {
      speed: '速度',
      jump: '弹跳',
      strength: '力量',
      threePoint: '三分',
      inside: '内线',
      defense: '防守',
      dribble: '运球',
      pass: '传球',
      stamina: '体能',
    };
    return names[key] || key;
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">🎨 外观定制</h1>
            <p className="text-gray-400">打造独一无二的球员形象</p>
          </div>
          <button onClick={() => setCurrentScreen('Main')} className="btn-secondary btn-sm">
            返回
          </button>
        </div>

        <div className="card mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold"
              style={{ backgroundColor: APPEARANCE.skins.find(s => s.id === currentPlayer.appearance.skin)?.color }}>
              {currentPlayer.playerName.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-lg">{currentPlayer.playerName}</div>
              <div className="text-sm text-gray-400">
                {APPEARANCE.jerseys.find(j => j.id === currentPlayer.appearance.jersey)?.name}
              </div>
            </div>
          </div>
        </div>

        {renderItems('jerseys', APPEARANCE.jerseys)}
        {renderItems('hairs', APPEARANCE.hairs)}
        {renderItems('skins', APPEARANCE.skins)}
        {renderItems('accessories', APPEARANCE.accessories)}
      </div>
    </div>
  );
}
