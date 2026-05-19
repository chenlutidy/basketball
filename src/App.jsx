import { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { WebSocketProvider } from './contexts/WebSocketContext';
import StartScreen from './components/StartScreen';
import MainMenu from './components/MainMenu';
import StreetBall from './components/StreetBall';
import Training from './components/Training';
import Talents from './components/Talents';
import Equipment from './components/Equipment';
import Draft from './components/Draft';
import DraftLive from './components/DraftLive';
import Staff from './components/Staff';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import MatchHistory from './components/MatchHistory';
import OnlinePlayers from './components/OnlinePlayers';
import RoomList from './components/RoomList';
import MessageModal from './components/MessageModal';

function GameContent() {
  const currentScreen = useGameStore(state => state.currentScreen);
  const currentPlayer = useGameStore(state => state.currentPlayer);
  const initializeGame = useGameStore(state => state.initializeGame);
  const loadGame = useGameStore(state => state.loadGame);
  const startAutoSave = useGameStore(state => state.startAutoSave);

  useEffect(() => {
    initializeGame();
    loadGame();
    startAutoSave();
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Start':
        return <StartScreen />;
      case 'Main':
        return <MainMenu />;
      case 'StreetBall':
        return <StreetBall />;
      case 'RoomList':
        return <RoomList />;
      case 'OnlinePlayers':
        return <OnlinePlayers />;
      case 'Training':
        return <Training />;
      case 'Talents':
        return <Talents />;
      case 'Equipment':
        return <Equipment />;
      case 'Draft':
        return <Draft />;
      case 'DraftLive':
        return <DraftLive />;
      case 'Staff':
        return <Staff />;
      case 'Leaderboard':
        return <Leaderboard />;
      case 'Profile':
        return <Profile />;
      case 'MatchHistory':
        return <MatchHistory />;
      default:
        return <StartScreen />;
    }
  };

  const getPlayerData = () => {
    if (!currentPlayer) return null;
    return {
      name: currentPlayer.playerName,
      overall: currentPlayer.overall,
      position: currentPlayer.positionAbbr,
      wins: currentPlayer.statistics.streetWins,
      streak: 0,
      rank: calculateRank(currentPlayer.statistics.streetWins)
    };
  };

  const calculateRank = (wins) => {
    if (wins >= 100) return 'diamond';
    if (wins >= 50) return 'platinum';
    if (wins >= 25) return 'gold';
    if (wins >= 10) return 'silver';
    return 'bronze';
  };

  return (
    <WebSocketProvider initialPlayerData={getPlayerData()}>
      <div className="min-h-screen">
        {renderScreen()}
        <MessageModal />
      </div>
    </WebSocketProvider>
  );
}

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return <GameContent />;
}
