import React, { useState } from 'react';
import TeacherView from './components/TeacherView';
import StudentView from './components/StudentView';
import { Presentation, Smartphone } from 'lucide-react';

function App() {
  const [role, setRole] = useState(null); // 'teacher' | 'student' | null

  if (role === 'teacher') {
    return <TeacherView />;
  }

  if (role === 'student') {
    return <StudentView />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mb-4">
          流量密碼
        </h1>
        <p className="text-xl text-gray-500 font-medium mb-12">演算法猜心遊戲</p>
        
        <div className="grid gap-6">
          <button 
            onClick={() => setRole('teacher')}
            className="flex flex-col items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-primary hover:bg-blue-50 text-gray-800 p-8 rounded-2xl transition group"
          >
            <Presentation size={48} className="text-gray-400 group-hover:text-primary transition" />
            <span className="text-xl font-bold">建立遊戲 (Teacher)</span>
            <span className="text-sm text-gray-400 font-medium">適合在大螢幕/投影機上呈現</span>
          </button>

          <button 
            onClick={() => setRole('student')}
            className="flex flex-col items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-accent hover:bg-amber-50 text-gray-800 p-8 rounded-2xl transition group"
          >
            <Smartphone size={48} className="text-gray-400 group-hover:text-accent transition" />
            <span className="text-xl font-bold">加入遊戲 (Student)</span>
            <span className="text-sm text-gray-400 font-medium">學生用手機或電腦進入答題</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
