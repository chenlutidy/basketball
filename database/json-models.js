import { getDatabase, saveDatabase } from './json-db.js';

// 玩家模型
export const PlayerModel = {
  create(player) {
    const db = getDatabase();
    
    const newPlayer = {
      id: player.id,
      name: player.playerName || player.name,
      playerName: player.playerName || player.name,
      overall: player.overall || 70,
      position: player.position || 0,
      positionAbbr: player.positionAbbr || 'PG',
      age: player.age || 18,
      height: player.height || 180,
      weight: player.weight || 70,
      level: player.level || 1,
      exp: player.exp || 0,
      potential: player.potential || 70,
      potentialRank: player.potentialRank || 'common',
      
      attributes: {
        speed: player.attributes?.speed || 10,
        jump: player.attributes?.jump || 10,
        strength: player.attributes?.strength || 10,
        threePoint: player.attributes?.threePoint || 10,
        inside: player.attributes?.inside || 10,
        defense: player.attributes?.defense || 10,
        dribble: player.attributes?.dribble || 10,
        pass: player.attributes?.pass || 10,
        stamina: player.attributes?.stamina || 10,
        rebound: player.attributes?.rebound || 10,
        morale: player.attributes?.morale || 10,
        pressure: player.attributes?.pressure || 10,
        block: player.attributes?.block || 10,
        steal: player.attributes?.steal || 10,
        midRange: player.attributes?.midRange || 10,
        breakThrough: player.attributes?.breakThrough || 10
      },
      
      hiddenAttributes: {
        clutch: player.hiddenAttributes?.clutch || 50,
        consistency: player.hiddenAttributes?.consistency || 50,
        basketballIQ: player.hiddenAttributes?.basketballIQ || 50,
        workEthic: player.hiddenAttributes?.workEthic || 50,
        leadership: player.hiddenAttributes?.leadership || 50,
        adaptability: player.hiddenAttributes?.adaptability || 50,
        injuryResistance: player.hiddenAttributes?.injuryResistance || 50,
        mentalToughness: player.hiddenAttributes?.mentalToughness || 50
      },
      
      status: {
        currentStamina: player.status?.currentStamina || 100,
        maxStamina: player.status?.maxStamina || 100,
        streetGamesToday: player.status?.streetGamesToday || 0,
        league: player.status?.league || 0,
        season: player.status?.season || 1,
        gamesRemaining: player.status?.gamesRemaining || 30,
        playoffsRound: player.status?.playoffsRound || 0
      },
      
      economy: {
        gold: player.economy?.gold || 400
      },
      
      statistics: {
        gamesPlayed: player.statistics?.gamesPlayed || 0,
        streetWins: player.statistics?.streetWins || 0,
        streetMVP: player.statistics?.streetMVP || 0,
        mvpCount: player.statistics?.mvpCount || 0,
        totalPoints: player.statistics?.totalPoints || 0,
        totalRebounds: player.statistics?.totalRebounds || 0,
        totalAssists: player.statistics?.totalAssists || 0,
        totalSteals: player.statistics?.totalSteals || 0,
        totalBlocks: player.statistics?.totalBlocks || 0,
        fame: player.statistics?.fame || 0
      },
      
      wins: player.wins || 0,
      losses: player.losses || 0,
      streak: player.streak || 0,
      rank: player.rank || 'bronze',
      
      title: player.title || '',
      appearance: {
        jersey: player.appearance?.jersey || 'jersey_1',
        hair: player.appearance?.hair || 'hair_1',
        skin: player.appearance?.skin || 'skin_1',
        accessory: player.appearance?.accessory || 'acc_1'
      },
      
      equipment: player.equipment || { worn: {} },
      backpack: player.backpack || [],
      talents: player.talents || [],
      
      staff: player.staff || [],
      draft: {
        remainingDailyDrafts: player.draft?.remainingDailyDrafts || 2,
        lastDraftReset: player.draft?.lastDraftReset || new Date().toDateString(),
        appliedToday: player.draft?.appliedToday || 0,
        consecutiveFailures: player.draft?.consecutiveFailures || 0,
        badge: player.draft?.badge || null,
        scoutedAttributes: player.draft?.scoutedAttributes || {}
      },
      
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    db.players.push(newPlayer);
    saveDatabase();
    return newPlayer;
  },

  findById(id) {
    const db = getDatabase();
    return db.players.find(p => p.id === id) || null;
  },

  findByName(name) {
    const db = getDatabase();
    return db.players.find(p => p.name === name || p.playerName === name) || null;
  },

  findAll() {
    const db = getDatabase();
    return [...db.players];
  },

  update(id, data) {
    const db = getDatabase();
    const index = db.players.findIndex(p => p.id === id);
    if (index !== -1) {
      db.players[index] = {
        ...db.players[index],
        ...data,
        updatedAt: Date.now()
      };
      saveDatabase();
      return db.players[index];
    }
    return null;
  },

  saveFullPlayer(id, playerData) {
    const db = getDatabase();
    const index = db.players.findIndex(p => p.id === id);
    if (index !== -1) {
      db.players[index] = {
        ...db.players[index],
        ...playerData,
        updatedAt: Date.now()
      };
      saveDatabase();
      return db.players[index];
    }
    return null;
  },

  delete(id) {
    const db = getDatabase();
    const index = db.players.findIndex(p => p.id === id);
    if (index !== -1) {
      db.players.splice(index, 1);
      saveDatabase();
      return true;
    }
    return false;
  }
};

// 比赛模型
export const MatchModel = {
  create(match) {
    const db = getDatabase();
    const newMatch = {
      id: match.id,
      roomId: match.roomId,
      roomName: match.roomName,
      mode: match.mode,
      teamAScore: match.teamAScore || 0,
      teamBScore: match.teamBScore || 0,
      winningTeam: match.winningTeam,
      teamAPlayers: match.teamAPlayers || [],
      teamBPlayers: match.teamBPlayers || [],
      playerStats: match.playerStats || [],
      duration: match.duration || 0,
      createdAt: Date.now()
    };
    db.matches.push(newMatch);
    saveDatabase();
    return newMatch;
  },

  findById(id) {
    const db = getDatabase();
    return db.matches.find(m => m.id === id) || null;
  },

  findByPlayer(playerId, limit = 20) {
    const db = getDatabase();
    return db.matches
      .filter(m => 
        JSON.stringify(m.teamAPlayers).includes(playerId) ||
        JSON.stringify(m.teamBPlayers).includes(playerId)
      )
      .slice(-limit)
      .reverse();
  },

  findRecent(limit = 50) {
    const db = getDatabase();
    return [...db.matches].slice(-limit).reverse();
  }
};

// 装备模型
export const EquipmentModel = {
  create(equipment) {
    const db = getDatabase();
    const newEquipment = {
      id: equipment.id,
      playerId: equipment.playerId,
      name: equipment.name,
      type: equipment.type,
      rarity: equipment.rarity,
      bonus: equipment.bonus,
      isEquipped: equipment.isEquipped || false,
      createdAt: Date.now()
    };
    db.equipment.push(newEquipment);
    saveDatabase();
    return newEquipment;
  },

  findByPlayer(playerId) {
    const db = getDatabase();
    return db.equipment.filter(e => e.playerId === playerId);
  }
};

// 选秀模型
export const DraftModel = {
  createRecord(record) {
    const db = getDatabase();
    const newRecord = {
      round: record.round,
      playerId: record.playerId,
      playerName: record.playerName,
      playerOverall: record.playerOverall,
      targetOverall: record.targetOverall,
      draftPick: record.draftPick,
      result: record.result,
      isAi: record.isAi || false,
      createdAt: Date.now()
    };
    db.draftRecords.push(newRecord);
    saveDatabase();
    return newRecord;
  }
};

// 房间模型
export const RoomModel = {
  create(room) {
    const db = getDatabase();
    const newRoom = {
      id: room.id,
      name: room.name,
      mode: room.mode,
      requiredPlayers: room.requiredPlayers,
      status: room.status || 'waiting',
      teamAPlayers: room.teamAPlayers || [],
      teamBPlayers: room.teamBPlayers || [],
      createdBy: room.createdBy,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    db.rooms.push(newRoom);
    saveDatabase();
    return newRoom;
  },

  findById(id) {
    const db = getDatabase();
    return db.rooms.find(r => r.id === id) || null;
  },

  findAll() {
    const db = getDatabase();
    return [...db.rooms].filter(r => ['waiting', 'ready', 'playing'].includes(r.status));
  },

  delete(id) {
    const db = getDatabase();
    const index = db.rooms.findIndex(r => r.id === id);
    if (index !== -1) {
      db.rooms.splice(index, 1);
      saveDatabase();
      return true;
    }
    return false;
  }
};
