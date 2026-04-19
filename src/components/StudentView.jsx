import React, { useState, useEffect } from 'react';
import { db, auth, loginAnonymously } from '../firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { ALGORITHM_KEYWORDS, findMatchedKeyword } from '../constants/gameData';
import { UserCircle, Send, PlusCircle, CheckCircle2, Award, Clock } from 'lucide-react';

const IMPORTANT_TIERS = [1, 2];
const IMPORTANT_TIER_META = {
  1: {
    title: '第一梯隊',
    subtitle: '決定生死的核心數據',
    cardClass: 'border-red-200 bg-red-50/70',
    chipClass: 'bg-white border border-red-200 text-red-700',
  },
  2: {
    title: '第二梯隊',
    subtitle: 'AI 與搜尋引擎看懂你的關鍵',
    cardClass: 'border-amber-200 bg-amber-50/70',
    chipClass: 'bg-white border border-amber-200 text-amber-700',
  },
};

export default function StudentView() {
  const [user, setUser] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [gameStatus, setGameStatus] = useState('waiting');
  
  // Playing state
  const [answers, setAnswers] = useState(['']);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Results state
  const [myResult, setMyResult] = useState(null);
  const importantKeywords = ALGORITHM_KEYWORDS.filter((keyword) => IMPORTANT_TIERS.includes(keyword.tier));
  const missedImportantKeywords = myResult
    ? IMPORTANT_TIERS.map((tier) => {
        const hitIds = new Set((myResult.hits || []).map((hit) => hit.keywordId));

        return {
          tier,
          keywords: importantKeywords.filter(
            (keyword) => keyword.tier === tier && !hitIds.has(keyword.id)
          ),
        };
      })
    : [];

  useEffect(() => {
    // Listen to global game status
    const unsub = onSnapshot(doc(db, 'gameStatus', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGameStatus(data.status);
        
        if (data.status === 'playing' && data.endTime) {
          setTimeLeft(Math.max(0, Math.floor((data.endTime - Date.now()) / 1000)));
          const interval = setInterval(() => {
            const left = Math.max(0, Math.floor((data.endTime - Date.now()) / 1000));
            setTimeLeft(left);
            if (left === 0) {
              clearInterval(interval);
            }
          }, 1000);
          return () => clearInterval(interval);
        } else if (data.status === 'waiting') {
           // Reset for new game
           setAnswers(['']);
           setSubmitted(false);
           setMyResult(null);
        } else if (data.status === 'results' && user) {
           // Fetch my results
           getDoc(doc(db, 'students', user.uid)).then(docSnap => {
             if(docSnap.exists()) {
               setMyResult(docSnap.data());
             }
           });
        }
      }
    });

    // Handle auto-submit if time runs out while not submitted
    if (gameStatus === 'results' && user && !submitted && answers.some(a => a.trim() !== '')) {
      handleSubmit(); // Attempt to submit whatever is there
    }

    return () => unsub();
  }, [gameStatus, user, submitted]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!studentName.trim()) return;
    try {
      const loggedInUser = await loginAnonymously();
      setUser(loggedInUser);
    } catch (err) {
      alert("登入失敗，請稍後重試！");
    }
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    
    // Auto-add new empty input if the last one was filled
    if (index === newAnswers.length - 1 && value.trim() !== '') {
      newAnswers.push('');
    }
    setAnswers(newAnswers);
  };

  const calculateScore = (submittedAnswers) => {
    let score = 0;
    const hits = [];
    const usedIds = new Set(); // Prevent duplicate points

    submittedAnswers.forEach(ans => {
      if(!ans.trim()) return;
      
      const match = findMatchedKeyword(ans);
      if (match && !usedIds.has(match.id)) {
        usedIds.add(match.id);
        const points = match.tier === 1 ? 30 : match.tier === 2 ? 20 : 10;
        score += points;
        hits.push({
          rawInput: ans,
          originalName: match.name,
          keywordId: match.id,
          tier: match.tier,
          points
        });
      }
    });

    // Keep invalid attempts too
    const invalidHits = submittedAnswers
      .filter(ans => ans.trim() && !findMatchedKeyword(ans))
      .map(ans => ({
        rawInput: ans,
        originalName: null,
        points: 0
      }));

    return { score, allHits: [...hits, ...invalidHits], validHits: hits };
  };

  const handleSubmit = async () => {
    if (!user || submitted) return;
    setSubmitted(true);
    
    const { score, validHits, allHits } = calculateScore(answers);
    
    await setDoc(doc(db, 'students', user.uid), {
      name: studentName,
      score,
      hits: validHits,
      allAttempts: allHits,
      timestamp: Date.now()
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md transform transition-all">
          <div className="text-center mb-8">
            <div className="inline-block p-4 rounded-full bg-blue-50 mb-4">
              <UserCircle size={48} className="text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-800">流量密碼</h1>
            <p className="text-gray-500 mt-2">演算法猜心遊戲</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">你的姓名 / 學號</label>
              <input 
                type="text" 
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-blue-200 outline-none transition text-lg"
                placeholder="例如：王大明"
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              進入遊戲
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-md overflow-hidden flex flex-col min-h-[80vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-blue-500 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-sm opacity-80 uppercase tracking-wider font-semibold">Player</h2>
            <p className="text-2xl font-bold">{studentName}</p>
          </div>
          {gameStatus === 'playing' && (
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <Clock size={20} className={timeLeft <= 10 ? 'animate-ping text-red-200' : ''} />
              <span className={`font-mono text-2xl font-bold ${timeLeft <= 10 ? 'text-red-100' : ''}`}>
                {timeLeft}s
              </span>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-10 flex-1 flex flex-col justify-center">
          
          {/* Waiting */}
          {gameStatus === 'waiting' && (
             <div className="text-center animation-fade-in py-12">
               <div className="w-24 h-24 mx-auto border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-8"></div>
               <h3 className="text-2xl font-bold text-gray-800 mb-2">等待老師開始...</h3>
               <p className="text-gray-500">準備好你的大腦，回想課堂重點！</p>
             </div>
          )}

          {/* Playing */}
          {gameStatus === 'playing' && !submitted && (
            <div className="animation-fade-in flex-1 flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">寫下你認為演算法看重的關鍵字：</h3>
                <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  💡 只要意思相近系統就會自動判定！想到什麼就寫什麼。
                </p>
              </div>
              
              <div className="flex-1 space-y-4 max-h-[50vh] overflow-y-auto p-1 pb-10">
                {answers.map((ans, idx) => (
                  <div key={idx} className="flex items-center gap-3 relative group">
                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <input
                      type="text"
                      className="flex-1 bg-white border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 outline-none transition text-lg shadow-sm"
                      placeholder="輸入關鍵字..."
                      value={ans}
                      onChange={(e) => handleAnswerChange(idx, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-4 border-t border-gray-100">
                <button 
                  onClick={handleSubmit} 
                  disabled={answers.filter(a => a.trim()).length === 0}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                >
                  <Send size={20} /> 送出答案
                </button>
              </div>
            </div>
          )}

          {/* Submitted waiting for results */}
          {gameStatus === 'playing' && submitted && (
            <div className="text-center animation-fade-in py-12">
               <CheckCircle2 size={72} className="mx-auto text-green-500 mb-6" />
               <h3 className="text-3xl font-bold text-gray-800 mb-4">答案已送出！</h3>
               <p className="text-gray-500 text-lg">等待老師結算成績...</p>
            </div>
          )}

          {/* Results */}
          {gameStatus === 'results' && myResult && (
            <div className="animation-fade-in">
              <div className="text-center mb-10">
                <div className="inline-block p-4 rounded-full bg-yellow-50 mb-4 border-4 border-yellow-100">
                  <Award size={56} className="text-yellow-500" />
                </div>
                <h3 className="text-xl text-gray-500 font-semibold mb-1">你的總分</h3>
                <div className="text-6xl font-black text-gray-800 tracking-tighter">
                  {myResult.score} <span className="text-2xl text-gray-400 font-medium tracking-normal">狂分</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-inner">
                <h4 className="font-bold text-gray-700 mb-4 px-2">你的答題紀錄：</h4>
                <ul className="space-y-3">
                  {myResult.allAttempts.map((attempt, idx) => (
                    <li key={idx} className={`p-4 rounded-xl flex items-center justify-between ${attempt.originalName ? 'bg-white border-l-4 border-green-500 shadow-sm' : 'bg-gray-100 opacity-60'}`}>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800 text-lg">
                          {attempt.rawInput}
                        </span>
                        {attempt.originalName && (
                          <span className="text-sm text-green-600 font-semibold flex items-center gap-1 mt-1">
                            ↳ 命中標準：<span className="bg-green-100 px-2 py-0.5 rounded mr-1">{attempt.originalName}</span> (Tier {attempt.tier})
                          </span>
                        )}
                      </div>
                      {attempt.points > 0 ? (
                        <div className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                          +{attempt.points}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-sm font-medium">無效</div>
                      )}
                    </li>
                  ))}
                  {myResult.allAttempts.length === 0 && (
                    <li className="text-center text-gray-400 py-4">未作答任何內容😓</li>
                  )}
                </ul>
              </div>

              <div className="mt-6 bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <h4 className="font-bold text-gray-800 mb-2">你漏掉的重要關鍵字</h4>
                <p className="text-sm text-gray-500 mb-5">以下先聚焦在 Tier 1 和 Tier 2，方便你回頭檢查哪些高優先觀念還沒想到。</p>

                <div className="space-y-4">
                  {missedImportantKeywords.map((group) => {
                    const meta = IMPORTANT_TIER_META[group.tier];

                    return (
                      <div key={group.tier} className={`rounded-2xl border p-4 ${meta.cardClass}`}>
                        <div className="mb-3">
                          <div className="font-bold text-gray-800">{meta.title}</div>
                          <div className="text-sm text-gray-600">{meta.subtitle}</div>
                        </div>

                        {group.keywords.length === 0 ? (
                          <div className="rounded-xl bg-white/80 px-4 py-3 text-sm text-green-700">
                            這一梯隊你都有提到了，很不錯。
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {group.keywords.map((keyword) => (
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
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
