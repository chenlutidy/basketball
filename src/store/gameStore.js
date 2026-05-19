import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { POSITIONS, POTENTIAL_RANKS, HIDDEN_ATTRIBUTES, EQUIPMENT, STAFF_TYPES, STAFF_LEVELS, STAFF_NAMES, DRAFT_CONFIG, OLD_DRAFT_CONFIG, calculateDraftProbability, generateTargetOverall, generateAIPlayer } from '../data/gameConfig';

const initialAttributes = {
  speed: 10,
  jump: 10,
  strength: 10,
  threePoint: 10,
  inside: 10,
  defense: 10,
  dribble: 10,
  pass: 10,
  stamina: 10,
  rebound: 10,
  morale: 10,
  pressure: 10,
  block: 10,
  steal: 10,
  midRange: 10,
  breakThrough: 10,
};

const initialHiddenAttributes = {
  clutch: 50,
  consistency: 50,
  basketballIQ: 50,
  workEthic: 50,
  leadership: 50,
  adaptability: 50,
  injuryResistance: 50,
  mentalToughness: 50,
};

const initialStatistics = {
  gamesPlayed: 0,
  streetWins: 0,
  streetMVP: 0,
  mvpCount: 0,
  totalPoints: 0,
  totalRebounds: 0,
  totalAssists: 0,
  totalSteals: 0,
  totalBlocks: 0,
  fame: 0,
};

const initialStatus = {
  currentStamina: 100,
  maxStamina: 100,
  streetGamesToday: 0,
  league: 0,
  season: 1,
  gamesRemaining: 30,
  playoffsRound: 0,
};

const initialEconomy = {
  gold: 400,
};

const initialAppearance = {
  jersey: 'jersey_1',
  hair: 'hair_1',
  skin: 'skin_1',
  accessory: 'acc_1',
};

const initialPlayer = {
  playerName: '',
  position: 0,
  positionAbbr: 'PG',
  age: 18,
  height: 180,
  weight: 70,
  level: 1,
  exp: 0,
  overall: 10,
  title: '',
  playTime: 0,
  potential: 70,
  potentialRank: 'common',
  attributes: { ...initialAttributes },
  hiddenAttributes: { ...initialHiddenAttributes },
  statistics: { ...initialStatistics },
  status: { ...initialStatus },
  economy: { ...initialEconomy },
  appearance: { ...initialAppearance },
  equipment: { worn: {} },
  backpack: [],
  talents: [],
  staff: [], // 职员列表
  draft: {
    remainingDailyDrafts: DRAFT_CONFIG.dailyFreeDrafts,
    lastDraftReset: new Date().toDateString(), // 用于追踪每日重置
    appliedToday: 0, // 今日已报名次数
    consecutiveFailures: 0, // 连续落选次数
    badge: null, // 选秀徽章
    scoutedAttributes: {}, // 球探已探测到的隐藏属性 { key: value }
  },
};

export const useGameStore = create(
  (set, get) => ({
      currentPlayer: null,
      aiTeams: [],
      friends: [],
      leaderboard: [],
      matchHistory: [],
      draftPool: [], // 当前选秀池
      draftHistory: [], // 选秀历史记录
      draftPhase: 'idle', // 选秀阶段：idle, registration, drafting, finished
      draftCountdown: 0, // 选秀倒计时（秒）
      draftIntervalId: null, // 倒计时定时器ID
      draftTargetOverall: null, // 当前轮次盲盒目标总评
      currentScreen: 'Start',
      message: '',
      showMessage: false,
      lastSaveTime: null,

      initializeGame: () => {
        const state = get();
        if (!state.currentPlayer) {
          set({ currentPlayer: { ...initialPlayer } });
        }
      },

      startAutoSave: () => {
        setInterval(() => {
          const state = get();
          if (state.currentPlayer && state.currentPlayer.playerName) {
            const now = new Date();
            const lastSave = state.lastSaveTime;
            if (!lastSave || now - new Date(lastSave) >= 5 * 60 * 1000) {
              state.saveGame();
              set({ lastSaveTime: now.toISOString() });
            }
          }
        }, 60 * 1000);
      },

      generatePotential: () => {
        const rand = Math.random();
        let potential, rank;
        if (rand < 0.4) {
          potential = Math.floor(Math.random() * 11) + 60;
          rank = 'common';
        } else if (rand < 0.75) {
          potential = Math.floor(Math.random() * 10) + 71;
          rank = 'good';
        } else if (rand < 0.95) {
          potential = Math.floor(Math.random() * 10) + 81;
          rank = 'elite';
        } else {
          potential = Math.floor(Math.random() * 10) + 91;
          rank = 'legendary';
        }
        return { potential, rank };
      },

      createPlayer: (playerName, positionIndex, height, weight, potential, potentialRank) => {
        const positionData = POSITIONS[positionIndex];
        
        // 根据潜力值生成隐藏属性的基准范围
        const hiddenBaseValue = Math.floor(potential / 2); // 潜力越高，隐藏属性起点越高
        
        const newPlayer = {
          ...initialPlayer,
          playerName,
          position: positionIndex,
          positionAbbr: positionData.abbr,
          height,
          weight,
          potential,
          potentialRank,
          hiddenAttributes: {
            clutch: hiddenBaseValue + Math.floor(Math.random() * 20) - 10,
            consistency: hiddenBaseValue + Math.floor(Math.random() * 20) - 10,
            basketballIQ: hiddenBaseValue + Math.floor(Math.random() * 20) - 10,
            workEthic: hiddenBaseValue + Math.floor(Math.random() * 20) - 10,
            leadership: hiddenBaseValue + Math.floor(Math.random() * 20) - 10,
            adaptability: hiddenBaseValue + Math.floor(Math.random() * 20) - 10,
            injuryResistance: hiddenBaseValue + Math.floor(Math.random() * 20) - 10,
            mentalToughness: hiddenBaseValue + Math.floor(Math.random() * 20) - 10,
          },
        };

        const weightBonus = Math.floor((weight - positionData.weightMin) / 5);
        newPlayer.attributes.strength += weightBonus;
        newPlayer.attributes.jump += Math.floor(weightBonus / 2);
        newPlayer.attributes.speed -= Math.floor(weightBonus / 3);

        if (height > positionData.heightMin + 5) {
          newPlayer.attributes.inside += 2;
          newPlayer.attributes.rebound = (newPlayer.attributes.rebound || 10) + 2;
        }

        newPlayer.overall = calculateOverall(newPlayer.attributes);

        set({ currentPlayer: newPlayer, currentScreen: 'Main', lastSaveTime: new Date().toISOString() });
        
        const state = get();
        state.saveGame();

        return { potential, rank: potentialRank };
      },

      calculateOverall: () => {
        const { currentPlayer } = get();
        if (!currentPlayer) return 0;
        const coreAttributes = ['speed', 'jump', 'strength', 'threePoint', 'inside', 'defense', 'dribble', 'pass', 'stamina'];
        const total = coreAttributes.reduce((sum, attr) => sum + (currentPlayer.attributes[attr] || 0), 0);
        const newOverall = Math.max(0, Math.round(total / 9));
        set(state => ({
          currentPlayer: { ...state.currentPlayer, overall: newOverall }
        }));
        return newOverall;
      },

      train: (type) => {
        const { currentPlayer } = get();
        if (!currentPlayer) return { success: false, message: '请先创建球员' };

        const staminaCost = 20;
        const expGain = 5;

        if (currentPlayer.status.currentStamina < staminaCost) {
          return { success: false, message: '体力不足！' };
        }

        const attrNames = {
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

        const trainingEffects = {
          Offense: ['threePoint', 'inside', 'dribble'],
          Defense: ['defense', 'jump', 'strength'],
          Physical: ['speed', 'strength', 'stamina'],
          Mental: ['pass', 'dribble', 'defense'],
        };

        const attrs = trainingEffects[type];
        const randomAttr = attrs[Math.floor(Math.random() * attrs.length)];
        
        const potentialBonus = Math.floor((currentPlayer.potential || 0) / 50);
        // workEthic影响训练效果
        const workEthicBonus = Math.floor((currentPlayer.hiddenAttributes?.workEthic || 50) / 25);
        const increase = Math.floor(Math.random() * 2) + 1 + potentialBonus + workEthicBonus;

        set(state => {
          const updatedPlayer = { 
            ...state.currentPlayer,
            attributes: { ...state.currentPlayer.attributes },
            status: { ...state.currentPlayer.status }
          };
          updatedPlayer.status.currentStamina -= staminaCost;
          updatedPlayer.exp += expGain;
          
          const maxValue = Math.max(10, Math.floor((currentPlayer.potential || 0) / 5));
          const currentValue = updatedPlayer.attributes[randomAttr] || 10;
          updatedPlayer.attributes[randomAttr] = Math.min(
            currentValue + increase,
            maxValue
          );
          
          updatedPlayer.overall = calculateOverall(updatedPlayer.attributes);

          checkLevelUp(updatedPlayer);

          return { currentPlayer: updatedPlayer };
        });

        return { success: true, message: `训练完成！\n${attrNames[randomAttr]} +${increase}\n获得 ${expGain} 经验` };
      },

      rest: () => {
        set(state => ({
          currentPlayer: {
            ...state.currentPlayer,
            status: { ...state.currentPlayer.status, currentStamina: state.currentPlayer.status.maxStamina }
          }
        }));
        return { success: true, message: '体力已恢复满！' };
      },

      selectTalent: (talentId) => {
        const { currentPlayer } = get();
        if (!currentPlayer) return { success: false, message: '请先创建球员' };

        if (currentPlayer.talents.includes(talentId)) {
          return { success: false, message: '已选择该天赋！' };
        }

        set(state => ({
          currentPlayer: {
            ...state.currentPlayer,
            talents: [...state.currentPlayer.talents, talentId]
          }
        }));

        return { success: true, message: '天赋选择成功！' };
      },

      equipAppearance: (type, itemId) => {
        const { currentPlayer } = get();
        if (!currentPlayer) return { success: false, message: '请先创建球员' };

        set(state => ({
          currentPlayer: {
            ...state.currentPlayer,
            appearance: {
              ...state.currentPlayer.appearance,
              [type]: itemId
            }
          }
        }));

        return { success: true, message: '外观更换成功！' };
      },

      generateAITeams: () => {
        const { aiTeams } = get();
        const remainingTeams = aiTeams.filter(t => !t.defeated);

        while (remainingTeams.length < 8) {
          const newTeam = generateAITeam();
          remainingTeams.push(newTeam);
        }

        set({ aiTeams: remainingTeams });
      },

      challengeAITeam: (teamId) => {
        const { currentPlayer, aiTeams } = get();
        if (!currentPlayer) return { success: false, message: '请先创建球员' };

        const maxGames = 10;
        const staminaCost = 15;

        if (currentPlayer.status.streetGamesToday >= maxGames) {
          return { success: false, message: '今日场次用尽！' };
        }

        if (currentPlayer.status.currentStamina < staminaCost) {
          return { success: false, message: '体力不足！' };
        }

        const team = aiTeams.find(t => t.id === teamId);
        if (!team || team.defeated) {
          return { success: false, message: '球队不存在或已被击败！' };
        }

        // 隐藏属性影响比赛
        const hiddenAttrs = currentPlayer.hiddenAttributes || {};
        const clutchBonus = (hiddenAttrs.clutch || 50) / 100; // 关键球能力
        const consistencyFactor = (hiddenAttrs.consistency || 50) / 100; // 稳定性
        const basketballIQBonus = (hiddenAttrs.basketballIQ || 50) / 200; // 篮球智商
        const adaptabilityBonus = (hiddenAttrs.adaptability || 50) / 200; // 适应能力
        const mentalToughnessBonus = (hiddenAttrs.mentalToughness || 50) / 200; // 心理素质

        // 计算综合评分，考虑隐藏属性
        const playerScore = Math.random() * currentPlayer.overall * (1 + basketballIQBonus + adaptabilityBonus);
        const teamScore = Math.random() * team.overall * 0.9;
        const win = playerScore > teamScore;

        // 基础数据计算
        let points = Math.floor(currentPlayer.attributes.threePoint * 0.2 + currentPlayer.attributes.inside * 0.15 + Math.random() * 15);
        let rebounds = Math.floor(currentPlayer.attributes.strength * 0.1 + (currentPlayer.attributes.jump || 10) * 0.15 + Math.random() * 8);
        let assists = Math.floor(currentPlayer.attributes.pass * 0.15 + Math.random() * 6);
        let steals = Math.floor(currentPlayer.attributes.defense * 0.1 + Math.random() * 4);
        let blocks = Math.floor(currentPlayer.attributes.jump * 0.1 + Math.random() * 3);

        // 应用隐藏属性加成
        points = Math.floor(points * (1 + clutchBonus * 0.1)); // 关键球能力提升得分
        assists = Math.floor(assists * (1 + basketballIQBonus * 0.15)); // 篮球智商提升助攻
        steals = Math.floor(steals * (1 + mentalToughnessBonus * 0.1)); // 心理素质提升抢断

        // 稳定性影响表现波动（高稳定性减少波动）
        const variance = 1 - consistencyFactor * 0.3;
        points = Math.max(0, Math.floor(points * (variance + Math.random() * 0.6 * consistencyFactor)));

        const mvpScore = points * 2 + rebounds + assists * 1.5 + steals * 2 + blocks * 2;
        const isMVP = win && mvpScore > 20;

        let goldGain = win ? Math.floor(Math.random() * 30) + 40 : Math.floor(Math.random() * 15) + 10;
        let expGain = win ? 12 : 6;
        let fameGain = win ? 3 : 1;

        if (isMVP) {
          goldGain += 30;
          expGain += 5;
        }

        let dropEquipment = null;
        if (win && Math.random() < 0.3) {
          const categories = Object.keys(EQUIPMENT);
          const category = categories[Math.floor(Math.random() * categories.length)];
          const items = EQUIPMENT[category].filter(item => item.rarity === 'common' || item.rarity === 'rare');
          if (items.length > 0) {
            dropEquipment = items[Math.floor(Math.random() * items.length)];
          }
        }

        set(state => {
          const updatedPlayer = { 
            ...state.currentPlayer,
            equipment: { ...state.currentPlayer.equipment, worn: { ...state.currentPlayer.equipment.worn } },
            backpack: [...state.currentPlayer.backpack]
          };
          updatedPlayer.status.currentStamina -= staminaCost;
          updatedPlayer.status.streetGamesToday++;
          updatedPlayer.economy.gold += goldGain;
          updatedPlayer.exp += expGain;
          updatedPlayer.statistics.fame += fameGain;
          updatedPlayer.statistics.gamesPlayed++;
          updatedPlayer.statistics.totalPoints += points;
          updatedPlayer.statistics.totalRebounds += rebounds;
          updatedPlayer.statistics.totalAssists += assists;
          updatedPlayer.statistics.totalSteals += steals;
          updatedPlayer.statistics.totalBlocks += blocks;

          if (win) {
            updatedPlayer.statistics.streetWins++;
            if (isMVP) updatedPlayer.statistics.streetMVP++;
          }

          if (dropEquipment) {
            updatedPlayer.equipment.worn[dropEquipment.id] = dropEquipment;
          }

          checkLevelUp(updatedPlayer);

          const updatedTeams = state.aiTeams.map(t =>
            t.id === teamId ? { ...t, defeated: win } : t
          );

          const record = {
            id: Date.now().toString(),
            type: 'street_ai',
            date: new Date().toLocaleDateString(),
            opponent: team.name,
            opponentOverall: team.overall,
            result: win ? '胜利' : '失败',
            points,
            rebounds,
            assists,
            steals,
            blocks,
            isMVP,
            goldGain,
            expGain,
            fameGain,
            equipmentDrop: dropEquipment ? dropEquipment.id : null,
          };

          const updatedHistory = [record, ...state.matchHistory].slice(0, 50);

          return { currentPlayer: updatedPlayer, aiTeams: updatedTeams, matchHistory: updatedHistory };
        });

        let message = win
          ? `🎉 挑战成功！击败了 ${team.name}！\n\n获得: ${goldGain}金币 + ${expGain}经验 + ${fameGain}名气${isMVP ? '\n\n🏆 本场MVP！' : ''}`
          : `😢 挑战失败，${team.name} 仍然存在。\n\n获得: ${goldGain}金币 + ${expGain}经验 + ${fameGain}名气\n\n可以邀请好友一起挑战！`;

        if (dropEquipment) {
          message += `\n\n🎁 获得装备: ${dropEquipment.name}`;
        }

        return { success: true, win, message, points, rebounds, assists, steals, blocks, isMVP, goldGain, expGain, fameGain };
      },

      inviteFriendToChallenge: (teamId, friendId) => {
        const { currentPlayer, aiTeams, friends } = get();
        if (!currentPlayer) return { success: false, message: '请先创建球员' };

        const team = aiTeams.find(t => t.id === teamId);
        const friend = friends.find(f => f.id === friendId);

        if (!team || team.defeated) return { success: false, message: '球队不存在！' };
        if (!friend || !friend.online) return { success: false, message: '好友不在线！' };

        const staminaCost = 15;
        if (currentPlayer.status.currentStamina < staminaCost) return { success: false, message: '体力不足！' };

        // 隐藏属性影响组队挑战
        const hiddenAttrs = currentPlayer.hiddenAttributes || {};
        const leadershipBonus = (hiddenAttrs.leadership || 50) / 200; // 领导力提升团队配合
        const basketballIQBonus = (hiddenAttrs.basketballIQ || 50) / 200;

        const playerScore = Math.random() * (currentPlayer.overall + friend.overall) / 2 * (1 + leadershipBonus + basketballIQBonus);
        const teamScore = Math.random() * team.overall * 0.85;
        const win = playerScore > teamScore;

        let points = Math.floor(currentPlayer.attributes.threePoint * 0.2 + currentPlayer.attributes.inside * 0.15 + Math.random() * 15);
        let rebounds = Math.floor(currentPlayer.attributes.strength * 0.1 + (currentPlayer.attributes.jump || 10) * 0.15 + Math.random() * 8);
        let assists = Math.floor(currentPlayer.attributes.pass * 0.15 + Math.random() * 6);

        // 应用隐藏属性加成
        assists = Math.floor(assists * (1 + leadershipBonus * 0.2));

        let goldGain = win ? Math.floor(Math.random() * 30) + 40 : Math.floor(Math.random() * 15) + 10;
        let expGain = win ? 12 : 6;

        set(state => {
          const updatedPlayer = { ...state.currentPlayer };
          updatedPlayer.status.currentStamina -= staminaCost;
          updatedPlayer.status.streetGamesToday++;
          updatedPlayer.economy.gold += goldGain;
          updatedPlayer.exp += expGain;
          updatedPlayer.statistics.gamesPlayed++;
          if (win) updatedPlayer.statistics.streetWins++;

          checkLevelUp(updatedPlayer);

          const updatedTeams = state.aiTeams.map(t =>
            t.id === teamId ? { ...t, defeated: win } : t
          );

          const record = {
            id: Date.now().toString(),
            type: 'street_friend',
            date: new Date().toLocaleDateString(),
            opponent: team.name,
            opponentOverall: team.overall,
            result: win ? '胜利' : '失败',
            points,
            rebounds,
            assists,
            steals: 0,
            blocks: 0,
            isMVP: false,
            goldGain,
            expGain,
            fameGain: win ? 3 : 1,
          };

          const updatedHistory = [record, ...state.matchHistory].slice(0, 50);

          return { currentPlayer: updatedPlayer, aiTeams: updatedTeams, matchHistory: updatedHistory };
        });

        const message = win ? `🎉 组队挑战成功！击败了 ${team.name}！` : `😢 组队挑战失败`;
        return { success: true, win, message };
      },

      addFriend: (friendId, friendName) => {
        set(state => {
          if (state.friends.find(f => f.id === friendId)) {
            return {};
          }
          return {
            friends: [...state.friends, { id: friendId, name: friendName, online: Math.random() > 0.3, overall: Math.floor(Math.random() * 60) + 30 }]
          };
        });
      },

      removeFriend: (friendId) => {
        set(state => ({
          friends: state.friends.filter(f => f.id !== friendId)
        }));
      },

      generateLeaderboard: () => {
        const { currentPlayer } = get();
        const newLeaderboard = generateMockLeaderboard();
        
        if (currentPlayer) {
          newLeaderboard.push({
            id: 'current_player',
            name: currentPlayer.playerName,
            overall: currentPlayer.overall,
            mvpCount: currentPlayer.statistics.mvpCount,
            streetWins: currentPlayer.statistics.streetWins,
            streetMVP: currentPlayer.statistics.streetMVP,
            title: currentPlayer.title,
            online: true,
          });
        }

        newLeaderboard.sort((a, b) => b.overall - a.overall);
        set({ leaderboard: newLeaderboard });
      },

      setCurrentScreen: (screen) => set({ currentScreen: screen }),

      showMessagePopup: (message) => set({ message, showMessage: true }),

      hideMessagePopup: () => set({ showMessage: false }),

      saveGame: () => {
        const state = get();
        localStorage.setItem('basketballGameState', JSON.stringify(state));
      },

      loadGame: () => {
        const saved = localStorage.getItem('basketballGameState');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.currentPlayer) {
            parsed.currentPlayer.attributes = {
              ...initialAttributes,
              ...parsed.currentPlayer.attributes
            };
            // 兼容旧存档，添加默认隐藏属性
            parsed.currentPlayer.hiddenAttributes = {
              ...initialHiddenAttributes,
              ...(parsed.currentPlayer.hiddenAttributes || {})
            };
            parsed.currentPlayer.talents = parsed.currentPlayer.talents || [];
            parsed.currentPlayer.equipment = parsed.currentPlayer.equipment || { worn: {} };
            parsed.currentPlayer.backpack = parsed.currentPlayer.backpack || [];
            parsed.currentPlayer.staff = parsed.currentPlayer.staff || [];
            // 兼容旧存档，添加选秀数据
            parsed.currentPlayer.draft = parsed.currentPlayer.draft || {
              remainingDailyDrafts: DRAFT_CONFIG.dailyFreeDrafts,
              lastDraftReset: new Date().toDateString(),
              appliedToday: 0,
              consecutiveFailures: 0,
              badge: null,
              scoutedAttributes: {},
            };
            parsed.currentPlayer.draft.scoutedAttributes = parsed.currentPlayer.draft.scoutedAttributes || {};
            // 兼容旧存档，添加选秀池和历史
            parsed.draftPool = parsed.draftPool || [];
            parsed.draftHistory = parsed.draftHistory || [];
            // 兼容新选秀系统字段
            parsed.draftPhase = parsed.draftPhase || 'idle';
            parsed.draftCountdown = parsed.draftCountdown || 0;
            parsed.draftTargetOverall = parsed.draftTargetOverall || null;
          }
          set(parsed);
        }
      },

      // 职员相关函数
      hireStaff: (staffType) => {
        const { currentPlayer } = get();
        if (!currentPlayer) return { success: false, message: '请先创建球员' };

        const staffConfig = STAFF_TYPES[staffType];
        if (!staffConfig) return { success: false, message: '无效的职员类型' };

        // 检查是否已有同类型职员
        if (currentPlayer.staff.some(s => s.type === staffType)) {
          return { success: false, message: `已拥有${staffConfig.name}！` };
        }

        // 检查金币是否足够
        const cost = staffConfig.hireCost;
        if (currentPlayer.economy.gold < cost) {
          return { success: false, message: `金币不足！需要 ${cost} 金币` };
        }

        // 生成随机职员名字
        const nameList = staffType === 'agent' ? STAFF_NAMES.agents : STAFF_NAMES.scouts;
        const name = nameList[Math.floor(Math.random() * nameList.length)];

        set(state => ({
          currentPlayer: {
            ...state.currentPlayer,
            economy: {
              ...state.currentPlayer.economy,
              gold: state.currentPlayer.economy.gold - cost
            },
            staff: [
              ...state.currentPlayer.staff,
              {
                id: `${staffType}_${Date.now()}`,
                type: staffType,
                name,
                level: 1,
                exp: 0,
                hiredAt: new Date().toLocaleDateString(),
              }
            ]
          }
        }));

        return { success: true, message: `成功雇佣 ${name} 作为${staffConfig.name}！（花费 ${cost} 金币）` };
      },

      upgradeStaff: (staffId) => {
        const { currentPlayer } = get();
        if (!currentPlayer) return { success: false, message: '请先创建球员' };

        const staff = currentPlayer.staff.find(s => s.id === staffId);
        if (!staff) return { success: false, message: '职员不存在' };

        if (staff.level >= STAFF_LEVELS.length) {
          return { success: false, message: '已达到最高等级' };
        }

        const nextLevel = STAFF_LEVELS[staff.level];
        const cost = nextLevel.upgradeCost;

        if (currentPlayer.economy.gold < cost) {
          return { success: false, message: `金币不足！需要 ${cost} 金币` };
        }

        set(state => ({
          currentPlayer: {
            ...state.currentPlayer,
            economy: {
              ...state.currentPlayer.economy,
              gold: state.currentPlayer.economy.gold - cost
            },
            staff: state.currentPlayer.staff.map(s =>
              s.id === staffId ? { ...s, level: s.level + 1 } : s
            )
          }
        }));

        return { success: true, message: `升级成功！${staff.name} 现在是 ${STAFF_LEVELS[staff.level].name}` };
      },

      // 球探探测单个隐藏属性
      scoutSingleAttribute: (attributeKey) => {
        const { currentPlayer } = get();
        if (!currentPlayer) return { success: false, message: '请先创建球员' };

        const scout = currentPlayer.staff.find(s => s.type === 'scout');
        if (!scout) return { success: false, message: '需要先雇佣球探！' };

        const scoutConfig = STAFF_TYPES.scout;
        const detectCost = scoutConfig.detectCost;

        // 检查金币是否足够
        if (currentPlayer.economy.gold < detectCost) {
          return { success: false, message: `金币不足！探测需要 ${detectCost} 金币` };
        }

        // 验证属性key是否有效
        if (!HIDDEN_ATTRIBUTES[attributeKey]) {
          return { success: false, message: '无效的属性类型' };
        }

        // 根据球探等级决定成功率
        const levelData = STAFF_LEVELS[scout.level - 1] || STAFF_LEVELS[0];
        const successRate = levelData.successRate;
        const success = Math.random() < successRate;

        // 扣除金币
        set(state => ({
          currentPlayer: {
            ...state.currentPlayer,
            economy: {
              ...state.currentPlayer.economy,
              gold: state.currentPlayer.economy.gold - detectCost
            }
          }
        }));

        if (!success) {
          return { 
            success: false, 
            message: `探测失败！球探未能获取${HIDDEN_ATTRIBUTES[attributeKey].name}的信息（花费 ${detectCost} 金币）`, 
            attribute: attributeKey,
            revealed: null 
          };
        }

        // 探测成功，返回该属性的值并保存到scoutedAttributes
        const value = currentPlayer.hiddenAttributes[attributeKey] || 50;
        
        set(state => ({
          currentPlayer: {
            ...state.currentPlayer,
            draft: {
              ...state.currentPlayer.draft,
              scoutedAttributes: {
                ...state.currentPlayer.draft.scoutedAttributes,
                [attributeKey]: value
              }
            }
          }
        }));
        
        return { 
          success: true, 
          message: `探测成功！${HIDDEN_ATTRIBUTES[attributeKey].name}: ${value}（花费 ${detectCost} 金币）`, 
          attribute: attributeKey,
          revealed: { key: attributeKey, value, config: HIDDEN_ATTRIBUTES[attributeKey] }
        };
      },

      // 球探探测属性趋势
      scoutAttributeTrend: (attributeKey) => {
        const { currentPlayer } = get();
        if (!currentPlayer) return { success: false, message: '请先创建球员' };

        const scout = currentPlayer.staff.find(s => s.type === 'scout');
        if (!scout) return { success: false, message: '需要先雇佣球探！' };

        const scoutConfig = STAFF_TYPES.scout;
        const detectCost = scoutConfig.detectCost;

        // 检查金币是否足够
        if (currentPlayer.economy.gold < detectCost) {
          return { success: false, message: `金币不足！探测需要 ${detectCost} 金币` };
        }

        // 验证属性key是否有效
        if (!HIDDEN_ATTRIBUTES[attributeKey]) {
          return { success: false, message: '无效的属性类型' };
        }

        // 根据球探等级决定成功率
        const levelData = STAFF_LEVELS[scout.level - 1] || STAFF_LEVELS[0];
        const successRate = levelData.successRate;
        const success = Math.random() < successRate;

        // 扣除金币
        set(state => ({
          currentPlayer: {
            ...state.currentPlayer,
            economy: {
              ...state.currentPlayer.economy,
              gold: state.currentPlayer.economy.gold - detectCost
            }
          }
        }));

        if (!success) {
          return { 
            success: false, 
            message: `趋势分析失败！球探未能获取${HIDDEN_ATTRIBUTES[attributeKey].name}的趋势信息（花费 ${detectCost} 金币）`, 
            attribute: attributeKey,
            revealed: null 
          };
        }

        // 探测成功，返回该属性的趋势并保存到scoutedAttributes
        const currentValue = currentPlayer.hiddenAttributes[attributeKey] || 50;
        const trends = ['上升', '下降', '稳定'];
        const trend = trends[Math.floor(Math.random() * trends.length)];
        const changeAmount = trend === '上升' ? Math.floor(Math.random() * 5) + 1 : 
                            trend === '下降' ? -(Math.floor(Math.random() * 3) + 1) : 0;

        set(state => ({
          currentPlayer: {
            ...state.currentPlayer,
            draft: {
              ...state.currentPlayer.draft,
              scoutedAttributes: {
                ...state.currentPlayer.draft.scoutedAttributes,
                [attributeKey]: {
                  value: currentValue,
                  trend,
                  changeAmount
                }
              }
            }
          }
        }));

        return { 
          success: true, 
          message: `趋势分析成功！${HIDDEN_ATTRIBUTES[attributeKey].name} 趋势: ${trend}（花费 ${detectCost} 金币）`, 
          attribute: attributeKey,
          revealed: { 
            key: attributeKey, 
            value: currentValue, 
            trend, 
            changeAmount,
            config: HIDDEN_ATTRIBUTES[attributeKey] 
          }
        };
      },

      // 经纪人帮助选秀（提高选秀顺位）
      agentDraftHelp: () => {
        const { currentPlayer } = get();
        if (!currentPlayer) return { success: false, message: '请先创建球员' };

        const agent = currentPlayer.staff.find(s => s.type === 'agent');
        if (!agent) return { success: false, message: '需要先雇佣经纪人！' };

        const levelData = STAFF_LEVELS[agent.level - 1] || STAFF_LEVELS[0];
        const successRate = levelData.successRate;
        const success = Math.random() < successRate;

        if (!success) {
          return { success: false, message: '经纪人谈判失败，未能获得额外优势' };
        }

        // 成功时给予一些奖励
        const bonusExp = 20 + agent.level * 10;
        const bonusGold = 50 + agent.level * 25;

        set(state => ({
          currentPlayer: {
            ...state.currentPlayer,
            exp: state.currentPlayer.exp + bonusExp,
            economy: {
              ...state.currentPlayer.economy,
              gold: state.currentPlayer.economy.gold + bonusGold
            }
          }
        }));

        checkLevelUp(get().currentPlayer);

        return { success: true, message: `经纪人谈判成功！获得 ${bonusExp} 经验和 ${bonusGold} 金币` };
      },

      // 经纪人帮助签约球队（提高签约成功率）
      agentContractHelp: () => {
        const { currentPlayer } = get();
        if (!currentPlayer) return { success: false, message: '请先创建球员' };

        const agent = currentPlayer.staff.find(s => s.type === 'agent');
        if (!agent) return { success: false, message: '需要先雇佣经纪人！' };

        const levelData = STAFF_LEVELS[agent.level - 1] || STAFF_LEVELS[0];
        const successRate = levelData.successRate;
        const success = Math.random() < successRate;

        if (!success) {
          return { success: false, message: '经纪人未能促成签约' };
        }

        // 成功时提供签约加成（这里简化处理，实际应该与联赛系统联动）
        const fameBonus = 10 + agent.level * 5;

        set(state => ({
          currentPlayer: {
            ...state.currentPlayer,
            statistics: {
              ...state.currentPlayer.statistics,
              fame: state.currentPlayer.statistics.fame + fameBonus
            }
          }
        }));

        return { success: true, message: `经纪人成功促成签约！名气 +${fameBonus}` };
      },

      // 重置每日选秀机会
      resetDailyDrafts: () => {
        const today = new Date().toDateString();
        set(state => {
          if (!state.currentPlayer) return {};
          
          const lastReset = state.currentPlayer.draft?.lastDraftReset;
          if (lastReset !== today) {
            return {
              currentPlayer: {
                ...state.currentPlayer,
                draft: {
                  ...state.currentPlayer.draft,
                  remainingDailyDrafts: DRAFT_CONFIG.dailyFreeDrafts,
                  appliedToday: 0,
                  lastDraftReset: today,
                }
              }
            };
          }
          return {};
        });
      },

      // 申请参与选秀
      // ========== 新选秀系统核心逻辑（盲盒机制）==========
      
      /**
       * 报名参与选秀
       */
      applyForDraft: () => {
        const { currentPlayer, draftPool } = get();
        if (!currentPlayer) return { success: false, message: '请先创建球员' };

        // 重置每日选秀机会
        get().resetDailyDrafts();

        // 检查是否有剩余选秀机会
        if (currentPlayer.draft.remainingDailyDrafts <= 0) {
          return { success: false, message: '该球员今日参与次数已用完（每日最多2次）' };
        }

        // 检查选秀池是否已满
        if (draftPool.length >= DRAFT_CONFIG.poolCapacity) {
          return { success: false, message: '本期选秀池已满（30人），请等待下一轮' };
        }

        // 添加到选秀池（目标总评在endRegistration时统一生成）
        const draftEntry = {
          playerId: currentPlayer.id || `player_${Date.now()}`,
          playerName: currentPlayer.playerName,
          overall: currentPlayer.overall,
          position: currentPlayer.positionAbbr,
          isAI: false,
          appliedAt: new Date().toISOString(),
          consecutiveFailures: currentPlayer.draft.consecutiveFailures,
        };

        set(state => ({
          currentPlayer: {
            ...state.currentPlayer,
            draft: {
              ...state.currentPlayer.draft,
              remainingDailyDrafts: state.currentPlayer.draft.remainingDailyDrafts - 1,
              appliedToday: state.currentPlayer.draft.appliedToday + 1,
            }
          },
          draftPool: [...state.draftPool, draftEntry],
        }));

        // 如果是第一个报名的玩家，启动报名倒计时
        if (draftPool.length === 0) {
          get().startRegistration();
        }

        return { 
          success: true, 
          message: `报名成功！本次选秀为盲盒机制，无需消耗选秀券，报名5分钟截止、选秀5分钟完成`,
        };
      },

      /**
       * 开始报名阶段（5分钟倒计时）
       */
      startRegistration: () => {
        set({
          draftPhase: 'registration',
          draftCountdown: DRAFT_CONFIG.registrationDuration / 1000, // 转为秒
        });

        // 启动倒计时
        const intervalId = setInterval(() => {
          const { draftCountdown, draftPhase } = get();
          
          if (draftPhase !== 'registration') {
            clearInterval(intervalId);
            return;
          }

          if (draftCountdown <= 1) {
            clearInterval(intervalId);
            // 报名结束，开始选秀
            get().endRegistration();
          } else {
            set({ draftCountdown: draftCountdown - 1 });
          }
        }, 1000);

        set({ draftIntervalId: intervalId });
      },

      /**
       * 结束报名，开始选秀
       */
      endRegistration: () => {
        const { draftPool } = get();
        
        // AI填充至30人
        const filledPool = get().fillAIPlayers(draftPool);
        
        // 生成盲盒目标总评（50-80随机）
        const targetOverall = generateTargetOverall();
        
        set({
          draftPool: filledPool,
          draftPhase: 'drafting',
          draftCountdown: DRAFT_CONFIG.draftDuration / 1000, // 5分钟选秀
          draftTargetOverall: targetOverall, // 设置盲盒目标总评
        });

        // 启动选秀倒计时
        const intervalId = setInterval(() => {
          const { draftCountdown, draftPhase } = get();
          
          if (draftPhase !== 'drafting') {
            clearInterval(intervalId);
            return;
          }

          if (draftCountdown <= 1) {
            clearInterval(intervalId);
            // 选秀结束
            get().executeNewDraft();
          } else {
            set({ draftCountdown: draftCountdown - 1 });
          }
        }, 1000);

        set({ draftIntervalId: intervalId });
      },

      /**
       * 恢复选秀倒计时（页面刷新后调用）
       */
      resumeDraftTimer: () => {
        const { draftPhase, draftCountdown } = get();
        
        // 清除旧的定时器
        const oldIntervalId = get().draftIntervalId;
        if (oldIntervalId) {
          clearInterval(oldIntervalId);
        }
        
        // 如果不在倒计时阶段，直接返回
        if (draftPhase !== 'registration' && draftPhase !== 'drafting') {
          return;
        }
        
        // 如果倒计时已经结束，执行相应逻辑
        if (draftCountdown <= 0) {
          if (draftPhase === 'registration') {
            get().endRegistration();
          } else if (draftPhase === 'drafting') {
            get().executeNewDraft();
          }
          return;
        }
        
        // 启动新的倒计时
        const intervalId = setInterval(() => {
          const { draftCountdown: currentCountdown, draftPhase: currentPhase } = get();
          
          if (currentPhase !== 'registration' && currentPhase !== 'drafting') {
            clearInterval(intervalId);
            return;
          }
          
          if (currentCountdown <= 1) {
            clearInterval(intervalId);
            if (currentPhase === 'registration') {
              get().endRegistration();
            } else if (currentPhase === 'drafting') {
              get().executeNewDraft();
            }
          } else {
            set({ draftCountdown: currentCountdown - 1 });
          }
        }, 1000);
        
        set({ draftIntervalId: intervalId });
      },

      /**
       * AI球员填充
       */
      fillAIPlayers: (currentPool) => {
        const pool = [...currentPool];
        const aiCount = DRAFT_CONFIG.poolCapacity - pool.length;
        
        for (let i = 1; i <= aiCount; i++) {
          pool.push(generateAIPlayer(i));
        }
        
        return pool;
      },

      /**
       * 执行新选秀（盲盒机制）
       */
      executeNewDraft: () => {
        const { draftPool, draftTargetOverall } = get();
        if (!draftPool || draftPool.length === 0) return { results: [] };

        // 获取当前轮次的盲盒目标总评
        const targetOverall = draftTargetOverall || generateTargetOverall();
        
        // 分离玩家和AI
        const playerEntries = draftPool.filter(e => !e.isAI);

        // 为每个玩家计算各顺位的概率并抽取
        const results = [];
        const assignedPicks = new Set(); // 已分配的顺位

        // 按概率从高到低排序玩家
        const sortedPlayers = playerEntries.map(entry => {
          const diff = Math.abs(entry.overall - targetOverall);
          // 计算平均概率（1-10顺位的平均）
          let avgProb = 0;
          for (let pick = 1; pick <= 10; pick++) {
            avgProb += calculateDraftProbability(
              entry.overall,
              targetOverall,
              pick,
              entry.consecutiveFailures || 0,
              {}
            );
          }
          avgProb /= 10;
          return { ...entry, avgProb, diff };
        }).sort((a, b) => b.avgProb - a.avgProb);

        // 为每个玩家抽取顺位
        for (const entry of sortedPlayers) {
          let selectedPick = null;
          
          // 从第10顺位到第1顺位依次尝试（高概率顺位先抽）
          for (let pick = 10; pick >= 1; pick--) {
            if (assignedPicks.has(pick)) continue; // 该顺位已被占用
            
            const probability = calculateDraftProbability(
              entry.overall,
              targetOverall,
              pick,
              entry.consecutiveFailures || 0,
              {}
            );
            
            const roll = Math.random() * 100;
            if (roll < probability) {
              selectedPick = pick;
              assignedPicks.add(pick);
              break;
            }
          }

          if (selectedPick) {
            // 选中，获得对应顺位
            const pickConfig = DRAFT_CONFIG.draftPicks[selectedPick - 1];
            results.push({
              ...entry,
              result: 'selected',
              draftPick: selectedPick,
              pickName: pickConfig.name,
              targetOverall,
              timestamp: new Date().toISOString(),
            });
          } else {
            // 落选
            results.push({
              ...entry,
              result: 'rejected',
              targetOverall,
              timestamp: new Date().toISOString(),
            });
          }
        }

        // 更新选秀历史
        set(state => ({
          draftHistory: [...state.draftHistory, ...results],
          draftPool: [], // 清空选秀池
          draftPhase: 'finished',
          draftCountdown: 0,
          draftTargetOverall: null, // 清除盲盒目标总评
        }));

        // 处理每个玩家的选秀结果
        results.forEach(result => {
          get().processNewDraftResult(result);
        });

        return { results, targetOverall };
      },

      /**
       * 处理新选秀结果
       */
      processNewDraftResult: (result) => {
        const { currentPlayer } = get();
        if (!currentPlayer || !currentPlayer.id) return;

        // 只处理当前玩家的结果
        if (result.playerId !== currentPlayer.id && result.playerName !== currentPlayer.playerName) {
          return;
        }

        if (result.result === 'selected') {
          // 选中：总评+1
          set(state => ({
            currentPlayer: {
              ...state.currentPlayer,
              overall: state.currentPlayer.overall + 1,
              draft: {
                ...state.currentPlayer.draft,
                consecutiveFailures: 0, // 重置连续落选计数
                currentRoundTarget: null, // 清除本轮目标
              }
            }
          }));
        } else {
          // 落选：增加连续落选计数
          const newConsecutiveFailures = (currentPlayer.draft.consecutiveFailures || 0) + 1;
          
          set(state => ({
            currentPlayer: {
              ...state.currentPlayer,
              draft: {
                ...state.currentPlayer.draft,
                consecutiveFailures: newConsecutiveFailures,
                currentRoundTarget: null, // 清除本轮目标
              }
            }
          }));
        }
      },

      // ========== 旧选秀系统逻辑（保留兼容）==========
      
      // 执行选秀判定（由系统在选秀时段触发）
      executeDraft: () => {
        const { draftPool } = get();
        if (draftPool.length === 0) return { results: [] };

        const results = [];
        const remainingPool = [];

        // 按总评从高到低处理
        for (const entry of draftPool) {
          const probability = entry.probability;
          const roll = Math.random() * 100;
          const selected = roll < probability;

          if (selected) {
            // 选中
            let badgeEarned = null;
            if (entry.overall >= 50) {
              badgeEarned = OLD_DRAFT_CONFIG.badges.tier3;
            } else if (entry.overall >= 40) {
              badgeEarned = OLD_DRAFT_CONFIG.badges.tier2;
            } else if (entry.overall >= 30) {
              badgeEarned = OLD_DRAFT_CONFIG.badges.tier1;
            }

            results.push({
              ...entry,
              result: 'selected',
              badge: badgeEarned,
              overallIncrease: 1, // 总评+1
            });
          } else {
            // 落选
            remainingPool.push(entry);
            results.push({
              ...entry,
              result: 'rejected',
            });
          }
        }

        // 更新选秀历史
        set(state => ({
          draftHistory: [...state.draftHistory, ...results.map(r => ({
            ...r,
            timestamp: new Date().toISOString(),
          }))],
          draftPool: [], // 清空选秀池
        }));

        return { results };
      },

      // 处理选秀结果（更新玩家状态）
      processDraftResult: (result) => {
        const { currentPlayer } = get();
        if (!currentPlayer) return;

        if (result.result === 'selected') {
          // 选中：总评+1，获得徽章
          set(state => ({
            currentPlayer: {
              ...state.currentPlayer,
              overall: state.currentPlayer.overall + 1,
              draft: {
                ...state.currentPlayer.draft,
                consecutiveFailures: 0, // 重置连续落选计数
                badge: result.badge || state.currentPlayer.draft.badge,
              }
            }
          }));
        } else {
          // 落选：增加连续落选计数，发放补偿
          const newConsecutiveFailures = currentPlayer.draft.consecutiveFailures + 1;
          let compensation = null;

          if (newConsecutiveFailures >= 3) {
            compensation = { type: 'guaranteed_pick', desc: '必中卡（下次选秀直接选中）' };
          } else if (newConsecutiveFailures >= 2) {
            compensation = { type: 'draft_bonus_card', desc: '选秀加成卡（下次选中概率+10%）' };
          } else {
            compensation = { type: 'training_pack', desc: '球员培养包（总评+1）' };
          }

          set(state => ({
            currentPlayer: {
              ...state.currentPlayer,
              draft: {
                ...state.currentPlayer.draft,
                consecutiveFailures: newConsecutiveFailures,
              }
            }
          }));

          return { compensation };
        }
      },

      // 获取选秀状态信息
      getDraftInfo: () => {
        const { currentPlayer, draftPool, draftPhase, draftCountdown, draftTargetOverall } = get();
        if (!currentPlayer) return null;

        // 重置每日选秀机会
        get().resetDailyDrafts();

        const targetOverall = draftTargetOverall || currentPlayer.draft.currentRoundTarget;
        const probability = targetOverall ? calculateDraftProbability(
          currentPlayer.overall, 
          targetOverall,
          10,
          currentPlayer.draft.consecutiveFailures,
          {}
        ) : 0;

        return {
          phase: draftPhase || 'idle',
          countdown: draftCountdown || 0,
          overall: currentPlayer.overall,
          targetOverall,
          probability,
          remainingDrafts: currentPlayer.draft.remainingDailyDrafts,
          appliedToday: currentPlayer.draft.appliedToday,
          consecutiveFailures: currentPlayer.draft.consecutiveFailures,
          poolSize: draftPool?.length || 0,
          poolCapacity: DRAFT_CONFIG.poolCapacity,
          badge: currentPlayer.draft.badge,
        };
      },
    })
);

function calculateOverall(attributes) {
  const coreAttributes = ['speed', 'jump', 'strength', 'threePoint', 'inside', 'defense', 'dribble', 'pass', 'stamina'];
  const total = coreAttributes.reduce((sum, attr) => sum + (attributes[attr] || 0), 0);
  return Math.max(0, Math.round(total / 9));
}

function checkLevelUp(player) {
  const expNeeded = player.level * 100;
  while (player.exp >= expNeeded) {
    player.exp -= expNeeded;
    player.level++;
    
    const potentialBonus = Math.floor(player.potential / 30);
    const pointsPerLevel = 3 + potentialBonus;
    
    const attrs = ['speed', 'jump', 'strength', 'threePoint', 'inside', 'defense', 'dribble', 'pass', 'stamina'];
    for (let i = 0; i < pointsPerLevel; i++) {
      const randomAttr = attrs[Math.floor(Math.random() * attrs.length)];
      const maxValue = Math.floor(player.potential / 10);
      const currentValue = player.attributes[randomAttr] || 0;
      player.attributes[randomAttr] = Math.min(currentValue + 1, maxValue);
    }
    
    player.overall = calculateOverall(player.attributes);
  }
}

function generateAITeam() {
  const teamNames = ['街头风暴', '城市猎人', '篮球梦想家', '闪电战队', '铁血战士', '飞鹰队', '火焰篮球', '星河战队', '王者归来', '荣耀之路'];
  const teamEmblems = ['⚡', '🏹', '🏀', '🔥', '💪', '🦅', '🌟', '⭐', '👑', '🏆'];
  const namePrefixes = ['阿', '小', '大', '老', '少'];
  const nameSuffixes = ['强', '伟', '勇', '豪', '杰', '鹏', '飞', '翔', '涛', '海'];

  const overall = Math.floor(Math.random() * 40) + 30;
  const positions = ['PG', 'SG', 'SF', 'PF', 'C'];

  return {
    id: `ai_team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: teamNames[Math.floor(Math.random() * teamNames.length)],
    emblem: teamEmblems[Math.floor(Math.random() * teamEmblems.length)],
    overall,
    players: positions.map(pos => ({
      name: namePrefixes[Math.floor(Math.random() * namePrefixes.length)] + nameSuffixes[Math.floor(Math.random() * nameSuffixes.length)],
      position: pos,
      overall: Math.round(overall * (0.9 + Math.random() * 0.2)),
    })),
    defeated: false,
  };
}

function generateMockLeaderboard() {
  const playerNames = ['张三', '李四', '王五', '赵六', '小明', '小华', '小强', '小刚', '鹏飞', '海涛', '建华', '志强', '博文', '浩宇', '子轩'];
  const titles = ['街头王者', 'MVP之王', '超级巨星', '人气偶像', '传奇球员', '冠军教头', '连胜之师', '无敌战队', '联赛霸主', '全明星球员'];

  return playerNames.map((name, index) => ({
    id: `player_${index}`,
    name,
    overall: Math.floor(60 + Math.random() * 40),
    mvpCount: Math.floor(Math.random() * 100),
    streetWins: Math.floor(Math.random() * 500),
    streetMVP: Math.floor(Math.random() * 50),
    title: index < titles.length ? titles[index] : '',
    online: Math.random() > 0.4,
  }));
}
