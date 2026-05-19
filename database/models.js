import { runQuery, runExec, getOne } from './init.js';

export const PlayerModel = {
  create(player) {
    const sql = `
      INSERT INTO players (
        id, name, overall, position, position_abbr, age, height, weight,
        level, exp, potential, potential_rank,
        speed, jump, strength, three_point, inside, defense, dribble, pass,
        stamina_attr, rebound, morale, pressure, block_attr, steal, mid_range, break_through,
        clutch, consistency, basketball_iq, work_ethic, leadership, adaptability, injury_resistance, mental_toughness,
        current_stamina, max_stamina, street_games_today, league, season, games_remaining, playoffs_round,
        wins, losses, streak, rank, gold,
        games_played, street_wins, street_mvp, mvp_count, total_points, total_rebounds, total_assists,
        total_steals, total_blocks, fame,
        title, jersey, hair, skin, accessory,
        staff, draft_remaining_daily_drafts, draft_last_reset_at, draft_applied_today,
        draft_consecutive_failures, draft_badge, draft_scouted_attributes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return runExec(sql, [
      player.id,
      player.name,
      player.overall || 70,
      player.position || 'PG',
      player.positionAbbr || 'PG',
      player.age || 18,
      player.height || 180,
      player.weight || 70,
      player.level || 1,
      player.exp || 0,
      player.potential || 70,
      player.potentialRank || 'common',
      player.attributes?.speed || 10,
      player.attributes?.jump || 10,
      player.attributes?.strength || 10,
      player.attributes?.threePoint || 10,
      player.attributes?.inside || 10,
      player.attributes?.defense || 10,
      player.attributes?.dribble || 10,
      player.attributes?.pass || 10,
      player.attributes?.stamina || 10,
      player.attributes?.rebound || 10,
      player.attributes?.morale || 10,
      player.attributes?.pressure || 10,
      player.attributes?.block || 10,
      player.attributes?.steal || 10,
      player.attributes?.midRange || 10,
      player.attributes?.breakThrough || 10,
      player.hiddenAttributes?.clutch || 50,
      player.hiddenAttributes?.consistency || 50,
      player.hiddenAttributes?.basketballIQ || 50,
      player.hiddenAttributes?.workEthic || 50,
      player.hiddenAttributes?.leadership || 50,
      player.hiddenAttributes?.adaptability || 50,
      player.hiddenAttributes?.injuryResistance || 50,
      player.hiddenAttributes?.mentalToughness || 50,
      player.status?.currentStamina || 100,
      player.status?.maxStamina || 100,
      player.status?.streetGamesToday || 0,
      player.status?.league || 0,
      player.status?.season || 1,
      player.status?.gamesRemaining || 30,
      player.status?.playoffsRound || 0,
      player.wins || 0,
      player.losses || 0,
      player.streak || 0,
      player.rank || 'bronze',
      player.economy?.gold || 0,
      player.statistics?.gamesPlayed || 0,
      player.statistics?.streetWins || 0,
      player.statistics?.streetMVP || 0,
      player.statistics?.mvpCount || 0,
      player.statistics?.totalPoints || 0,
      player.statistics?.totalRebounds || 0,
      player.statistics?.totalAssists || 0,
      player.statistics?.totalSteals || 0,
      player.statistics?.totalBlocks || 0,
      player.statistics?.fame || 0,
      player.title || '',
      player.appearance?.jersey || 'jersey_1',
      player.appearance?.hair || 'hair_1',
      player.appearance?.skin || 'skin_1',
      player.appearance?.accessory || 'acc_1',
      JSON.stringify(player.staff || []),
      player.draft?.remainingDailyDrafts || 2,
      0,
      player.draft?.appliedToday || 0,
      player.draft?.consecutiveFailures || 0,
      player.draft?.badge || '',
      JSON.stringify(player.draft?.scoutedAttributes || {})
    ]);
  },

  findById(id) {
    const player = getOne('SELECT * FROM players WHERE id = ?', [id]);
    if (player) {
      return this.deserializePlayer(player);
    }
    return null;
  },

  deserializePlayer(row) {
    return {
      id: row.id,
      playerName: row.name,
      position: row.position,
      positionAbbr: row.position_abbr,
      age: row.age,
      height: row.height,
      weight: row.weight,
      level: row.level,
      exp: row.exp,
      overall: row.overall,
      potential: row.potential,
      potentialRank: row.potential_rank,
      attributes: {
        speed: row.speed,
        jump: row.jump,
        strength: row.strength,
        threePoint: row.three_point,
        inside: row.inside,
        defense: row.defense,
        dribble: row.dribble,
        pass: row.pass,
        stamina: row.stamina_attr,
        rebound: row.rebound,
        morale: row.morale,
        pressure: row.pressure,
        block: row.block_attr,
        steal: row.steal,
        midRange: row.mid_range,
        breakThrough: row.break_through
      },
      hiddenAttributes: {
        clutch: row.clutch,
        consistency: row.consistency,
        basketballIQ: row.basketball_iq,
        workEthic: row.work_ethic,
        leadership: row.leadership,
        adaptability: row.adaptability,
        injuryResistance: row.injury_resistance,
        mentalToughness: row.mental_toughness
      },
      status: {
        currentStamina: row.current_stamina,
        maxStamina: row.max_stamina,
        streetGamesToday: row.street_games_today,
        league: row.league,
        season: row.season,
        gamesRemaining: row.games_remaining,
        playoffsRound: row.playoffs_round
      },
      economy: {
        gold: row.gold
      },
      statistics: {
        gamesPlayed: row.games_played,
        streetWins: row.street_wins,
        streetMVP: row.street_mvp,
        mvpCount: row.mvp_count,
        totalPoints: row.total_points,
        totalRebounds: row.total_rebounds,
        totalAssists: row.total_assists,
        totalSteals: row.total_steals,
        totalBlocks: row.total_blocks,
        fame: row.fame
      },
      wins: row.wins,
      losses: row.losses,
      streak: row.streak,
      rank: row.rank,
      title: row.title,
      appearance: {
        jersey: row.jersey,
        hair: row.hair,
        skin: row.skin,
        accessory: row.accessory
      },
      staff: JSON.parse(row.staff || '[]'),
      draft: {
        remainingDailyDrafts: row.draft_remaining_daily_drafts,
        lastDraftReset: row.draft_last_reset_at,
        appliedToday: row.draft_applied_today,
        consecutiveFailures: row.draft_consecutive_failures,
        badge: row.draft_badge,
        scoutedAttributes: JSON.parse(row.draft_scouted_attributes || '{}')
      }
    };
  },

  findByName(name) {
    const player = getOne('SELECT * FROM players WHERE name = ?', [name]);
    if (player) {
      return this.deserializePlayer(player);
    }
    return null;
  },

  findAll() {
    return runQuery('SELECT * FROM players ORDER BY overall DESC, wins DESC');
  },

  update(id, data) {
    const fields = [];
    const values = [];
    
    Object.keys(data).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    });
    
    fields.push('updated_at = ?');
    values.push(Date.now());
    values.push(id);
    
    const sql = `UPDATE players SET ${fields.join(', ')} WHERE id = ?`;
    return runExec(sql, values);
  },

  updateStats(id, wins, losses, streak, rank) {
    return runExec(`
      UPDATE players 
      SET wins = wins + ?, losses = losses + ?, streak = ?, rank = ?, updated_at = ?
      WHERE id = ?
    `, [wins, losses, streak, rank, Date.now(), id]);
  },

  addRewards(id, gold, exp) {
    return runExec(`
      UPDATE players 
      SET gold = gold + ?, exp = exp + ?, updated_at = ?
      WHERE id = ?
    `, [gold, exp, Date.now(), id]);
  },

  updateEquipment(id, equipment) {
    return runExec(`
      UPDATE players 
      SET equipment = ?, updated_at = ?
      WHERE id = ?
    `, [JSON.stringify(equipment), Date.now(), id]);
  },

  getLeaderboard(limit = 20) {
    return runQuery(`
      SELECT id, name, overall, wins, losses, streak, rank, gold, exp, level
      FROM players 
      ORDER BY wins DESC, overall DESC
      LIMIT ?
    `, [limit]);
  },

  search(query) {
    return runQuery(`
      SELECT id, name, overall, position, rank, wins, losses
      FROM players 
      WHERE name LIKE ?
      ORDER BY wins DESC
      LIMIT 20
    `, [`%${query}%`]);
  },

  saveFullPlayer(id, playerData) {
    const sql = `
      UPDATE players SET
        overall = ?, position = ?, position_abbr = ?, age = ?, height = ?, weight = ?,
        level = ?, exp = ?, potential = ?, potential_rank = ?,
        speed = ?, jump = ?, strength = ?, three_point = ?, inside = ?, defense = ?, dribble = ?, pass = ?,
        stamina_attr = ?, rebound = ?, morale = ?, pressure = ?, block_attr = ?, steal = ?, mid_range = ?, break_through = ?,
        clutch = ?, consistency = ?, basketball_iq = ?, work_ethic = ?, leadership = ?, adaptability = ?, injury_resistance = ?, mental_toughness = ?,
        current_stamina = ?, max_stamina = ?, street_games_today = ?, league = ?, season = ?, games_remaining = ?, playoffs_round = ?,
        wins = ?, losses = ?, streak = ?, rank = ?, gold = ?,
        games_played = ?, street_wins = ?, street_mvp = ?, mvp_count = ?, total_points = ?, total_rebounds = ?, total_assists = ?,
        total_steals = ?, total_blocks = ?, fame = ?,
        title = ?, jersey = ?, hair = ?, skin = ?, accessory = ?,
        staff = ?, draft_remaining_daily_drafts = ?, draft_last_reset_at = ?, draft_applied_today = ?,
        draft_consecutive_failures = ?, draft_badge = ?, draft_scouted_attributes = ?,
        updated_at = ?
      WHERE id = ?
    `;
    
    const attributes = playerData.attributes || {};
    const hiddenAttrs = playerData.hiddenAttributes || {};
    const status = playerData.status || {};
    const economy = playerData.economy || {};
    const statistics = playerData.statistics || {};
    const appearance = playerData.appearance || {};
    const draft = playerData.draft || {};
    
    return runExec(sql, [
      playerData.overall || 70,
      playerData.position || 'PG',
      playerData.positionAbbr || 'PG',
      playerData.age || 18,
      playerData.height || 180,
      playerData.weight || 70,
      playerData.level || 1,
      playerData.exp || 0,
      playerData.potential || 70,
      playerData.potentialRank || 'common',
      attributes.speed || 10,
      attributes.jump || 10,
      attributes.strength || 10,
      attributes.threePoint || 10,
      attributes.inside || 10,
      attributes.defense || 10,
      attributes.dribble || 10,
      attributes.pass || 10,
      attributes.stamina || 10,
      attributes.rebound || 10,
      attributes.morale || 10,
      attributes.pressure || 10,
      attributes.block || 10,
      attributes.steal || 10,
      attributes.midRange || 10,
      attributes.breakThrough || 10,
      hiddenAttrs.clutch || 50,
      hiddenAttrs.consistency || 50,
      hiddenAttrs.basketballIQ || 50,
      hiddenAttrs.workEthic || 50,
      hiddenAttrs.leadership || 50,
      hiddenAttrs.adaptability || 50,
      hiddenAttrs.injuryResistance || 50,
      hiddenAttrs.mentalToughness || 50,
      status.currentStamina || 100,
      status.maxStamina || 100,
      status.streetGamesToday || 0,
      status.league || 0,
      status.season || 1,
      status.gamesRemaining || 30,
      status.playoffsRound || 0,
      playerData.wins || 0,
      playerData.losses || 0,
      playerData.streak || 0,
      playerData.rank || 'bronze',
      economy.gold || 0,
      statistics.gamesPlayed || 0,
      statistics.streetWins || 0,
      statistics.streetMVP || 0,
      statistics.mvpCount || 0,
      statistics.totalPoints || 0,
      statistics.totalRebounds || 0,
      statistics.totalAssists || 0,
      statistics.totalSteals || 0,
      statistics.totalBlocks || 0,
      statistics.fame || 0,
      playerData.title || '',
      appearance.jersey || 'jersey_1',
      appearance.hair || 'hair_1',
      appearance.skin || 'skin_1',
      appearance.accessory || 'acc_1',
      JSON.stringify(playerData.staff || []),
      draft.remainingDailyDrafts || 2,
      draft.lastDraftReset || 0,
      draft.appliedToday || 0,
      draft.consecutiveFailures || 0,
      draft.badge || '',
      JSON.stringify(draft.scoutedAttributes || {}),
      Date.now(),
      id
    ]);
  },

  delete(id) {
    return runExec('DELETE FROM players WHERE id = ?', [id]);
  }
};

export const MatchModel = {
  create(match) {
    const sql = `
      INSERT INTO matches (id, room_id, room_name, mode, team_a_score, team_b_score, winning_team, team_a_players, team_b_players, player_stats, duration)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return runExec(sql, [
      match.id,
      match.roomId,
      match.roomName,
      match.mode,
      match.teamAScore,
      match.teamBScore,
      match.winningTeam,
      JSON.stringify(match.teamAPlayers),
      JSON.stringify(match.teamBPlayers),
      JSON.stringify(match.playerStats),
      match.duration || 0
    ]);
  },

  findById(id) {
    const match = getOne('SELECT * FROM matches WHERE id = ?', [id]);
    if (match) {
      match.teamAPlayers = JSON.parse(match.team_a_players || '[]');
      match.teamBPlayers = JSON.parse(match.team_b_players || '[]');
      match.playerStats = JSON.parse(match.player_stats || '[]');
    }
    return match;
  },

  findByPlayer(playerId, limit = 20) {
    const matches = runQuery(`
      SELECT * FROM matches 
      WHERE team_a_players LIKE ? OR team_b_players LIKE ?
      ORDER BY created_at DESC
      LIMIT ?
    `, [`%${playerId}%`, `%${playerId}%`, limit]);
    
    return matches.map(match => {
      match.teamAPlayers = JSON.parse(match.team_a_players || '[]');
      match.teamBPlayers = JSON.parse(match.team_b_players || '[]');
      match.playerStats = JSON.parse(match.player_stats || '[]');
      return match;
    });
  },

  findRecent(limit = 50) {
    const matches = runQuery(`
      SELECT * FROM matches 
      ORDER BY created_at DESC
      LIMIT ?
    `, [limit]);
    
    return matches.map(match => {
      match.teamAPlayers = JSON.parse(match.team_a_players || '[]');
      match.teamBPlayers = JSON.parse(match.team_b_players || '[]');
      match.playerStats = JSON.parse(match.player_stats || '[]');
      return match;
    });
  },

  getStats() {
    const result = getOne(`
      SELECT 
        COUNT(*) as total,
        SUM(team_a_score) as total_team_a_score,
        SUM(team_b_score) as total_team_b_score
      FROM matches
    `);
    return result;
  }
};

export const EquipmentModel = {
  create(equipment) {
    const sql = `
      INSERT INTO equipment (id, player_id, name, type, rarity, bonus, is_equipped)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    return runExec(sql, [
      equipment.id,
      equipment.playerId,
      equipment.name,
      equipment.type,
      equipment.rarity,
      JSON.stringify(equipment.bonus),
      equipment.isEquipped ? 1 : 0
    ]);
  },

  findByPlayer(playerId) {
    return runQuery('SELECT * FROM equipment WHERE player_id = ? ORDER BY created_at DESC', [playerId]);
  },

  findById(id) {
    return getOne('SELECT * FROM equipment WHERE id = ?', [id]);
  },

  updateEquipped(id, isEquipped) {
    return runExec('UPDATE equipment SET is_equipped = ? WHERE id = ?', [isEquipped ? 1 : 0, id]);
  },

  delete(id) {
    return runExec('DELETE FROM equipment WHERE id = ?', [id]);
  },

  getDroppedByPlayer(playerId, limit = 10) {
    return runQuery(`
      SELECT * FROM equipment 
      WHERE player_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `, [playerId, limit]);
  }
};

export const DraftModel = {
  createRecord(record) {
    const sql = `
      INSERT INTO draft_records (round, player_id, player_name, player_overall, target_overall, draft_pick, result, is_ai)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return runExec(sql, [
      record.round,
      record.playerId,
      record.playerName,
      record.playerOverall,
      record.targetOverall,
      record.draftPick,
      record.result,
      record.isAI ? 1 : 0
    ]);
  },

  findByRound(round) {
    return runQuery(`
      SELECT * FROM draft_records 
      WHERE round = ? 
      ORDER BY draft_pick ASC
    `, [round]);
  },

  getLatestRound() {
    return getOne('SELECT MAX(round) as round FROM draft_records');
  },

  getPlayerHistory(playerId) {
    return runQuery(`
      SELECT * FROM draft_records 
      WHERE player_id = ? 
      ORDER BY created_at DESC
    `, [playerId]);
  }
};

export const RoomModel = {
  create(room) {
    const sql = `
      INSERT INTO rooms (id, name, mode, required_players, status, team_a_players, team_b_players, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return runExec(sql, [
      room.id,
      room.name,
      room.mode,
      room.requiredPlayers,
      room.status,
      JSON.stringify(room.teamAPlayers || []),
      JSON.stringify(room.teamBPlayers || []),
      room.createdBy
    ]);
  },

  findById(id) {
    const room = getOne('SELECT * FROM rooms WHERE id = ?', [id]);
    if (room) {
      room.teamAPlayers = JSON.parse(room.team_a_players || '[]');
      room.teamBPlayers = JSON.parse(room.team_b_players || '[]');
    }
    return room;
  },

  findAll() {
    const rooms = runQuery(`
      SELECT * FROM rooms 
      WHERE status IN ('waiting', 'ready', 'playing') 
      ORDER BY created_at DESC
    `);
    
    return rooms.map(room => {
      room.teamAPlayers = JSON.parse(room.team_a_players || '[]');
      room.teamBPlayers = JSON.parse(room.team_b_players || '[]');
      return room;
    });
  },

  update(id, data) {
    const fields = [];
    const values = [];
    
    Object.keys(data).forEach(key => {
      if (key === 'teamAPlayers' || key === 'teamBPlayers') {
        fields.push(`${key === 'teamAPlayers' ? 'team_a_players' : 'team_b_players'} = ?`);
        values.push(JSON.stringify(data[key]));
      } else {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });
    
    fields.push('updated_at = ?');
    values.push(Date.now());
    values.push(id);
    
    const sql = `UPDATE rooms SET ${fields.join(', ')} WHERE id = ?`;
    return runExec(sql, values);
  },

  updateStatus(id, status) {
    return runExec('UPDATE rooms SET status = ?, updated_at = ? WHERE id = ?', [status, Date.now(), id]);
  },

  addPlayer(roomId, player, team) {
    const room = this.findById(roomId);
    if (!room) return false;
    
    const teamField = team === 'A' ? 'teamAPlayers' : 'teamBPlayers';
    const players = room[teamField];
    players.push(player);
    
    return this.update(roomId, { [teamField]: players });
  },

  removePlayer(roomId, playerId) {
    const room = this.findById(roomId);
    if (!room) return false;
    
    room.teamAPlayers = room.teamAPlayers.filter(p => p.id !== playerId);
    room.teamBPlayers = room.teamBPlayers.filter(p => p.id !== playerId);
    
    return this.update(roomId, {
      teamAPlayers: room.teamAPlayers,
      teamBPlayers: room.teamBPlayers
    });
  },

  delete(id) {
    return runExec('DELETE FROM rooms WHERE id = ?', [id]);
  }
};
