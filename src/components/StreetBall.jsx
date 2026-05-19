import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export default function StreetBall() {
  const currentPlayer = useGameStore(state => state.currentPlayer);
  const aiTeams = useGameStore(state => state.aiTeams);
  const friends = useGameStore(state => state.friends);
  const generateAITeams = useGameStore(state => state.generateAITeams);
  const challengeAITeam = useGameStore(state => state.challengeAITeam);
  const inviteFriendToChallenge = useGameStore(state => state.inviteFriendToChallenge);
  const showMessagePopup = useGameStore(state => state.showMessagePopup);
  const setCurrentScreen = useGameStore(state => state.setCurrentScreen);

  useEffect(() => {
    generateAITeams();
  }, []);

  const handleChallenge = (teamId) => {
    const result = challengeAITeam(teamId);
    showMessagePopup(result.message);
    if (result.success) {
      generateAITeams();
    }
  };

  const handleInviteFriend = (teamId) => {
    const onlineFriends = friends.filter(f => f.online);
    if (onlineFriends.length === 0) {
      showMessagePopup('没有在线好友！');
      return;
    }

    const friend = onlineFriends[0];
    const result = inviteFriendToChallenge(teamId, friend.id);
    showMessagePopup(result.message);
    if (result.success) {
      generateAITeams();
    }
  };

  const activeTeams = aiTeams.filter(t => !t.defeated);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">🏀 街头篮球</h1>
            <p className="text-gray-400">挑战AI球队，赢取奖励</p>
          </div>
          <button onClick={() => setCurrentScreen('Main')} className="btn-secondary btn-sm">
            返回
          </button>
        </div>

        <div className="card mb-6">
          <div className="flex flex-wrap gap-4 text-center">
            <div className="flex-1">
              <div className="text-green-400 font-bold">{currentPlayer?.status.currentStamina}/{currentPlayer?.status.maxStamina}</div>
              <div className="text-xs text-gray-400">体力</div>
            </div>
            <div className="flex-1">
              <div className="text-yellow-400 font-bold">{currentPlayer?.status.streetGamesToday}/10</div>
              <div className="text-xs text-gray-400">今日场次</div>
            </div>
            <div className="flex-1">
              <div className="text-blue-400 font-bold">{currentPlayer?.economy.gold}</div>
              <div className="text-xs text-gray-400">金币</div>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-bold mb-4">AI球队列表</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeTeams.map(team => (
            <div key={team.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{team.emblem}</span>
                  <div>
                    <div className="font-bold">{team.name}</div>
                    <div className="text-sm text-gray-400">总评: {team.overall}</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleChallenge(team.id)} className="btn-primary flex-1 text-sm">
                  ⚔️ 挑战
                </button>
                <button onClick={() => handleInviteFriend(team.id)} className="btn-secondary flex-1 text-sm">
                  🤝 组队
                </button>
              </div>
            </div>
          ))}
        </div>

        {activeTeams.length === 0 && (
          <div className="card text-center py-8">
            <div className="text-4xl mb-4">🎉</div>
            <div className="text-xl font-bold">所有AI球队已被击败！</div>
            <div className="text-gray-400 mt-2">等待新的挑战出现...</div>
          </div>
        )}
      </div>
    </div>
  );
}
