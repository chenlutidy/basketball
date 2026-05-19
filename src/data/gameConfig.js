export const POSITIONS = [
  { name: '控球后卫', abbr: 'PG', heightMin: 175, heightMax: 185, weightMin: 65, weightMax: 75 },
  { name: '得分后卫', abbr: 'SG', heightMin: 180, heightMax: 190, weightMin: 70, weightMax: 80 },
  { name: '小前锋', abbr: 'SF', heightMin: 190, heightMax: 200, weightMin: 75, weightMax: 85 },
  { name: '大前锋', abbr: 'PF', heightMin: 200, heightMax: 210, weightMin: 85, weightMax: 95 },
  { name: '中锋', abbr: 'C', heightMin: 210, heightMax: 220, weightMin: 90, weightMax: 100 },
];

export const POTENTIAL_RANKS = [
  { id: 'common', name: '普通', min: 60, max: 70, color: '#9ca3af' },
  { id: 'good', name: '优秀', min: 71, max: 80, color: '#22c55e' },
  { id: 'elite', name: '精英', min: 81, max: 90, color: '#3b82f6' },
  { id: 'legendary', name: '传奇', min: 91, max: 100, color: '#f59e0b' },
];

export const TALENTS = {
  PG: [
    { id: 'pg_1', name: '组织大师', desc: '传球成功率提升15%，助攻能力增强', icon: '🎯', unlockLevel: 1 },
    { id: 'pg_2', name: '抢断专家', desc: '抢断成功率提升10%，防守意识增强', icon: '✋', unlockLevel: 5 },
    { id: 'pg_3', name: '快攻核心', desc: '快攻速度提升20%，转换进攻效率提高', icon: '⚡', unlockLevel: 10 },
  ],
  SG: [
    { id: 'sg_1', name: '神射手', desc: '三分命中率提升15%', icon: '🏹', unlockLevel: 1 },
    { id: 'sg_2', name: '突破高手', desc: '突破成功率提升12%，造犯规能力增强', icon: '💨', unlockLevel: 5 },
    { id: 'sg_3', name: '关键时刻', desc: '比赛最后时刻命中率提升20%', icon: '⏰', unlockLevel: 10 },
  ],
  SF: [
    { id: 'sf_1', name: '全能战士', desc: '所有进攻属性提升5%', icon: '⭐', unlockLevel: 1 },
    { id: 'sf_2', name: '防守尖兵', desc: '外线防守能力提升15%', icon: '🛡️', unlockLevel: 5 },
    { id: 'sf_3', name: '绝杀之王', desc: '绝杀球命中率提升30%', icon: '👑', unlockLevel: 10 },
  ],
  PF: [
    { id: 'pf_1', name: '篮板怪兽', desc: '篮板球能力提升15%', icon: '🔔', unlockLevel: 1 },
    { id: 'pf_2', name: '禁区守护神', desc: '盖帽能力提升12%，内线防守增强', icon: '🚧', unlockLevel: 5 },
    { id: 'pf_3', name: '低位杀器', desc: '内线得分能力提升15%', icon: '💪', unlockLevel: 10 },
  ],
  C: [
    { id: 'c_1', name: '篮下霸主', desc: '内线进攻能力提升15%', icon: '🏀', unlockLevel: 1 },
    { id: 'c_2', name: '护筐专家', desc: '盖帽能力提升15%，防守威慑力增强', icon: '🛡️', unlockLevel: 5 },
    { id: 'c_3', name: '篮板机器', desc: '篮板球能力提升20%', icon: '🔔', unlockLevel: 10 },
  ],
};

export const EQUIPMENT = {
  headband: [
    { id: 'headband_1', name: '基础头带', rarity: 'common', icon: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=basketball%20headband%20red%20simple%20icon&image_size=square', bonus: { morale: 2 }, unlocked: true },
    { id: 'headband_2', name: '运动头带', rarity: 'common', icon: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=basketball%20headband%20blue%20athletic&image_size=square', bonus: { morale: 3 }, unlocked: true },
    { id: 'headband_3', name: '能量头带', rarity: 'rare', icon: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=glowing%20futuristic%20basketball%20headband%20purple&image_size=square', bonus: { morale: 5, stamina: 2 }, unlocked: false, requirement: { fame: 300 } },
    { id: 'headband_4', name: '传奇头带', rarity: 'epic', icon: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=golden%20legendary%20basketball%20headband%20with%20wings&image_size=square', bonus: { morale: 8, speed: 3 }, unlocked: false, requirement: { level: 20 } },
  ],
  wristband: [
    { id: 'wristband_1', name: '棉质护腕', rarity: 'common', icon: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=white%20cotton%20wristband%20simple&image_size=square', bonus: { pass: 2 }, unlocked: true },
    { id: 'wristband_2', name: '弹性护腕', rarity: 'common', icon: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=black%20elastic%20wristband%20athletic&image_size=square', bonus: { pass: 3 }, unlocked: true },
    { id: 'wristband_3', name: '能量护腕', rarity: 'rare', icon: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=cyberpunk%20energy%20wristband%20glowing%20blue&image_size=square', bonus: { pass: 5, strength: 2 }, unlocked: false, requirement: { fame: 500 } },
    { id: 'wristband_4', name: '机械护腕', rarity: 'epic', icon: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=mechanical%20robotic%20wristband%20gold%20tech&image_size=square', bonus: { pass: 8, defense: 3 }, unlocked: false, requirement: { level: 25 } },
  ],
  kneepad: [
    { id: 'kneepad_1', name: '基础护膝', rarity: 'common', icon: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=basic%20black%20knee%20pad%20simple&image_size=square', bonus: { defense: 2 }, unlocked: true },
    { id: 'kneepad_2', name: '专业护膝', rarity: 'common', icon: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=professional%20basketball%20knee%20pad%20white&image_size=square', bonus: { defense: 3 }, unlocked: true },
    { id: 'kneepad_3', name: '防护护膝', rarity: 'rare', icon: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=protective%20knee%20pad%20orange%20sporty&image_size=square', bonus: { defense: 5, jump: 2 }, unlocked: false, requirement: { fame: 400 } },
    { id: 'kneepad_4', name: '强化护膝', rarity: 'epic', icon: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=reinforced%20titanium%20knee%20pad%20futuristic&image_size=square', bonus: { defense: 8, jump: 4 }, unlocked: false, requirement: { level: 22 } },
  ],
  jersey: [
    { id: 'jersey_1', name: '训练球衣', rarity: 'common', icon: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=simple%20basketball%20jersey%20white%20number%201&image_size=square', bonus: { stamina: 2 }, unlocked: true },
    { id: 'jersey_2', name: '比赛球衣', rarity: 'common', icon: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=red%20basketball%20jersey%20professional&image_size=square', bonus: { stamina: 3 }, unlocked: true },
    { id: 'jersey_3', name: '星空球衣', rarity: 'rare', icon: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=starry%20night%20basketball%20jersey%20purple&image_size=square', bonus: { stamina: 5, threePoint: 2 }, unlocked: false, requirement: { fame: 600 } },
    { id: 'jersey_4', name: '传奇球衣', rarity: 'epic', icon: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=golden%20legendary%20basketball%20jersey%20with%20crown&image_size=square', bonus: { stamina: 8, threePoint: 4 }, unlocked: false, requirement: { level: 28 } },
  ],
  shoes: [
    { id: 'shoes_1', name: '训练球鞋', rarity: 'common', icon: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=white%20basketball%20shoes%20simple&image_size=square', bonus: { speed: 2 }, unlocked: true },
    { id: 'shoes_2', name: '专业球鞋', rarity: 'common', icon: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=black%20professional%20basketball%20shoes&image_size=square', bonus: { speed: 3 }, unlocked: true },
    { id: 'shoes_3', name: '弹跳球鞋', rarity: 'rare', icon: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=high%20top%20basketball%20shoes%20green%20jump&image_size=square', bonus: { speed: 5, jump: 3 }, unlocked: false, requirement: { fame: 500 } },
    { id: 'shoes_4', name: '脉冲球鞋', rarity: 'epic', icon: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=futuristic%20pulse%20basketball%20shoes%20glowing%20blue&image_size=square', bonus: { speed: 8, jump: 5 }, unlocked: false, requirement: { level: 25 } },
  ],
};

export const RARITY_COLORS = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

export const LEAGUES = [
  { id: 1, name: '草根业余联赛', contractName: '新手合同', weeklySalary: 0, draftRequirement: 45, fameRequired: 0 },
  { id: 2, name: '城市联赛', contractName: '基础合同', weeklySalary: 500, draftRequirement: 55, fameRequired: 100 },
  { id: 3, name: '省级联赛', contractName: '职业合同', weeklySalary: 1500, draftRequirement: 65, fameRequired: 300 },
  { id: 4, name: '国家级联赛', contractName: '明星合同', weeklySalary: 5000, draftRequirement: 75, fameRequired: 600 },
  { id: 5, name: '洲际联赛', contractName: '顶级合同', weeklySalary: 15000, draftRequirement: 85, fameRequired: 1000 },
  { id: 6, name: '全球巨星联赛', contractName: '传奇合同', weeklySalary: 50000, draftRequirement: 95, fameRequired: 2000 },
];

export const ACHIEVEMENTS = [
  { id: 'street_king', name: '街头王者', category: 'personal', icon: '👑', desc: '累计获胜100场街头赛', requirement: { type: 'street_wins', value: 100 }, rewards: { gold: 500, title: '街头王者' } },
  { id: 'mvp_master', name: 'MVP收割机', category: 'personal', icon: '🏆', desc: '累计获得50次MVP', requirement: { type: 'mvp_count', value: 50 }, rewards: { gold: 800, title: 'MVP之王' } },
  { id: 'overall_95', name: '巨星养成', category: 'personal', icon: '⭐', desc: '球员总评达到95分', requirement: { type: 'overall', value: 95 }, rewards: { gold: 1000, title: '超级巨星' } },
  { id: 'fame_1000', name: '声名远扬', category: 'personal', icon: '💫', desc: '名气值达到1000', requirement: { type: 'fame', value: 1000 }, rewards: { gold: 600, title: '人气偶像' } },
  { id: 'level_30', name: '满级大师', category: 'personal', icon: '🎖️', desc: '球员等级达到30级', requirement: { type: 'level', value: 30 }, rewards: { gold: 1200, title: '传奇球员' } },
  { id: 'team_champion', name: '三连冠', category: 'team', icon: '🏅', desc: '自建球队夺冠3次', requirement: { type: 'championships', value: 3 }, rewards: { gold: 2000, title: '冠军教头' } },
  { id: 'team_win_streak', name: '连胜纪录', category: 'team', icon: '🔥', desc: '球队取得10连胜', requirement: { type: 'win_streak', value: 10 }, rewards: { gold: 800, title: '连胜之师' } },
  { id: 'team_undefeated', name: '不败赛季', category: 'team', icon: '🛡️', desc: '赛季保持不败', requirement: { type: 'undefeated_season', value: 1 }, unlocked: true },
  { id: 'league_champion', name: '联赛冠军', category: 'event', icon: '🏆', desc: '获得顶级联赛冠军', requirement: { type: 'top_league_champion', value: 1 }, rewards: { gold: 3000, title: '联赛霸主' } },
  { id: 'all_star', name: '全明星', category: 'event', icon: '⭐', desc: '入选全明星阵容', requirement: { type: 'all_star', value: 1 }, rewards: { gold: 500, title: '全明星球员' } },
  { id: 'playoffs_mvp', name: '总决赛MVP', category: 'event', icon: '👑', desc: '获得总决赛MVP', requirement: { type: 'finals_mvp', value: 1 }, rewards: { gold: 1500, title: '总决赛MVP' } },
  { id: 'record_points', name: '得分纪录', category: 'event', icon: '📊', desc: '单场得分达到50分', requirement: { type: 'single_game_points', value: 50 }, rewards: { gold: 300, title: '得分机器' } },
  { id: 'record_triple_double', name: '三双达人', category: 'event', icon: '🏀', desc: '累计获得10次三双', requirement: { type: 'triple_double', value: 10 }, rewards: { gold: 600, title: '全能战士' } },
];

export const LEADERBOARD_TYPES = [
  { id: 'overall', name: '总评排行榜', icon: '⭐', field: 'overall' },
  { id: 'mvp_count', name: 'MVP排行榜', icon: '🏆', field: 'mvp_count' },
  { id: 'street_wins', name: '街头获胜榜', icon: '🏀', field: 'street_wins' },
  { id: 'street_mvp', name: '街头MVP榜', icon: '👑', field: 'street_mvp' },
];

export const TEAM_NAMES = ['街头风暴', '城市猎人', '篮球梦想家', '闪电战队', '铁血战士', '飞鹰队', '火焰篮球', '星河战队', '王者归来', '荣耀之路'];
export const TEAM_EMBLEMS = ['⚡', '🏹', '🏀', '🔥', '💪', '🦅', '🌟', '⭐', '👑', '🏆'];
export const PLAYER_NAME_PREFIXES = ['阿', '小', '大', '老', '少'];
export const PLAYER_NAME_SUFFIXES = ['强', '伟', '勇', '豪', '杰', '鹏', '飞', '翔', '涛', '海'];
export const LEADERBOARD_NAMES = ['张三', '李四', '王五', '赵六', '小明', '小华', '小强', '小刚', '鹏飞', '海涛', '建华', '志强', '博文', '浩宇', '子轩'];
export const TITLES = ['街头王者', 'MVP之王', '超级巨星', '人气偶像', '传奇球员', '冠军教头', '连胜之师', '无敌战队', '联赛霸主', '全明星球员'];

// 隐藏属性配置 - 这些属性不直接显示，但会影响比赛表现
export const HIDDEN_ATTRIBUTES = {
  clutch: { name: '关键球能力', desc: '影响关键时刻的命中率', max: 100 },
  consistency: { name: '稳定性', desc: '影响表现的波动程度', max: 100 },
  basketballIQ: { name: '篮球智商', desc: '影响决策和战术执行', max: 100 },
  workEthic: { name: '职业态度', desc: '影响训练效果和成长速度', max: 100 },
  leadership: { name: '领导力', desc: '影响团队配合效果', max: 100 },
  adaptability: { name: '适应能力', desc: '影响面对不同对手的发挥', max: 100 },
  injuryResistance: { name: '抗伤病能力', desc: '降低受伤风险', max: 100 },
  mentalToughness: { name: '心理素质', desc: '影响高压情况下的表现', max: 100 },
};

// 职员类型配置
export const STAFF_TYPES = {
  agent: {
    id: 'agent',
    name: '经纪人',
    icon: '💼',
    desc: '负责球员选秀和球队签约',
    hireCost: 5000, // 雇佣费用
    skills: ['draft_negotiation', 'contract_signing'],
  },
  scout: {
    id: 'scout',
    name: '球探',
    icon: '🔍',
    desc: '负责探测球员隐藏能力和潜力',
    hireCost: 5000, // 雇佣费用
    detectCost: 500, // 每次探测费用
    skills: ['hidden_attr_detect', 'potential_analyze'],
  },
};

// 职员等级
export const STAFF_LEVELS = [
  { level: 1, name: '初级', upgradeCost: 3000, successRate: 0.6 },
  { level: 2, name: '中级', upgradeCost: 8000, successRate: 0.75 },
  { level: 3, name: '高级', upgradeCost: 15000, successRate: 0.85 },
  { level: 4, name: '专家', upgradeCost: 30000, successRate: 0.95 },
];

// 职员名字库
export const STAFF_NAMES = {
  agents: ['张经纪', '李顾问', '王代理', '赵中介', '陈经理人', '刘合伙人'],
  scouts: ['孙球探', '周侦查', '吴观察', '郑分析', '冯评估', '褚发现'],
};

// 选秀配置
export const DRAFT_CONFIG = {
  // ========== 新选秀系统配置（盲盒机制）==========
  
  // 准入条件：无任何限制
  minOverall: 0, // 无总评限制
  
  // 参与限制
  dailyFreeDrafts: 2, // 每日免费选秀次数（每个球员每日2次）
  maxDailyAttempts: 2, // 同一球员每日最多参与2次
  
  // 每轮配置
  poolCapacity: 30, // 每轮选秀池容量（玩家+AI）
  maxPlayerSlots: 30, // 玩家报名上限
  registrationDuration: 1 * 60 * 1000, // 报名时间：1分钟（测试用，原5分钟）
  draftDuration: 1 * 60 * 1000, // 选秀时间：1分钟（测试用，原5分钟）
  
  // AI填充配置
  aiFillMinOverall: 50, // AI球员最小总评
  aiFillMaxOverall: 80, // AI球员最大总评
  
  // 盲盒目标总评范围
  targetOverallMin: 50,
  targetOverallMax: 80,
  
  // 选秀顺位配置（1-10顺位）
  draftPicks: [
    { pick: 1, name: '状元', baseProbability: 8 },
    { pick: 2, name: '榜眼', baseProbability: 10 },
    { pick: 3, name: '探花', baseProbability: 12 },
    { pick: 4, name: '第4顺位', baseProbability: 14 },
    { pick: 5, name: '第5顺位', baseProbability: 16 },
    { pick: 6, name: '第6顺位', baseProbability: 18 },
    { pick: 7, name: '第7顺位', baseProbability: 20 },
    { pick: 8, name: '第8顺位', baseProbability: 22 },
    { pick: 9, name: '第9顺位', baseProbability: 25 },
    { pick: 10, name: '第10顺位', baseProbability: 30 },
  ],
  
  // 差值影响配置（以第10顺位为基准）
  differenceImpact: {
    // 差值 <= 10: 增加概率
    smallDiff: { threshold: 10, bonus: { 
      1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10, 10: 5 
    }},
    // 差值 11-20: 减少概率
    mediumDiff: { min: 11, max: 20, penalty: {
      1: -3, 2: -2, 3: -1, 4: -1, 5: 0, 6: 0, 7: 1, 8: 2, 9: 3, 10: -2
    }},
    // 差值 > 20: 大幅减少概率
    largeDiff: { threshold: 20, penalty: {
      1: -6, 2: -5, 3: -4, 4: -3, 5: -2, 6: -2, 7: -1, 8: -1, 9: 0, 10: -5
    }}
  },
  
  // 概率上限
  maxProbability: 40, // 叠加后最高不超过40%
  
  // 保底机制
  consecutiveFailures: {
    threshold2: { bonus: 10 },     // 连续2次落选：+10%概率
    threshold3: { guaranteed: false }, // 连续3次：不再必中，保留随机性
  },
  
  // 徽章加成
  badgeBonus: {
    rookiePotential: 5,  // "新秀潜力"徽章：+5%
    draftHotshot: 10,    // "选秀热门"徽章：+10%
  },
  
  // 重置时间
  resetTime: '00:00', // 每日0点重置
};

// ========== 旧配置保留（兼容）==========
export const OLD_DRAFT_CONFIG = {
  minOverall: 30,
  dailyFreeDrafts: 1,
  maxDailyAttempts: 2,
  registrationPeriods: [
    { start: '11:30', end: '12:00', draftStart: '12:00', draftEnd: '13:00' },
    { start: '19:30', end: '20:00', draftStart: '20:00', draftEnd: '21:00' },
  ],
  poolCapacity: 10,
  probabilityTiers: [
    { min: 30, max: 34, baseRate: 30, increment: 1 },
    { min: 35, max: 39, baseRate: 36, increment: 2 },
    { min: 40, max: 49, baseRate: 48, increment: 2.5 },
    { min: 50, max: 59, baseRate: 68, increment: 1.5 },
    { min: 60, max: 100, baseRate: 82, increment: 0.8 },
  ],
  consecutiveFailures: {
    threshold2: { bonus: 10, reward: 'draft_bonus_card' },
    threshold3: { guaranteed: true, reward: 'guaranteed_pick' },
  },
  badges: {
    tier1: { min: 30, max: 39, name: '新秀入门', desc: '小幅提升投篮稳定性' },
    tier2: { min: 40, max: 49, name: '潜力新星', desc: '提升移动速度+投篮命中率' },
    tier3: { min: 50, max: 100, name: '选秀精英', desc: '大幅提升各项基础属性' },
  },
};

/**
 * 计算选中概率（新盲盒机制）
 * @param {number} playerOverall - 球员总评
 * @param {number} targetOverall - 盲盒目标总评
 * @param {number} draftPick - 选秀顺位（1-10）
 * @param {number} consecutiveFailures - 连续落选次数
 * @param {object} badges - 球员徽章
 * @returns {number} 选中概率（百分比）
 */
export function calculateDraftProbability(playerOverall, targetOverall, draftPick = 10, consecutiveFailures = 0, badges = {}) {
  const diff = Math.abs(playerOverall - targetOverall);
  const pickIndex = draftPick - 1; // 转为0-based索引
  const pickConfig = DRAFT_CONFIG.draftPicks[pickIndex];
  
  if (!pickConfig) return 0;
  
  let probability = pickConfig.baseProbability;
  
  // 应用差值影响
  if (diff <= DRAFT_CONFIG.differenceImpact.smallDiff.threshold) {
    // 差值 <= 10: 增加概率
    const bonus = DRAFT_CONFIG.differenceImpact.smallDiff.bonus[draftPick] || 0;
    probability += bonus;
  } else if (diff >= DRAFT_CONFIG.differenceImpact.mediumDiff.min && diff <= DRAFT_CONFIG.differenceImpact.mediumDiff.max) {
    // 差值 11-20
    const penalty = DRAFT_CONFIG.differenceImpact.mediumDiff.penalty[draftPick] || 0;
    probability += penalty;
  } else if (diff > DRAFT_CONFIG.differenceImpact.largeDiff.threshold) {
    // 差值 > 20: 大幅减少
    const penalty = DRAFT_CONFIG.differenceImpact.largeDiff.penalty[draftPick] || 0;
    probability += penalty;
  }
  
  // 应用保底加成
  if (consecutiveFailures >= 2) {
    probability += DRAFT_CONFIG.consecutiveFailures.threshold2.bonus;
  }
  
  // 应用徽章加成
  if (badges.rookiePotential) {
    probability += DRAFT_CONFIG.badgeBonus.rookiePotential;
  }
  if (badges.draftHotshot) {
    probability += DRAFT_CONFIG.badgeBonus.draftHotshot;
  }
  
  // 限制在合理范围内（最高40%）
  probability = Math.min(Math.max(probability, 1), DRAFT_CONFIG.maxProbability);
  
  return probability;
}

/**
 * 生成盲盒目标总评（50-80随机）
 * @returns {number} 目标总评
 */
export function generateTargetOverall() {
  return Math.floor(Math.random() * (DRAFT_CONFIG.targetOverallMax - DRAFT_CONFIG.targetOverallMin + 1)) + DRAFT_CONFIG.targetOverallMin;
}

/**
 * 生成AI球员
 * @param {number} index - AI序号
 * @returns {object} AI球员信息
 */
export function generateAIPlayer(index) {
  const overall = Math.floor(Math.random() * (DRAFT_CONFIG.aiFillMaxOverall - DRAFT_CONFIG.aiFillMinOverall + 1)) + DRAFT_CONFIG.aiFillMinOverall;
  return {
    id: `ai_${index}_${Date.now()}`,
    name: `AI球员${index}`,
    isAI: true,
    overall,
    position: ['PG', 'SG', 'SF', 'PF', 'C'][Math.floor(Math.random() * 5)],
  };
}

// 判断是否在报名时段内（旧函数，保留兼容）
export function isRegistrationPeriod() {
  return true; // 新系统随时可报名
}

// 获取当前选秀状态（新系统）
export function getCurrentDraftStatus() {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  for (const period of OLD_DRAFT_CONFIG.registrationPeriods) {
    if (currentTime >= period.start && currentTime < period.end) {
      return { status: 'registration', period, nextPhase: 'draft' };
    }
    if (currentTime >= period.draftStart && currentTime < period.draftEnd) {
      return { status: 'drafting', period, nextPhase: 'closed' };
    }
  }
  
  return { status: 'closed', nextPhase: 'registration' };
}
