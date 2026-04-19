import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc, collection, query, getDocs, deleteDoc } from 'firebase/firestore';
import { ALGORITHM_KEYWORDS } from '../constants/gameData';
import { Play, Square, Users, Trophy, AlertTriangle } from 'lucide-react';

const TIER_META = {
  1: {
    title: '第一梯隊',
    subtitle: '決定生死的核心數據',
    badgeClass: 'bg-red-100 text-red-700',
    cardClass: 'border-red-200 bg-red-50/70',
    chipClass: 'bg-white text-red-700 border border-red-200',
  },
  2: {
    title: '第二梯隊',
    subtitle: '讓 AI 與搜尋引擎看懂你的關鍵',
    badgeClass: 'bg-amber-100 text-amber-700',
    cardClass: 'border-amber-200 bg-amber-50/70',
    chipClass: 'bg-white text-amber-700 border border-amber-200',
  },
  3: {
    title: '第三梯隊',
    subtitle: '把帳號養大的長期指標',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    cardClass: 'border-emerald-200 bg-emerald-50/70',
    chipClass: 'bg-white text-emerald-700 border border-emerald-200',
  },
  4: {
    title: '第四梯隊',
    subtitle: '系統加分的技術細節',
    badgeClass: 'bg-sky-100 text-sky-700',
    cardClass: 'border-sky-200 bg-sky-50/70',
    chipClass: 'bg-white text-sky-700 border border-sky-200',
  },
};

export default function TeacherView() {
  const [gameStatus, setGameStatus] = useState('waiting'); // waiting, playing, results
  const [timeLeft, setTimeLeft] = useState(0);
  const [resultsData, setResultsData] = useState(null);

  // Sync game status with Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'gameStatus', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGameStatus(data.status);
        if (data.status === 'playing' && data.endTime) {
          // Update time left every second
          const interval = setInterval(() => {
            const now = Date.now();
            const left = Math.max(0, Math.floor((data.endTime - now) / 1000));
            setTimeLeft(left);
            if (left === 0) {
              clearInterval(interval);
              endGame();
            }
          }, 1000);
          return () => clearInterval(interval);
        } else if (data.status === 'results') {
          calculateResults();
        }
      }
    });
    return () => unsub();
  }, []);

  const startGame = async () => {
    // Clear out previous students data
    const q = query(collection(db, 'students'));
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'students', d.id)));
    await Promise.all(deletePromises);

    await setDoc(doc(db, 'gameStatus', 'global'), {
      status: 'playing',
      endTime: Date.now() + 90 * 1000
    });
  };

  const endGame = async () => {
    await setDoc(doc(db, 'gameStatus', 'global'), {
      status: 'results',
      endTime: 0
    });
  };

  const resetGame = async () => {
    await setDoc(doc(db, 'gameStatus', 'global'), {
      status: 'waiting',
      endTime: 0
    });
    setResultsData(null);
  };

  const calculateResults = async () => {
    const q = query(collection(db, 'students'));
    const snapshot = await getDocs(q);
    const students = [];
    const keywordMap = new Map(ALGORITHM_KEYWORDS.map((keyword) => [keyword.id, keyword]));
    
    // Track stats
    const guessedKeywordsCount = {}; // keyword id -> count
    
    snapshot.forEach(doc => {
      const data = doc.data();
      students.push({ id: doc.id, ...data });
      
      // tally hits safely
      if (data.hits && Array.isArray(data.hits)) {
        data.hits.forEach(hit => {
          if (!hit.keywordId || !keywordMap.has(hit.keywordId)) {
            return;
          }

          guessedKeywordsCount[hit.keywordId] = (guessedKeywordsCount[hit.keywordId] || 0) + 1;
        });
      }
    });

    // 1. Blind Spots (Tier 1/2 not guessed by anyone)
    const blindSpots = ALGORITHM_KEYWORDS.filter(kw => 
      (kw.tier === 1 || kw.tier === 2) && !guessedKeywordsCount[kw.id]
    );

    // 2. Most Guessed
    const mostGuessedIds = Object.keys(guessedKeywordsCount).sort((a, b) => guessedKeywordsCount[b] - guessedKeywordsCount[a]);
    const topGuessed = mostGuessedIds.slice(0, 3).map(id => {
      const keyword = keywordMap.get(id);
      return {
        name: keyword.name,
        count: guessedKeywordsCount[id],
        tier: keyword.tier,
      };
    });

    // 3. Student Leaderboard
    const sortedStudents = [...students].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 5);

    // 4. Tier gap breakdown
    const missedByTier = [1, 2, 3, 4].map((tier) => {
      const keywords = ALGORITHM_KEYWORDS
        .filter((keyword) => keyword.tier === tier && !guessedKeywordsCount[keyword.id]);

      return {
        tier,
        total: ALGORITHM_KEYWORDS.filter((keyword) => keyword.tier === tier).length,
        missed: keywords,
      };
    });

    setResultsData({
      blindSpots,
      topGuessed,
      missedByTier,
      leaderboard: sortedStudents,
      totalStudents: students.length
    });
  };

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          👨‍🏫 老師控制台
        </h1>
        <div className="flex gap-4">
           {gameStatus !== 'playing' && (
            <button onClick={startGame} className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-lg transition transform hover:scale-105">
              <Play size={20} /> 開始遊戲
            </button>
           )}
           {gameStatus === 'playing' && (
            <button onClick={endGame} className="flex items-center gap-2 bg-destructive hover:bg-red-600 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-lg transition transform hover:scale-105">
              <Square size={20} /> 強制結束 ({timeLeft}s)
            </button>
           )}
           {gameStatus === 'results' && (
            <button onClick={resetGame} className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-full text-lg font-semibold shadow transition">
              重新一局
            </button>
           )}
        </div>
      </div>

      {/* Waiting State */}
      {gameStatus === 'waiting' && (
        <div className="flex-1 flex flex-col items-center justify-center w-full">
           <div className="bg-white p-12 rounded-3xl shadow-xl text-center border-t-4 border-primary">
             <Users size={64} className="mx-auto text-primary mb-6 animate-bounce" />
             <h2 className="text-4xl font-bold text-gray-800 mb-4">等待學生加入中...</h2>
             <p className="text-gray-500 text-xl">請大家前往 Student View 填寫姓名並等待！</p>
           </div>
        </div>
      )}

      {/* Playing State */}
      {gameStatus === 'playing' && (
        <div className="flex-1 flex flex-col items-center justify-center w-full">
           <div className="text-[10rem] font-bold text-primary tabular-nums animate-pulse drop-shadow-lg">
             {timeLeft}
           </div>
           <p className="text-2xl text-gray-600 mt-4 font-medium">請學生們盡速送出答案！</p>
        </div>
      )}

      {/* Results State */}
      {gameStatus === 'results' && resultsData && (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 animation-fade-in">
          
          {/* 盲點分析 */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border-l-4 border-destructive hover:shadow-2xl transition">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-6">
              <AlertTriangle className="text-destructive" size={28} /> 全班盲點分析
            </h3>
            {resultsData.blindSpots.length === 0 ? (
              <p className="text-green-600 font-medium text-lg bg-green-50 p-4 rounded-xl text-center">太棒了！核心關鍵字全部被猜中！</p>
            ) : (
              <ul className="space-y-3">
                {resultsData.blindSpots.map(bs => (
                  <li key={bs.id} className="bg-red-50 text-red-700 px-5 py-4 rounded-xl font-medium flex justify-between items-center shadow-sm">
                    {bs.name}
                    <span className="text-xs bg-red-200 px-2 py-1 rounded-full">Tier {bs.tier}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 最多猜中 */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border-l-4 border-accent hover:shadow-2xl transition">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-6">
              <Trophy className="text-accent" size={28} /> 最常猜中排行
            </h3>
            {resultsData.topGuessed.length === 0 ? (
              <p className="text-gray-500">都沒有人猜中任何關鍵字...</p>
            ) : (
              <ul className="space-y-4">
                {resultsData.topGuessed.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center px-4 py-3 bg-amber-50 rounded-xl">
                    <span className="font-bold text-gray-700 text-lg">
                      {idx + 1}. {item.name}
                      {item.tier && (
                        <span className="ml-2 text-sm font-medium text-amber-700">Tier {item.tier}</span>
                      )}
                    </span>
                    <span className="text-amber-600 font-bold bg-amber-100 px-3 py-1 rounded-lg">{item.count} 次</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 梯隊缺漏分布 */}
          <div className="bg-white rounded-3xl p-8 shadow-xl md:col-span-2 border-t-4 border-slate-300">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">各梯隊漏掉的重點</h3>
            <p className="text-gray-500 mb-6">這裡列的是全班還沒提到的關鍵字，老師可以直接拿來補充和回顧。</p>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {resultsData.missedByTier.map((group) => {
                const meta = TIER_META[group.tier];
                return (
                  <div key={group.tier} className={`rounded-2xl border p-5 ${meta.cardClass}`}>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="text-lg font-bold text-gray-800">{meta.title}</div>
                        <div className="text-sm text-gray-600">{meta.subtitle}</div>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${meta.badgeClass}`}>
                        {group.missed.length}/{group.total} 未提到
                      </span>
                    </div>

                    {group.missed.length === 0 ? (
                      <div className="rounded-xl bg-white/80 px-4 py-3 text-sm text-green-700">
                        這一梯隊的重點全都有學生提到，掌握得很完整。
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {group.missed.map((keyword) => (
                          <div key={keyword.id} className={`rounded-full px-3 py-2 text-sm font-medium ${meta.chipClass}`}>
                            {keyword.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 學生排行榜 */}
          <div className="bg-white rounded-3xl p-8 shadow-xl md:col-span-2 border-t-4 border-primary">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-6">
              <Users className="text-primary" size={28} /> 學生神預測排行榜
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                    <th className="pb-4 pl-4 font-semibold">排名</th>
                    <th className="pb-4 font-semibold">姓名</th>
                    <th className="pb-4 font-semibold">總得分</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-lg">
                  {resultsData.leaderboard.length === 0 ? (
                    <tr><td colSpan="3" className="py-8 text-center text-gray-400">目前尚無作答紀錄</td></tr>
                  ) : (
                    resultsData.leaderboard.map((student, idx) => (
                      <tr key={student.id} className="hover:bg-blue-50 transition">
                        <td className="py-4 pl-4">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${idx === 0 ? 'bg-yellow-400 text-white text-xl shadow-lg' : idx === 1 ? 'bg-gray-300 text-white' : idx === 2 ? 'bg-amber-700 text-white' : 'text-gray-400'}`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-4 font-medium text-gray-800 text-xl">{student.name}</td>
                        <td className="py-4 font-bold text-primary text-2xl">{student.score} 分</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
