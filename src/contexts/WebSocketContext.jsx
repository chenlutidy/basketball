import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';
import getConfig from '../config';

// 使用配置文件中的域名
const config = getConfig();
const SOCKET_URL = config.socketUrl;

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children, initialPlayerData = null }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [onlinePlayers, setOnlinePlayers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [pendingChallenges, setPendingChallenges] = useState([]);
  const [gameResult, setGameResult] = useState(null);
  const [challengeResult, setChallengeResult] = useState(null);
  const [friends, setFriends] = useState([]);
  
  // 使用 ref 存储 initialPlayerData，避免 useEffect 重复执行
  const initialDataRef = useRef(null);
  const hasJoinedRef = useRef(false);

  // 更新 ref 的值
  useEffect(() => {
    if (initialPlayerData) {
      initialDataRef.current = initialPlayerData;
    }
  }, [initialPlayerData]);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setIsConnected(true);
      newSocket.emit('get_rooms');
      
      // 每次连接成功都发送 player_join（包括重连情况）
      if (initialDataRef.current) {
        console.log('Emitting player_join with:', initialDataRef.current.playerName);
        newSocket.emit('player_join', initialDataRef.current);
        setIsJoined(true);
        
        // 保存 socket ID 到 currentPlayer
        useGameStore.setState(state => ({
          currentPlayer: state.currentPlayer ? {
            ...state.currentPlayer,
            socketId: newSocket.id
          } : null
        }));
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
      setIsJoined(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('⚠️ Socket connection error:', error.message);
      setIsConnected(false);
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
      console.log('收到 room_ready 事件:', room);
      setCurrentRoom(room);
    });

    newSocket.on('game_playing', (room) => {
      setCurrentRoom(room);
    });

    newSocket.on('player_joined', (room) => {
      console.log('收到 player_joined 事件:', room);
      setCurrentRoom(room);
    });

    newSocket.on('player_left', (room) => {
      setCurrentRoom(room);
      setRooms(prev => prev.map(r => r.id === room.id ? room : r));
    });

    newSocket.on('game_result', (result) => {
      console.log('📥 收到 game_result 事件（原始数据）:');
      console.log('   完整对象:', result);
      console.log('   teamAScore:', result.teamAScore);
      console.log('   teamBScore:', result.teamBScore);
      console.log('   playerStats:', result.playerStats);
      console.log('   roomName:', result.roomName);
      console.log('   winningTeam:', result.winningTeam);
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
      
      if (data.accepted && data.result) {
        setChallengeResult(data);
      }
    });

    newSocket.on('equipment_stolen', (data) => {
      console.log('Stolen equipment:', data);
    });

    newSocket.on('friend_added', (data) => {
      setFriends(prev => {
        if (!prev.find(f => f.id === data.friend.id)) {
          return [...prev, data.friend];
        }
        return prev;
      });
    });

    newSocket.on('friend_removed', (data) => {
      setFriends(prev => prev.filter(f => f.id !== data.friendId));
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []); // 移除 initialPlayerData 依赖，只执行一次

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
      console.log('Sending challenge to:', targetPlayerId);
      socket.emit('challenge_request', { targetPlayerId, message });
    } else {
      console.log('Socket not connected, cannot send challenge');
    }
  }, [socket]);

  const addFriend = useCallback((targetPlayerId) => {
    if (socket) {
      console.log('Adding friend:', targetPlayerId);
      socket.emit('add_friend', { targetPlayerId });
    } else {
      console.log('Socket not connected, cannot add friend');
    }
  }, [socket]);

  const removeFriend = useCallback((targetPlayerId) => {
    if (socket) {
      socket.emit('remove_friend', { targetPlayerId });
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

  const clearChallengeResult = useCallback(() => {
    setChallengeResult(null);
  }, []);

  const value = {
    socket,
    isConnected,
    isJoined,
    onlinePlayers,
    rooms,
    currentRoom,
    pendingChallenges,
    gameResult,
    challengeResult,
    friends,
    joinServer,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    getRooms,
    sendChallenge,
    addFriend,
    removeFriend,
    acceptChallenge,
    rejectChallenge,
    clearGameResult,
    clearChallengeResult
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
