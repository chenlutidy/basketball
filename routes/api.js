import express from 'express';
import { PlayerModel, MatchModel, EquipmentModel, DraftModel, RoomModel } from '../database/models.js';

const router = express.Router();

router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime()
  });
});

router.get('/stats', (req, res) => {
  try {
    const players = PlayerModel.findAll();
    const matchStats = MatchModel.getStats();
    
    res.json({
      totalPlayers: players.length,
      totalMatches: matchStats.total || 0,
      avgTeamAScore: matchStats.total_team_a_score / (matchStats.total || 1),
      avgTeamBScore: matchStats.total_team_b_score / (matchStats.total || 1)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/players', (req, res) => {
  try {
    const { search, limit = 50 } = req.query;
    let players;
    
    if (search) {
      players = PlayerModel.search(search);
    } else {
      players = PlayerModel.findAll();
      players = players.slice(0, parseInt(limit));
    }
    
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/players/:id', (req, res) => {
  try {
    const player = PlayerModel.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    const equipment = EquipmentModel.findByPlayer(req.params.id);
    const matchHistory = MatchModel.findByPlayer(req.params.id, 20);
    const draftHistory = DraftModel.getPlayerHistory(req.params.id);
    
    res.json({
      ...player,
      equipment,
      matchHistory,
      draftHistory
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/players', (req, res) => {
  try {
    const { id, name, overall, position } = req.body;
    
    if (!id || !name) {
      return res.status(400).json({ error: 'Missing required fields: id and name' });
    }
    
    const existing = PlayerModel.findById(id);
    if (existing) {
      return res.json(existing);
    }
    
    PlayerModel.create({
      id,
      name,
      overall: overall || 70,
      position: position || 'PG'
    });
    
    const player = PlayerModel.findById(id);
    res.status(201).json(player);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'Player name already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

router.put('/players/:id', (req, res) => {
  try {
    const { wins, losses, streak, rank, gold, exp, level, overall, position } = req.body;
    
    const player = PlayerModel.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    if (wins !== undefined || losses !== undefined) {
      PlayerModel.updateStats(req.params.id, wins || 0, losses || 0, streak || player.streak, rank || player.rank);
    }
    
    if (gold !== undefined || exp !== undefined) {
      PlayerModel.addRewards(req.params.id, gold || 0, exp || 0);
    }
    
    if (level !== undefined || overall !== undefined || position !== undefined) {
      PlayerModel.update(req.params.id, {
        ...(level !== undefined && { level }),
        ...(overall !== undefined && { overall }),
        ...(position !== undefined && { position })
      });
    }
    
    const updated = PlayerModel.findById(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/leaderboard', (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const leaderboard = PlayerModel.getLeaderboard(parseInt(limit));
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/matches', (req, res) => {
  try {
    const { playerId, limit = 50 } = req.query;
    
    let matches;
    if (playerId) {
      matches = MatchModel.findByPlayer(playerId, parseInt(limit));
    } else {
      matches = MatchModel.findRecent(parseInt(limit));
    }
    
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/matches/:id', (req, res) => {
  try {
    const match = MatchModel.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/rooms', (req, res) => {
  try {
    const rooms = RoomModel.findAll();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/rooms/:id', (req, res) => {
  try {
    const room = RoomModel.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/equipment', (req, res) => {
  try {
    const { playerId, limit = 50 } = req.query;
    
    if (!playerId) {
      return res.status(400).json({ error: 'playerId is required' });
    }
    
    const equipment = EquipmentModel.getDroppedByPlayer(playerId, parseInt(limit));
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/draft', (req, res) => {
  try {
    const { round } = req.query;
    
    if (round) {
      const records = DraftModel.findByRound(parseInt(round));
      return res.json(records);
    }
    
    const latestRound = DraftModel.getLatestRound();
    if (latestRound && latestRound.round) {
      const records = DraftModel.findByRound(latestRound.round);
      return res.json({
        round: latestRound.round,
        records
      });
    }
    
    res.json({ round: 0, records: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
