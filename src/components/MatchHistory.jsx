import { useGameStore } from '../store/gameStore';

export default function MatchHistory() {
  const matchHistory = useGameStore(state => state.matchHistory);
  const setCurrentScreen = useGameStore(state => state.setCurrentScreen);

  // 获取比赛类型标签
  const getMatchTypeBadge = (type) => {
    switch(type) {
      case 'street_ai':
        return { label: '街头', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: '🏀' };
      case 'challenge':
        return { label: '挑战', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: '⚔️' };
      case 'team_challenge':
        return { label: '组队', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '👥' };
      case 'custom_room':
        return { label: '自建房间', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: '🏠' };
      default:
        return { label: '未知', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', icon: '❓' };
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">📝 比赛记录</h1>
            <p className="text-gray-400">查看历史战绩</p>
          </div>
          <button onClick={() => setCurrentScreen('Main')} className="btn-secondary btn-sm">
            返回
          </button>
        </div>

        {matchHistory.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🏀</div>
            <div className="text-xl font-bold">暂无比赛记录</div>
            <div className="text-gray-400 mt-2">去街头篮球挑战AI球队吧！</div>
          </div>
        ) : (
          <div className="space-y-4">
            {matchHistory.map(match => {
              const typeBadge = getMatchTypeBadge(match.type);
              return (
                <div
                  key={match.id}
                  className={`card ${match.result === '胜利' ? 'border-green-500/30' : 'border-red-500/30'}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold ${
                        match.result === '胜利' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {match.result === '胜利' ? '🎉' : '😢'}
                      </div>
                      <div>
                        <div className="font-bold">{match.opponent}</div>
                        <div className="text-sm text-gray-400">
                          {match.date}
                          {match.teamAScore !== undefined && (
                            <span className="ml-2 font-bold text-white">
                              | 比分: {match.myTeam === 'A' ? match.teamAScore : match.teamBScore} - {match.myTeam === 'A' ? match.teamBScore : match.teamAScore}
                            </span>
                          )}
                          {match.opponentOverall !== '-' && ` | 对手总评: ${match.opponentOverall}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* 类型标签 */}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${typeBadge.color}`}>
                        {typeBadge.icon} {typeBadge.label}
                      </span>
                      <div className={`font-bold text-lg ${
                        match.result === '胜利' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {match.result}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-4 pt-4 border-t border-white/10">
                    <div className="text-center">
                      <div className="font-bold">{match.points}</div>
                      <div className="text-xs text-gray-400">得分</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">{match.rebounds}</div>
                      <div className="text-xs text-gray-400">篮板</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">{match.assists}</div>
                      <div className="text-xs text-gray-400">助攻</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">{match.steals}</div>
                      <div className="text-xs text-gray-400">抢断</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">{match.blocks}</div>
                      <div className="text-xs text-gray-400">盖帽</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">{match.isMVP ? '🏆' : '-'}</div>
                      <div className="text-xs text-gray-400">MVP</div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-4 pt-4 border-t border-white/10">
                    <div className="text-yellow-400">💰 +{match.goldGain}</div>
                    <div className="text-blue-400">📈 +{match.expGain}</div>
                    <div className="text-purple-400">💫 +{match.fameGain}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
