import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import getConfig from '../config';

export function useWebSocket(playerData = null) {
  // 线上部署 - 使用 Railway
  const SOCKET_URL = 'https://playgames.up.railway.app';
  
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [onlinePlayers, setOnlinePlayers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [pendingChallenges, setPendingChallenges] = useState([]);
  const [gameResult, setGameResult] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      newSocket.emit('get_rooms');
      
      if (playerData) {
        newSocket.emit('player_join', playerData);
        setIsJoined(true);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      setIsJoined(false);
    });

    newSocket.on('player_list', (players) => {
      setOnlinePlayers(players);
    });

    newSocket.on('room_list', (roomList) => {
      setRooms(roomList);
    });

    newSocket.on('room_created', (room) => {
      setCurrentRoom(room);
    });

    newSocket.on('room_ready', (room) => {
      setCurrentRoom(room);
    });

    newSocket.on('player_joined', (room) => {
      setCurrentRoom(room);
    });

    newSocket.on('player_left', (room) => {
      setCurrentRoom(room);
      setRooms(prev => prev.map(r => r.id === room.id ? room : r));
    });

    newSocket.on('game_result', (result) => {
      setGameResult(result);
    });

    newSocket.on('join_room_failed', (data) => {
      console.log('Join room failed:', data.reason);
    });

    newSocket.on('challenge_received', (data) => {
      setPendingChallenges(prev => [...prev, data]);
    });

    newSocket.on('challenge_result', (data) => {
      setPendingChallenges(prev => prev.filter(
        challenge => challenge.from.id !== data.from.id
      ));
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [playerData]);

  const joinServer = useCallback((data) => {
    if (socket) {
      socket.emit('player_join', data);
      setIsJoined(true);
    }
  }, [socket]);

  const createRoom = useCallback((mode, roomName, playerData) => {
    if (socket) {
      socket.emit('create_room', { mode, roomName, playerData });
    }
  }, [socket]);

  const joinRoom = useCallback((roomId, playerData) => {
    if (socket) {
      socket.emit('join_room', { roomId, playerData });
    }
  }, [socket]);

  const leaveRoom = useCallback((roomId) => {
    if (socket) {
      socket.emit('leave_room', roomId);
      setCurrentRoom(null);
    }
  }, [socket]);

  const startGame = useCallback((roomId) => {
    if (socket) {
      socket.emit('start_game', roomId);
    }
  }, [socket]);

  const getRooms = useCallback(() => {
    if (socket) {
      socket.emit('get_rooms');
    }
  }, [socket]);

  const sendChallenge = useCallback((targetPlayerId, message = '') => {
    if (socket) {
      socket.emit('challenge_request', { targetPlayerId, message });
    }
  }, [socket]);

  const respondToChallenge = useCallback((targetPlayerId, accepted) => {
    if (socket) {
      socket.emit('challenge_response', { targetPlayerId, accepted });
    }
  }, [socket]);

  const acceptChallenge = useCallback((challenge) => {
    respondToChallenge(challenge.from.id, true);
    return true;
  }, [respondToChallenge]);

  const rejectChallenge = useCallback((challenge) => {
    respondToChallenge(challenge.from.id, false);
    setPendingChallenges(prev => prev.filter(
      c => c.from.id !== challenge.from.id
    ));
  }, [respondToChallenge]);

  const clearGameResult = useCallback(() => {
    setGameResult(null);
  }, []);

  return {
    socket,
    isConnected,
    isJoined,
    onlinePlayers,
    rooms,
    currentRoom,
    pendingChallenges,
    gameResult,
    joinServer,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    getRooms,
    sendChallenge,
    acceptChallenge,
    rejectChallenge,
    clearGameResult
  };
}
