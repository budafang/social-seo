import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc, collection, query, getDocs, deleteDoc } from 'firebase/firestore';
import { ALGORITHM_KEYWORDS } from '../constants/gameData';
import { Play, Square, Users, Trophy, AlertTriangle } from 'lucide-react';

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
    
    // Track stats
    const guessedKeywordsCount = {}; // keyword id -> count
    
    snapshot.forEach(doc => {
      const data = doc.data();
      students.push({ id: doc.id, ...data });
      
      // tally hits safely
      if (data.hits && Array.isArray(data.hits)) {
        data.hits.forEach(hit => {
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
      const kw = ALGORITHM_KEYWORDS.find(k => k.id === id);
      return { name: kw ? kw.name : 'Unknown', count: guessedKeywordsCount[id] };
    });

    // 3. Student Leaderboard
    const sortedStudents = [...students].sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 5);

    setResultsData({
      blindSpots,
      topGuessed,
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
                    <span className="font-bold text-gray-700 text-lg">{idx + 1}. {item.name}</span>
                    <span className="text-amber-600 font-bold bg-amber-100 px-3 py-1 rounded-lg">{item.count} 次</span>
                  </li>
                ))}
              </ul>
            )}
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
