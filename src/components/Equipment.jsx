import { useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';

const EQUIPMENT_TYPES = {
  headband: { name: '头巾', icon: '🏁', attrs: ['morale', 'pressure'] },
  wristband: { name: '护腕', icon: '📿', attrs: ['midRange', 'steal'] },
  kneepad: { name: '护膝', icon: '🦵', attrs: ['stamina', 'block'] },
  jersey: { name: '球衣', icon: '👕', attrs: ['speed', 'breakThrough'] },
  shoes: { name: '球鞋', icon: '👟', attrs: ['speed', 'rebound'] },
};

const EQUIPMENT_QUALITY = {
  white: { name: '普通', color: '#95a5a6', minBonus: 1, maxBonus: 3, cost: 100 },
  green: { name: '优秀', color: '#27ae60', minBonus: 4, maxBonus: 6, cost: 500 },
  blue: { name: '精良', color: '#3498db', minBonus: 7, maxBonus: 9, cost: 1500 },
  purple: { name: '史诗', color: '#9b59b6', minBonus: 10, maxBonus: 12, cost: 3000 },
  orange: { name: '传说', color: '#e67e22', minBonus: 13, maxBonus: 15, cost: 5000 },
};

const EQUIPMENT_SHOP = [
  { id: 'white_kneepad', type: 'kneepad', quality: 'white', name: '普通护膝', desc: '基础防护装备' },
  { id: 'white_jersey', type: 'jersey', quality: 'white', name: '普通球衣', desc: '基础球衣' },
  { id: 'white_shoes', type: 'shoes', quality: 'white', name: '普通球鞋', desc: '基础球鞋' },
  { id: 'white_wristband', type: 'wristband', quality: 'white', name: '普通护腕', desc: '基础护腕' },
  { id: 'white_headband', type: 'headband', quality: 'white', name: '普通头巾', desc: '基础头巾' },
  { id: 'green_kneepad', type: 'kneepad', quality: 'green', name: '优秀护膝', desc: '较好的防护效果' },
  { id: 'green_jersey', type: 'jersey', quality: 'green', name: '优秀球衣', desc: '轻便透气' },
  { id: 'green_shoes', type: 'shoes', quality: 'green', name: '优秀球鞋', desc: '轻便舒适' },
  { id: 'green_wristband', type: 'wristband', quality: 'green', name: '优秀护腕', desc: '舒适贴手' },
  { id: 'green_headband', type: 'headband', quality: 'green', name: '优秀头巾', desc: '吸汗透气' },
  { id: 'blue_kneepad', type: 'kneepad', quality: 'blue', name: '精良护膝', desc: '专业防护' },
  { id: 'blue_jersey', type: 'jersey', quality: 'blue', name: '精良球衣', desc: '专业比赛服' },
  { id: 'blue_shoes', type: 'shoes', quality: 'blue', name: '精良球鞋', desc: '专业战靴' },
  { id: 'blue_wristband', type: 'wristband', quality: 'blue', name: '精良护腕', desc: '专业护具' },
  { id: 'blue_headband', type: 'headband', quality: 'blue', name: '精良头巾', desc: '专业运动头巾' },
  { id: 'purple_kneepad', type: 'kneepad', quality: 'purple', name: '史诗护膝', desc: '顶级防护装备' },
  { id: 'purple_jersey', type: 'jersey', quality: 'purple', name: '史诗球衣', desc: '限量版球衣' },
  { id: 'purple_shoes', type: 'shoes', quality: 'purple', name: '史诗球鞋', desc: '签名球鞋' },
  { id: 'purple_wristband', type: 'wristband', quality: 'purple', name: '史诗护腕', desc: '定制护腕' },
  { id: 'purple_headband', type: 'headband', quality: 'purple', name: '史诗头巾', desc: '限量版头巾' },
];

const ATTR_NAMES = {
  speed: '速度', jump: '弹跳', strength: '力量', threePoint: '三分',
  inside: '内线', defense: '防守', dribble: '运球', pass: '传球',
  stamina: '体能', morale: '士气', pressure: '抗压', rebound: '篮板',
  block: '盖帽', steal: '抢断', midRange: '中投', breakThrough: '突破',
};

function generateRandomBonus(quality) {
  const q = EQUIPMENT_QUALITY[quality];
  const bonus = {};
  const bonusValue = Math.floor(Math.random() * (q.maxBonus - q.minBonus + 1)) + q.minBonus;
  bonus.bonus1 = bonusValue;
  if (Math.random() > 0.5) {
    bonus.bonus2 = Math.floor(bonusValue * 0.6);
  }
  return bonus;
}

export default function Equipment() {
  const currentPlayer = useGameStore(state => state.currentPlayer);
  const showMessagePopup = useGameStore(state => state.showMessagePopup);
  const setCurrentScreen = useGameStore(state => state.setCurrentScreen);

  const [activeTab, setActiveTab] = useState('worn');
  const [shopFilter, setShopFilter] = useState('all');
  const [backpackQualityFilter, setBackpackQualityFilter] = useState('all');
  const [backpackTypeFilter, setBackpackTypeFilter] = useState('all');

  const backpack = currentPlayer?.backpack || [];
  const worn = currentPlayer?.equipment?.worn || {};

  const handleBuy = (shopItem) => {
    const quality = EQUIPMENT_QUALITY[shopItem.quality];
    if (currentPlayer.economy.gold < quality.cost) {
      showMessagePopup('金币不足！');
      return;
    }

    const bonus = generateRandomBonus(shopItem.quality);
    const typeInfo = EQUIPMENT_TYPES[shopItem.type];
    const newEquip = {
      id: `${shopItem.id}_${Date.now()}`,
      type: shopItem.type,
      quality: shopItem.quality,
      name: shopItem.name,
      desc: shopItem.desc,
      bonus,
      attr1: typeInfo.attrs[0],
      attr2: typeInfo.attrs[1],
    };

    const state = useGameStore.getState();
    const updatedPlayer = { ...state.currentPlayer };
    updatedPlayer.economy.gold -= quality.cost;
    updatedPlayer.backpack = [...(updatedPlayer.backpack || []), newEquip];

    useGameStore.setState({ currentPlayer: updatedPlayer });
    showMessagePopup(`购买成功！获得 ${shopItem.name}`);
  };

  const handleEquip = (item) => {
    const state = useGameStore.getState();
    const updatedPlayer = { ...state.currentPlayer };
    const currentWorn = { ...(updatedPlayer.equipment?.worn || {}) };

    if (currentWorn[item.type]) {
      updatedPlayer.backpack = [...(updatedPlayer.backpack || []), currentWorn[item.type]];
    }

    currentWorn[item.type] = item;
    updatedPlayer.backpack = (updatedPlayer.backpack || []).filter(b => b.id !== item.id);
    updatedPlayer.equipment = { ...(updatedPlayer.equipment || {}), worn: currentWorn };

    useGameStore.setState({ currentPlayer: updatedPlayer });
    showMessagePopup(`装备 ${item.name} 成功！`);
  };

  const handleUnequip = (type) => {
    const state = useGameStore.getState();
    const updatedPlayer = { ...state.currentPlayer };
    const currentWorn = { ...(updatedPlayer.equipment?.worn || {}) };

    if (currentWorn[type]) {
      updatedPlayer.backpack = [...(updatedPlayer.backpack || []), currentWorn[type]];
      delete currentWorn[type];
      updatedPlayer.equipment = { ...(updatedPlayer.equipment || {}), worn: currentWorn };
      useGameStore.setState({ currentPlayer: updatedPlayer });
      showMessagePopup(`卸下 ${EQUIPMENT_TYPES[type].name} 成功！`);
    }
  };

  const handleSell = (itemId) => {
    const state = useGameStore.getState();
    const updatedPlayer = { ...state.currentPlayer };
    const item = (updatedPlayer.backpack || []).find(b => b.id === itemId);
    if (!item) return;

    const quality = EQUIPMENT_QUALITY[item.quality];
    const sellPrice = Math.floor(quality.cost * 0.5);
    updatedPlayer.backpack = (updatedPlayer.backpack || []).filter(b => b.id !== itemId);
    updatedPlayer.economy.gold += sellPrice;
    useGameStore.setState({ currentPlayer: updatedPlayer });
    showMessagePopup(`出售 ${item.name}，获得 ${sellPrice} 金币！`);
  };

  const getTotalBonus = () => {
    const bonus = {};
    Object.values(worn).forEach(item => {
      if (!item) return;
      if (item.attr1 && item.bonus?.bonus1) {
        bonus[item.attr1] = (bonus[item.attr1] || 0) + item.bonus.bonus1;
      }
      if (item.attr2 && item.bonus?.bonus2) {
        bonus[item.attr2] = (bonus[item.attr2] || 0) + item.bonus.bonus2;
      }
    });
    return bonus;
  };

  const filteredShopItems = useMemo(() => {
    if (shopFilter === 'all') return EQUIPMENT_SHOP;
    return EQUIPMENT_SHOP.filter(item => item.quality === shopFilter);
  }, [shopFilter]);

  const filteredBackpack = useMemo(() => {
    let items = backpack;
    if (backpackQualityFilter !== 'all') {
      items = items.filter(i => i.quality === backpackQualityFilter);
    }
    if (backpackTypeFilter !== 'all') {
      items = items.filter(i => i.type === backpackTypeFilter);
    }
    return items;
  }, [backpack, backpackQualityFilter, backpackTypeFilter]);

  const totalBonus = getTotalBonus();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">🎒 装备面板</h1>
            <p className="text-gray-400">管理球员装备</p>
          </div>
          <button onClick={() => setCurrentScreen('Main')} className="btn-secondary btn-sm">
            返回
          </button>
        </div>

        <div className="card">
          <div className="flex gap-3 mb-6 flex-wrap">
            <button
              onClick={() => setActiveTab('worn')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'worn' ? 'bg-yellow-500 text-black' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              👕 穿戴装备
            </button>
            <button
              onClick={() => setActiveTab('backpack')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'backpack' ? 'bg-yellow-500 text-black' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              🎒 背包
            </button>
            <button
              onClick={() => setActiveTab('shop')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'shop' ? 'bg-yellow-500 text-black' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              🏪 装备商店
            </button>
          </div>

          {activeTab === 'worn' && (
            <div>
              <h4 className="font-bold mb-4">当前穿戴装备</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {Object.entries(EQUIPMENT_TYPES).map(([type, info]) => {
                  const wornItem = worn[type];
                  return (
                    <div
                      key={type}
                      className="p-4 rounded-xl border border-white/10 bg-white/5 text-center"
                    >
                      <div className="text-3xl mb-2">{info.icon}</div>
                      <div className="font-bold text-sm mb-2">{info.name}</div>
                      {wornItem ? (
                        <div>
                          <div className="text-sm font-medium" style={{ color: EQUIPMENT_QUALITY[wornItem.quality]?.color }}>
                            {wornItem.name}
                          </div>
                          <div className="text-xs text-green-400 mt-1">
                            {ATTR_NAMES[wornItem.attr1]} +{wornItem.bonus?.bonus1 || 0}
                          </div>
                          {wornItem.bonus?.bonus2 > 0 && (
                            <div className="text-xs text-green-400">
                              {ATTR_NAMES[wornItem.attr2]} +{wornItem.bonus.bonus2}
                            </div>
                          )}
                          <button
                            onClick={() => handleUnequip(type)}
                            className="mt-2 text-xs px-3 py-1 bg-white/10 rounded hover:bg-white/20"
                          >
                            卸下
                          </button>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">未穿戴</div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-white/5">
                <h4 className="font-bold mb-3">📊 装备属性加成总和</h4>
                <div className="flex flex-wrap gap-3">
                  {Object.keys(totalBonus).length > 0 ? (
                    Object.entries(totalBonus).map(([attr, value]) => (
                      <span key={attr} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                        {ATTR_NAMES[attr]} +{value}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">暂无装备加成</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backpack' && (
            <div>
              <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
                <h4 className="font-bold">🎒 背包（共 {backpack.length} 件）</h4>
                <div className="flex gap-2 flex-wrap">
                  <select
                    value={backpackQualityFilter}
                    onChange={(e) => setBackpackQualityFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white/10 text-white border-none text-sm"
                  >
                    <option value="all">全部品质</option>
                    <option value="white">普通</option>
                    <option value="green">优秀</option>
                    <option value="blue">精良</option>
                    <option value="purple">史诗</option>
                    <option value="orange">传说</option>
                  </select>
                  <select
                    value={backpackTypeFilter}
                    onChange={(e) => setBackpackTypeFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white/10 text-white border-none text-sm"
                  >
                    <option value="all">全部类型</option>
                    <option value="kneepad">护膝</option>
                    <option value="jersey">球衣</option>
                    <option value="shoes">球鞋</option>
                    <option value="wristband">护腕</option>
                    <option value="headband">头巾</option>
                  </select>
                </div>
              </div>

              {filteredBackpack.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  背包为空，去商店购买或参加比赛获取装备吧！
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredBackpack.map(item => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border-2 transition-all"
                      style={{ borderColor: `${EQUIPMENT_QUALITY[item.quality]?.color}40` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{EQUIPMENT_TYPES[item.type]?.icon}</div>
                        <div className="flex-1">
                          <div className="font-bold" style={{ color: EQUIPMENT_QUALITY[item.quality]?.color }}>
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-400">{item.desc}</div>
                          <div className="text-xs text-green-400 mt-1">
                            {ATTR_NAMES[item.attr1]} +{item.bonus?.bonus1 || 0}
                            {item.bonus?.bonus2 > 0 && ` | ${ATTR_NAMES[item.attr2]} +${item.bonus.bonus2}`}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleEquip(item)}
                            className="px-3 py-1 bg-yellow-500 text-black rounded text-xs font-medium hover:bg-yellow-400"
                          >
                            穿戴
                          </button>
                          <button
                            onClick={() => handleSell(item.id)}
                            className="px-3 py-1 bg-white/10 rounded text-xs hover:bg-white/20"
                          >
                            出售 {Math.floor((EQUIPMENT_QUALITY[item.quality]?.cost || 0) * 0.5)}💰
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'shop' && (
            <div>
              <h4 className="font-bold mb-4">🏪 装备商店</h4>
              <div className="flex gap-2 mb-4 flex-wrap">
                <button
                  onClick={() => setShopFilter('all')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    shopFilter === 'all' ? 'bg-yellow-500 text-black' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  全部
                </button>
                {Object.entries(EQUIPMENT_QUALITY).map(([key, q]) => (
                  <button
                    key={key}
                    onClick={() => setShopFilter(key)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      shopFilter === key ? 'bg-yellow-500 text-black' : 'bg-white/10 hover:bg-white/20'
                    }`}
                    style={shopFilter !== key ? { color: q.color } : {}}
                  >
                    {q.name}
                  </button>
                ))}
              </div>

              <div className="mb-4 text-yellow-400">
                💰 当前金币: {currentPlayer?.economy?.gold || 0}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredShopItems.map(shopItem => {
                  const quality = EQUIPMENT_QUALITY[shopItem.quality];
                  const canAfford = (currentPlayer?.economy?.gold || 0) >= quality.cost;
                  return (
                    <div
                      key={shopItem.id}
                      className="p-4 rounded-xl border-2 transition-all"
                      style={{ borderColor: `${quality.color}40` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{EQUIPMENT_TYPES[shopItem.type]?.icon}</div>
                        <div className="flex-1">
                          <div className="font-bold" style={{ color: quality.color }}>
                            {shopItem.name}
                          </div>
                          <div className="text-xs text-gray-400">{shopItem.desc}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            属性加成: {quality.minBonus}~{quality.maxBonus} 点
                          </div>
                        </div>
                        <button
                          onClick={() => handleBuy(shopItem)}
                          disabled={!canAfford}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            canAfford
                              ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          💰 {quality.cost}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
