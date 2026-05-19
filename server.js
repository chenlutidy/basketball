import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import path from 'path';
import cors from 'cors';
import { loadDatabase, saveDatabase } from './database/json-db.js';
import { PlayerModel, MatchModel, EquipmentModel, DraftModel, RoomModel } from './database/json-models.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false
  }
});

app.use(cors());
app.use(express.json());

const onlinePlayers = new Map();
const rooms = new Map();
let roomIdCounter = 1;

const DRAFT_CONFIG = {
  poolCapacity: 30,
  registrationDuration: 60 * 1000,
  draftDuration: 60 * 1000,
  targetOverallMin: 50,
  targetOverallMax: 80,
};

let globalDraftState = {
  phase: 'idle',
  countdown: 0,
  draftPool: [],
  targetOverall: null,
  draftIntervalId: null,
  currentRound: 0,
};

// 检查 dist 目录是否存在
import fs from 'fs';
const distPath = path.join(process.cwd(), 'dist');
const hasDist = fs.existsSync(distPath);

if (hasDist) {
  app.use(express.static(distPath));
  app.get('/', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log('✅ 前端静态文件已加载');
} else {
  console.log('⚠️ 未找到 dist 目录，跳过前端静态文件服务');
}

app.get('/api', (req, res) => {
  res.json({
    name: 'Basketball Game API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      stats: '/api/stats',
      players: '/api/players',
      player: '/api/players/:id',
      leaderboard: '/api/leaderboard',
      matches: '/api/matches',
      match: '/api/matches/:id',
      rooms: '/api/rooms',
      room: '/api/rooms/:id',
      equipment: '/api/equipment?playerId=xxx',
      draft: '/api/draft?round=xxx'
    }
  });
});

const getRequiredPlayers = (mode) => {
  switch(mode) {
    case '1v1': return 2;
    case '2v2': return 4;
    case '3v3': return 6;
    default: return 2;
  }
};

const generateRoomId = () => {
  return `room_${roomIdCounter++}_${Date.now()}`;
};

io.on('connection', (socket) => {
  console.log(`✅ Player connected: ${socket.id}`);

  socket.on('player_join', (playerData) => {
    console.log('🔍 player_join called with:', playerData.name);
    
    onlinePlayers.forEach((player, playerId) => {
      if (player.name === playerData.name && playerId !== socket.id) {
        console.log(`🔄 Removing old session for ${playerData.name} (${playerId})`);
        onlinePlayers.delete(playerId);
      }
    });
    
    let dbPlayer = PlayerModel.findByName(playerData.name);
    console.log('📦 Found player in database:', dbPlayer ? dbPlayer.name : 'No player found');
    
    if (!dbPlayer) {
      try {
        PlayerModel.create({
          ...playerData,
          id: socket.id
        });
        dbPlayer = PlayerModel.findById(socket.id);
        console.log(`💾 New player saved to database: ${playerData.name}`);
      } catch (error) {
        console.error('Error saving player:', error);
      }
    } else {
      console.log('🔄 Updating existing player socket ID:', socket.id);
      dbPlayer = PlayerModel.update(dbPlayer.id, { id: socket.id });
    }
    
    const playerInfo = {
      id: socket.id,
      name: playerData.name,
      overall: dbPlayer?.overall || playerData.overall || 70,
      position: dbPlayer?.position || playerData.position || 'PG',
      online: true,
      currentRoom: null,
      wins: dbPlayer?.wins || playerData.wins || 0,
      streak: dbPlayer?.streak || playerData.streak || 0,
      rank: dbPlayer?.rank || playerData.rank || 'bronze'
    };
    
    onlinePlayers.set(socket.id, playerInfo);
    
    if (dbPlayer) {
      console.log('📤 Sending player_data_load to client');
      socket.emit('player_data_load', dbPlayer);
    }
    
    io.emit('player_list', Array.from(onlinePlayers.values()));
    console.log(`👤 ${playerData.name} joined (${socket.id})`);
    console.log(`   Online players count: ${onlinePlayers.size}`);
  });

  socket.on('player_save', (playerData) => {
    try {
      PlayerModel.saveFullPlayer(socket.id, playerData);
      socket.emit('player_save_ack', { success: true });
      console.log(`💾 Player saved: ${playerData.playerName}`);
    } catch (error) {
      console.error('Error saving player:', error);
      socket.emit('player_save_ack', { success: false, error: error.message });
    }
  });

  socket.on('player_train', (trainingType) => {
    try {
      console.log('🏋️ Training request:', trainingType);
      const player = PlayerModel.findById(socket.id);
      console.log('📦 Player found:', player ? player.name : 'Not found');
      
      if (!player) {
        socket.emit('train_result', { success: false, message: 'Player not found' });
        return;
      }

      if (player.status.currentStamina < 20) {
        socket.emit('train_result', { success: false, message: 'Not enough stamina' });
        return;
      }

      const trainingEffects = {
        Offense: ['threePoint', 'inside', 'dribble'],
        Defense: ['defense', 'jump', 'strength'],
        Physical: ['speed', 'strength', 'stamina'],
        Mental: ['pass', 'dribble', 'defense']
      };

      const attrs = trainingEffects[trainingType] || trainingEffects.Offense;
      const randomAttr = attrs[Math.floor(Math.random() * attrs.length)];
      const potentialBonus = Math.floor(player.potential / 50);
      const workEthicBonus = Math.floor(player.hiddenAttributes.workEthic / 25);
      const increase = Math.floor(Math.random() * 2) + 1 + potentialBonus + workEthicBonus;
      
      const maxValue = Math.max(10, Math.floor(player.potential / 5));
      
      player.status.currentStamina -= 20;
      player.exp += 5;
      
      const currentValue = player.attributes[randomAttr] || 10;
      player.attributes[randomAttr] = Math.min(currentValue + increase, maxValue);

      const coreAttrs = ['speed', 'jump', 'strength', 'threePoint', 'inside', 'defense', 'dribble', 'pass', 'stamina'];
      const total = coreAttrs.reduce((sum, attr) => sum + (player.attributes[attr] || 0), 0);
      player.overall = Math.max(0, Math.round(total / 9));

      console.log('💾 Saving player after training');
      PlayerModel.saveFullPlayer(socket.id, player);
      console.log('✅ Player saved');
      
      const attrNames = {
        speed: '速度',
        jump: '弹跳',
        strength: '力量',
        threePoint: '三分',
        inside: '内线',
        defense: '防守',
        dribble: '运球',
        pass: '传球',
        stamina: '体能'
      };
      
      socket.emit('train_result', {
        success: true,
        updatedPlayer: player,
        message: `${attrNames[randomAttr]} +${increase}`
      });
    } catch (error) {
      console.error('Error in training:', error);
      socket.emit('train_result', { success: false, message: error.message });
    }
  });

  socket.on('player_rest', () => {
    try {
      const player = PlayerModel.findById(socket.id);
      if (player) {
        player.status.currentStamina = player.status.maxStamina;
        PlayerModel.saveFullPlayer(socket.id, player);
        socket.emit('rest_result', { success: true, updatedPlayer: player });
      }
    } catch (error) {
      console.error('Error in rest:', error);
      socket.emit('rest_result', { success: false });
    }
  });

  socket.on('create_room', (data) => {
    const { mode, roomName, playerData } = data;
    const roomId = generateRoomId();
    const requiredPlayers = getRequiredPlayers(mode);
    
    const room = {
      id: roomId,
      name: roomName,
      mode,
      requiredPlayers,
      players: [{
        id: socket.id,
        ...playerData,
        team: 'A'
      }],
      status: 'waiting',
      createdAt: Date.now()
    };
    
    try {
      RoomModel.create({
        id: roomId,
        name: roomName,
        mode,
        requiredPlayers,
        status: 'waiting',
        teamAPlayers: room.players.filter(p => p.team === 'A'),
        teamBPlayers: room.players.filter(p => p.team === 'B'),
        createdBy: socket.id
      });
    } catch (error) {
      console.error('Error saving room to database:', error);
    }
    
    rooms.set(roomId, room);
    socket.join(roomId);
    
    io.emit('room_list', Array.from(rooms.values()));
    socket.emit('room_created', room);
    console.log(`${playerData.name} created room ${roomId} (${mode})`);
  });

  socket.on('join_room', (data) => {
    const { roomId, playerData } = data;
    const room = rooms.get(roomId);
    
    if (!room || room.status !== 'waiting') {
      socket.emit('join_room_failed', { reason: '房间不存在或已满' });
      return;
    }
    
    if (room.players.find(p => p.id === socket.id)) {
      socket.emit('join_room_failed', { reason: '您已在房间中' });
      return;
    }
    
    const team = room.players.filter(p => p.team === 'A').length <= room.players.filter(p => p.team === 'B').length ? 'A' : 'B';
    
    const newPlayer = {
      id: socket.id,
      ...playerData,
      team
    };
    
    room.players.push(newPlayer);
    socket.join(roomId);
    
    try {
      RoomModel.addPlayer(roomId, newPlayer, team);
    } catch (error) {
      console.error('Error updating room in database:', error);
    }
    
    if (room.players.length >= room.requiredPlayers) {
      room.status = 'ready';
      io.to(roomId).emit('room_ready', room);
    }
    
    io.emit('room_list', Array.from(rooms.values()));
    io.to(roomId).emit('player_joined', room);
    console.log(`${playerData.name} joined room ${roomId}`);
  });

  socket.on('leave_room', (roomId) => {
    const room = rooms.get(roomId);
    if (room) {
      console.log(`📤 Player ${socket.id} leaving room ${roomId}`);
      
      room.players = room.players.filter(p => p.id !== socket.id);
      
      try {
        RoomModel.removePlayer(roomId, socket.id);
      } catch (error) {
        console.error('Error removing player from room:', error);
      }
      
      if (room.status === 'finished' || room.players.length === 0) {
        console.log(`🗑️ Deleting room ${roomId}`);
        try {
          RoomModel.delete(roomId);
        } catch (error) {
          console.error('Error deleting room:', error);
        }
        rooms.delete(roomId);
      } else {
        room.status = 'waiting';
      }
      
      socket.leave(roomId);
      io.emit('room_list', Array.from(rooms.values()));
      io.to(roomId).emit('player_left', room);
    }
  });

  socket.on('start_game', (roomId) => {
    console.log('收到 start_game 请求, roomId:', roomId);
    const room = rooms.get(roomId);
    
    if (!room) {
      console.log('房间不存在:', roomId);
      return;
    }
    
    if (room.status === 'ready') {
      console.log('开始比赛！房间ID:', roomId, '模式:', room.mode);
      room.status = 'playing';
      io.to(roomId).emit('game_playing', room);
      
      setTimeout(() => {
        const currentRoom = rooms.get(roomId);
        if (!currentRoom || currentRoom.status !== 'playing') {
          return;
        }
        
        const teamAPower = currentRoom.players.filter(p => p.team === 'A').reduce((sum, p) => sum + p.overall, 0);
        const teamBPower = currentRoom.players.filter(p => p.team === 'B').reduce((sum, p) => sum + p.overall, 0);
        
        const teamAWins = currentRoom.players.filter(p => p.team === 'A').reduce((sum, p) => sum + p.wins, 0);
        const teamBWins = currentRoom.players.filter(p => p.team === 'B').reduce((sum, p) => sum + p.wins, 0);
        
        const teamAStreak = currentRoom.players.filter(p => p.team === 'A').reduce((sum, p) => sum + p.streak, 0);
        const teamBStreak = currentRoom.players.filter(p => p.team === 'B').reduce((sum, p) => sum + p.streak, 0);
        
        const aAdvantage = (teamAPower / (teamAPower + teamBPower)) + (teamAWins - teamBWins) * 0.01 + (teamAStreak - teamBStreak) * 0.005;
        const winProbability = Math.min(0.95, Math.max(0.05, aAdvantage));
        
        const teamAWinsGame = Math.random() < winProbability;
        const winningTeam = teamAWinsGame ? 'A' : 'B';
        
        const goldReward = 100 + currentRoom.players.length * 50;
        const expReward = 30 + currentRoom.players.length * 15;
        
        const winningPlayers = currentRoom.players.filter(p => p.team === winningTeam);
        const losingPlayers = currentRoom.players.filter(p => p.team !== winningTeam);
        
        const dropChance = calculateDropChance(winningPlayers);
        const droppedEquipment = Math.random() < dropChance ? generateEquipment() : null;
        
        const teamAPlayers = currentRoom.players.filter(p => p.team === 'A');
        const teamBPlayers = currentRoom.players.filter(p => p.team === 'B');
        
        const teamATotalOverall = teamAPlayers.reduce((sum, p) => sum + p.overall, 0);
        const teamBTotalOverall = teamBPlayers.reduce((sum, p) => sum + p.overall, 0);
        
        const playerStats = currentRoom.players.map(player => {
          const isWinner = player.team === winningTeam;
          const teamOverall = player.team === 'A' ? teamATotalOverall : teamBTotalOverall;
          const playerContribution = player.overall / teamOverall;
          const baseScore = isWinner ? 25 + Math.random() * 20 : 15 + Math.random() * 20;
          const finalPoints = Math.floor(baseScore * (0.8 + playerContribution * 0.4));
          
          const fieldGoalsMade = Math.floor(finalPoints * 0.5 + Math.random() * 3);
          const fieldGoalsAttempted = Math.floor(fieldGoalsMade * (1.5 + Math.random() * 0.5));
          const threePointsMade = Math.floor(finalPoints * 0.15 + Math.random() * 2);
          const threePointsAttempted = Math.floor(threePointsMade * (2 + Math.random() * 0.5));
          const freeThrowsMade = Math.max(0, finalPoints - fieldGoalsMade * 2 - threePointsMade * 3);
          const freeThrowsAttempted = Math.floor(freeThrowsMade * (1.2 + Math.random() * 0.3));
          
          return {
            playerId: player.id,
            playerName: player.name,
            team: player.team,
            isWinner,
            points: finalPoints,
            rebounds: Math.floor(3 + Math.random() * 8 + player.overall * 0.05),
            assists: Math.floor(2 + Math.random() * 6 + player.overall * 0.04),
            steals: Math.floor(Math.random() * 3 + player.overall * 0.02),
            blocks: Math.floor(Math.random() * 2 + player.overall * 0.02),
            turnovers: Math.floor(Math.random() * 4),
            fouls: Math.floor(Math.random() * 3),
            fieldGoalsMade,
            fieldGoalsAttempted,
            threePointsMade,
            threePointsAttempted,
            freeThrowsMade,
            freeThrowsAttempted,
            minutesPlayed: Math.floor(20 + Math.random() * 15)
          };
        });
        
        const teamAScore = teamAPlayers.reduce((sum, player) => {
          const stats = playerStats.find(s => s.playerId === player.id);
          return sum + (stats ? stats.points : 0);
        }, 0);
        
        const teamBScore = teamBPlayers.reduce((sum, player) => {
          const stats = playerStats.find(s => s.playerId === player.id);
          return sum + (stats ? stats.points : 0);
        }, 0);
        
        if (winningTeam === 'A' && teamAScore <= teamBScore) {
          const diff = teamBScore - teamAScore + 5;
          const bonusPerPlayer = Math.ceil(diff / teamAPlayers.length);
          teamAPlayers.forEach(player => {
            const stats = playerStats.find(s => s.playerId === player.id);
            if (stats) {
              stats.points += bonusPerPlayer;
              stats.fieldGoalsMade += Math.floor(bonusPerPlayer * 0.5);
              stats.fieldGoalsAttempted += Math.floor(bonusPerPlayer * 0.7);
            }
          });
        } else if (winningTeam === 'B' && teamBScore <= teamAScore) {
          const diff = teamAScore - teamBScore + 5;
          const bonusPerPlayer = Math.ceil(diff / teamBPlayers.length);
          teamBPlayers.forEach(player => {
            const stats = playerStats.find(s => s.playerId === player.id);
            if (stats) {
              stats.points += bonusPerPlayer;
              stats.fieldGoalsMade += Math.floor(bonusPerPlayer * 0.5);
              stats.fieldGoalsAttempted += Math.floor(bonusPerPlayer * 0.7);
            }
          });
        }
        
        const finalTeamAScore = teamAPlayers.reduce((sum, player) => {
          const stats = playerStats.find(s => s.playerId === player.id);
          return sum + (stats ? stats.points : 0);
        }, 0);
        
        const finalTeamBScore = teamBPlayers.reduce((sum, player) => {
          const stats = playerStats.find(s => s.playerId === player.id);
          return sum + (stats ? stats.points : 0);
        }, 0);
        
        const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        try {
          MatchModel.create({
            id: matchId,
            roomId,
            roomName: currentRoom.name,
            mode: currentRoom.mode,
            teamAScore: finalTeamAScore,
            teamBScore: finalTeamBScore,
            winningTeam,
            teamAPlayers: teamAPlayers.map(p => ({ id: p.id, name: p.name, overall: p.overall })),
            teamBPlayers: teamBPlayers.map(p => ({ id: p.id, name: p.name, overall: p.overall })),
            playerStats,
            duration: 3000
          });
          console.log(`💾 Match saved to database: ${matchId}`);
        } catch (error) {
          console.error('Error saving match:', error);
        }
        
        winningPlayers.forEach(player => {
          try {
            const dbPlayer = PlayerModel.findById(player.id);
            const newStreak = (dbPlayer?.streak || 0) + 1;
            const newRank = calculateRank(newStreak, dbPlayer?.wins || 0);
            
            PlayerModel.updateStats(player.id, 1, 0, newStreak, newRank);
            PlayerModel.addRewards(player.id, goldReward, expReward);
            
            console.log(`💾 Updated stats for winner: ${player.name}`);
          } catch (error) {
            console.error('Error updating winner stats:', error);
          }
        });
        
        losingPlayers.forEach(player => {
          try {
            const dbPlayer = PlayerModel.findById(player.id);
            const newStreak = Math.max(0, (dbPlayer?.streak || 0) - 1);
            const newRank = calculateRank(newStreak, dbPlayer?.wins || 0);
            
            PlayerModel.updateStats(player.id, 0, 1, newStreak, newRank);
            PlayerModel.addRewards(player.id, Math.floor(goldReward / 2), Math.floor(expReward / 2));
            
            console.log(`💾 Updated stats for loser: ${player.name}`);
          } catch (error) {
            console.error('Error updating loser stats:', error);
          }
        });
        
        if (droppedEquipment) {
          const winnerId = winningPlayers[0].id;
          try {
            EquipmentModel.create({
              id: droppedEquipment.id,
              playerId: winnerId,
              name: droppedEquipment.name,
              type: droppedEquipment.type,
              rarity: droppedEquipment.rarity,
              bonus: droppedEquipment.bonus,
              isEquipped: false
            });
            console.log(`💾 Equipment saved: ${droppedEquipment.name}`);
          } catch (error) {
            console.error('Error saving equipment:', error);
          }
        }
        
        const result = {
          roomId,
          matchId,
          winningTeam,
          teamAScore: finalTeamAScore,
          teamBScore: finalTeamBScore,
          winningPlayers: winningPlayers.map(p => p.id),
          losingPlayers: losingPlayers.map(p => p.id),
          goldReward,
          expReward,
          droppedEquipment,
          playerStats,
          roomName: currentRoom.name,
          mode: currentRoom.mode
        };
        
        io.to(roomId).emit('game_result', result);
        console.log(`✅ Game in room ${roomId} finished. Winner: Team ${winningTeam}, Score: ${finalTeamAScore}-${finalTeamBScore}`);
        
        currentRoom.status = 'finished';
        io.emit('room_list', Array.from(rooms.values()));
        
        setTimeout(() => {
          const roomToDelete = rooms.get(roomId);
          if (roomToDelete) {
            console.log(`🗑️ Auto-deleting finished room ${roomId}`);
            try {
              RoomModel.delete(roomId);
            } catch (error) {
              console.error('Error deleting room:', error);
            }
            rooms.delete(roomId);
            io.emit('room_list', Array.from(rooms.values()));
          }
        }, 5000);
      }, 3000);
    }
  });

  socket.on('challenge_request', (data) => {
    const { targetPlayerId, message } = data;
    socket.to(targetPlayerId).emit('challenge_received', {
      from: onlinePlayers.get(socket.id),
      message
    });
  });

  socket.on('add_friend', (data) => {
    const { targetPlayerId } = data;
    const requester = onlinePlayers.get(socket.id);
    const target = onlinePlayers.get(targetPlayerId);
    
    if (requester && target) {
      io.emit('player_list', Array.from(onlinePlayers.values()));
      io.to(socket.id).emit('friend_added', { friend: target });
    }
  });

  socket.on('remove_friend', (data) => {
    const { targetPlayerId } = data;
    const requester = onlinePlayers.get(socket.id);
    
    if (requester) {
      io.emit('player_list', Array.from(onlinePlayers.values()));
      io.to(socket.id).emit('friend_removed', { friendId: targetPlayerId });
    }
  });

  socket.on('challenge_response', (data) => {
    const { targetPlayerId, accepted } = data;
    
    if (accepted) {
      const acceptor = onlinePlayers.get(socket.id);
      const challenger = onlinePlayers.get(targetPlayerId);
      
      if (acceptor && challenger) {
        const result = simulateChallenge(challenger, acceptor);
        
        io.to(targetPlayerId).emit('challenge_result', {
          from: acceptor,
          accepted: true,
          result: {
            ...result,
            yourScore: result.winner === challenger.name ? result.winnerScore : result.loserScore,
            opponentScore: result.winner === challenger.name ? result.loserScore : result.winnerScore,
            yourStats: result.winner === challenger.name ? result.winnerStats : result.loserStats,
            opponentStats: result.winner === challenger.name ? result.loserStats : result.winnerStats
          }
        });
        
        io.to(socket.id).emit('challenge_result', {
          from: challenger,
          accepted: true,
          result: {
            ...result,
            yourScore: result.winner === acceptor.name ? result.winnerScore : result.loserScore,
            opponentScore: result.winner === acceptor.name ? result.loserScore : result.winnerScore,
            yourStats: result.winner === acceptor.name ? result.winnerStats : result.loserStats,
            opponentStats: result.winner === acceptor.name ? result.loserStats : result.winnerStats
          }
        });
        
        if (result.stolenEquipment) {
          io.to(result.winner === challenger.name ? socket.id : targetPlayerId).emit('equipment_stolen', {
            equipment: result.stolenEquipment,
            from: result.winner === challenger.name ? acceptor.name : challenger.name
          });
        }
      }
    } else {
      socket.to(targetPlayerId).emit('challenge_result', {
        from: onlinePlayers.get(socket.id),
        accepted: false
      });
    }
  });

  socket.on('get_rooms', () => {
    socket.emit('room_list', Array.from(rooms.values()));
  });

  socket.on('send_message', (data) => {
    const { roomId, message } = data;
    io.to(roomId).emit('message_received', {
      player: onlinePlayers.get(socket.id),
      message,
      timestamp: Date.now()
    });
  });

  socket.on('draft_apply', async (data) => {
    const { playerName, overall, playerId } = data;
    console.log(`[Round ${globalDraftState.currentRound}] Player ${playerName} (Overall: ${overall}) applied for draft`);
    
    const existingPlayer = globalDraftState.draftPool.find(p => p.playerId === playerId || p.playerName === playerName);
    if (existingPlayer) {
      socket.emit('draft_error', { message: '你已经报名参与了本轮选秀' });
      return;
    }
    
    if (globalDraftState.phase === 'idle' || globalDraftState.phase === 'finished') {
      globalDraftState.currentRound++;
      globalDraftState.phase = 'registration';
      globalDraftState.countdown = DRAFT_CONFIG.registrationDuration / 1000;
      globalDraftState.draftPool = [];
      globalDraftState.targetOverall = null;
      
      console.log(`[Round ${globalDraftState.currentRound}] Registration started`);
      
      if (globalDraftState.draftIntervalId) {
        clearInterval(globalDraftState.draftIntervalId);
      }
      
      globalDraftState.draftIntervalId = setInterval(() => {
        if (globalDraftState.phase !== 'registration') {
          clearInterval(globalDraftState.draftIntervalId);
          return;
        }
        
        if (globalDraftState.countdown <= 1) {
          clearInterval(globalDraftState.draftIntervalId);
          endGlobalRegistration();
        } else {
          globalDraftState.countdown--;
          broadcastDraftStatus();
        }
      }, 1000);
    }
    
    globalDraftState.draftPool.push({
      playerId: playerId || socket.id,
      playerName,
      overall,
      socketId: socket.id,
      isAI: false,
      appliedAt: Date.now()
    });
    
    broadcastDraftStatus();
  });

  socket.on('draft_get_status', () => {
    socket.emit('draft_status_update', {
      phase: globalDraftState.phase,
      countdown: globalDraftState.countdown,
      targetOverall: globalDraftState.targetOverall,
      poolSize: globalDraftState.draftPool.length,
      poolCapacity: DRAFT_CONFIG.poolCapacity,
      currentRound: globalDraftState.currentRound,
      draftPool: globalDraftState.draftPool
    });
  });

  socket.on('disconnect', () => {
    const player = onlinePlayers.get(socket.id);
    if (player) {
      console.log(`❌ ${player.name} disconnected (${socket.id})`);
      
      rooms.forEach((room, roomId) => {
        if (room.players.find(p => p.id === socket.id)) {
          room.players = room.players.filter(p => p.id !== socket.id);
          if (room.players.length === 0) {
            rooms.delete(roomId);
          } else {
            room.status = 'waiting';
          }
          io.emit('room_list', Array.from(rooms.values()));
          io.to(roomId).emit('player_left', room);
        }
      });
    } else {
      console.log(`❌ Anonymous player disconnected (${socket.id})`);
    }
    onlinePlayers.delete(socket.id);
    io.emit('player_list', Array.from(onlinePlayers.values()));
  });
});

function calculateDropChance(players) {
  let baseChance = 0.3;
  
  players.forEach(player => {
    const rankBonus = {
      bronze: 0,
      silver: 0.05,
      gold: 0.1,
      platinum: 0.15,
      diamond: 0.2
    };
    baseChance += rankBonus[player.rank] || 0;
    baseChance += player.streak * 0.02;
  });
  
  return Math.min(0.8, baseChance);
}

function calculateRank(streak, wins) {
  if (wins >= 100 || streak >= 20) return 'diamond';
  if (wins >= 50 || streak >= 10) return 'platinum';
  if (wins >= 20 || streak >= 5) return 'gold';
  if (wins >= 5 || streak >= 3) return 'silver';
  return 'bronze';
}

function simulateChallenge(player1, player2) {
  const player1Power = player1.overall + Math.floor(Math.random() * 10);
  const player2Power = player2.overall + Math.floor(Math.random() * 10);
  
  const player1Score = Math.floor(15 + player1Power * 0.5 + Math.random() * 10);
  const player2Score = Math.floor(15 + player2Power * 0.5 + Math.random() * 10);
  
  const winner = player1Score > player2Score ? player1.name : player2.name;
  const winnerScore = Math.max(player1Score, player2Score);
  const loserScore = Math.min(player1Score, player2Score);
  
  const winnerStats = {
    points: winnerScore,
    rebounds: Math.floor(5 + Math.random() * 8),
    assists: Math.floor(3 + Math.random() * 6),
    steals: Math.floor(Math.random() * 4),
    blocks: Math.floor(Math.random() * 3)
  };
  
  const loserStats = {
    points: loserScore,
    rebounds: Math.floor(3 + Math.random() * 6),
    assists: Math.floor(2 + Math.random() * 4),
    steals: Math.floor(Math.random() * 3),
    blocks: Math.floor(Math.random() * 2)
  };
  
  let stolenEquipment = null;
  if (winnerScore - loserScore >= 10 && Math.random() < 0.2) {
    stolenEquipment = generateEquipment();
  }
  
  return {
    winner,
    winnerScore,
    loserScore,
    winnerStats,
    loserStats,
    stolenEquipment
  };
}

function generateEquipment() {
  const equipmentTypes = ['headband', 'wristband', 'kneepad', 'jersey', 'shoes'];
  const rarities = ['common', 'rare', 'epic', 'legendary'];
  const rarityWeights = [0.5, 0.3, 0.15, 0.05];
  
  let rand = Math.random();
  let rarity = 'common';
  for (let i = 0; i < rarities.length; i++) {
    rand -= rarityWeights[i];
    if (rand <= 0) {
      rarity = rarities[i];
      break;
    }
  }
  
  const type = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];
  
  return {
    id: `drop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: getEquipmentName(type, rarity),
    type,
    rarity,
    bonus: generateBonus(rarity),
    icon: `https://neeko-copilot.bytedance.net/api/text_to_image?prompt=basketball%20${type}%20${rarity}%20equipment&image_size=square`
  };
}

function getEquipmentName(type, rarity) {
  const names = {
    headband: ['基础头带', '运动头带', '能量头带', '传奇头带'],
    wristband: ['棉质护腕', '弹性护腕', '能量护腕', '机械护腕'],
    kneepad: ['基础护膝', '专业护膝', '防护护膝', '强化护膝'],
    jersey: ['训练球衣', '比赛球衣', '星空球衣', '传奇球衣'],
    shoes: ['训练球鞋', '专业球鞋', '弹跳球鞋', '脉冲球鞋']
  };
  
  const rarityIndex = { common: 0, rare: 1, epic: 2, legendary: 3 };
  return names[type][rarityIndex[rarity]] || names[type][0];
}

function generateBonus(rarity) {
  const bonusValues = {
    common: 2,
    rare: 4,
    epic: 7,
    legendary: 12
  };
  
  const attrs = ['speed', 'jump', 'strength', 'threePoint', 'inside', 'defense', 'dribble', 'pass', 'stamina'];
  const value = bonusValues[rarity];
  
  const bonus = {};
  const numBonuses = rarity === 'legendary' ? 2 : 1;
  
  for (let i = 0; i < numBonuses; i++) {
    const attr = attrs[Math.floor(Math.random() * attrs.length)];
    bonus[attr] = value;
  }
  
  return bonus;
}

function broadcastDraftStatus() {
  io.emit('draft_status_update', {
    phase: globalDraftState.phase,
    countdown: globalDraftState.countdown,
    targetOverall: globalDraftState.targetOverall,
    poolSize: globalDraftState.draftPool.length,
    poolCapacity: DRAFT_CONFIG.poolCapacity,
    currentRound: globalDraftState.currentRound,
    draftPool: globalDraftState.draftPool
  });
}

function startGlobalRegistration() {
  globalDraftState.currentRound++;
  globalDraftState.phase = 'registration';
  globalDraftState.countdown = DRAFT_CONFIG.registrationDuration / 1000;
  globalDraftState.draftPool = [];
  globalDraftState.targetOverall = null;
  
  console.log(`[Round ${globalDraftState.currentRound}] Registration started`);
  broadcastDraftStatus();
  
  if (globalDraftState.draftIntervalId) {
    clearInterval(globalDraftState.draftIntervalId);
  }
  
  globalDraftState.draftIntervalId = setInterval(() => {
    if (globalDraftState.phase !== 'registration') {
      clearInterval(globalDraftState.draftIntervalId);
      return;
    }
    
    if (globalDraftState.countdown <= 1) {
      clearInterval(globalDraftState.draftIntervalId);
      endGlobalRegistration();
    } else {
      globalDraftState.countdown--;
      broadcastDraftStatus();
    }
  }, 1000);
}

function endGlobalRegistration() {
  const playerCount = globalDraftState.draftPool.filter(p => !p.isAI).length;
  
  fillAIGlobalPlayers();
  
  globalDraftState.targetOverall = Math.floor(Math.random() * 31) + 50;
  
  globalDraftState.phase = 'drafting';
  globalDraftState.countdown = DRAFT_CONFIG.draftDuration / 1000;
  
  console.log(`[Round ${globalDraftState.currentRound}] Draft started. Target Overall: ${globalDraftState.targetOverall}`);
  broadcastDraftStatus();
  
  io.emit('draft_start_notification', {
    round: globalDraftState.currentRound,
    targetOverall: globalDraftState.targetOverall,
    draftPool: globalDraftState.draftPool,
    playerCount,
    aiCount: globalDraftState.draftPool.length - playerCount,
    countdown: globalDraftState.countdown,
    message: '报名已结束，选秀即将开始！'
  });
  
  if (globalDraftState.draftIntervalId) {
    clearInterval(globalDraftState.draftIntervalId);
  }
  
  globalDraftState.draftIntervalId = setInterval(() => {
    if (globalDraftState.phase !== 'drafting') {
      clearInterval(globalDraftState.draftIntervalId);
      return;
    }
    
    if (globalDraftState.countdown <= 1) {
      clearInterval(globalDraftState.draftIntervalId);
      executeGlobalDraft();
    } else {
      globalDraftState.countdown--;
      broadcastDraftStatus();
    }
  }, 1000);
}

function fillAIGlobalPlayers() {
  const playerCount = globalDraftState.draftPool.filter(p => !p.isAI).length;
  const aiCount = DRAFT_CONFIG.poolCapacity - playerCount;
  
  for (let i = 1; i <= aiCount; i++) {
    const overall = Math.floor(Math.random() * 31) + 50;
    globalDraftState.draftPool.push({
      playerId: `ai_${i}_${Date.now()}`,
      playerName: `AI球员${i}`,
      overall,
      isAI: true,
      appliedAt: Date.now()
    });
  }
}

function executeGlobalDraft() {
  const playerEntries = globalDraftState.draftPool.filter(e => !e.isAI);
  const targetOverall = globalDraftState.targetOverall;
  
  console.log(`[Round ${globalDraftState.currentRound}] Executing draft with target: ${targetOverall}`);
  
  const sortedPlayers = playerEntries.map(entry => ({
    ...entry,
    diff: Math.abs(entry.overall - targetOverall)
  })).sort((a, b) => a.diff - b.diff);
  
  const results = sortedPlayers.map((entry, index) => {
    const isTop10 = index < 10;
    return {
      ...entry,
      result: isTop10 ? 'selected' : 'rejected',
      draftPick: isTop10 ? index + 1 : null,
      pickRank: isTop10 ? index + 1 : null,
      targetOverall
    };
  });
  
  results.forEach(result => {
    try {
      DraftModel.createRecord({
        round: globalDraftState.currentRound,
        playerId: result.playerId,
        playerName: result.playerName,
        playerOverall: result.overall,
        targetOverall: result.targetOverall,
        draftPick: result.draftPick,
        result: result.result,
        isAI: result.isAI
      });
    } catch (error) {
      console.error('Error saving draft record:', error);
    }
  });
  
  const numberOnePick = results.find(r => r.draftPick === 1);
  
  io.emit('draft_results', {
    round: globalDraftState.currentRound,
    targetOverall,
    results,
    numberOnePick: numberOnePick ? {
      playerName: numberOnePick.playerName,
      overall: numberOnePick.overall,
      diff: numberOnePick.diff
    } : null,
    timestamp: Date.now()
  });
  
  globalDraftState.phase = 'finished';
  globalDraftState.countdown = 0;
  broadcastDraftStatus();
  
  setTimeout(() => {
    if (globalDraftState.phase === 'finished') {
      globalDraftState.phase = 'idle';
      globalDraftState.draftPool = [];
      globalDraftState.targetOverall = null;
      broadcastDraftStatus();
      console.log(`[Round ${globalDraftState.currentRound}] Draft finished, ready for next round`);
    }
  }, 5000);
}

const PORT = process.env.PORT || 3001;

function startServer() {
  try {
    loadDatabase();
    console.log('✅ Database initialized');
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 WebSocket ready`);
      console.log(`🌐 API available at http://localhost:${PORT}/api`);
      console.log(`💾 Database path: data/basketball.json`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

process.on('SIGTERM', () => {
  console.log('SIGTERM received, saving database...');
  saveDatabase();
  process.exit(0);
});
