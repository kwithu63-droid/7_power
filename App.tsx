
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell 
} from 'recharts';
import { SURVEY_QUESTIONS, POWER_BASES } from './constants';
import { ScoreState, PowerCategory } from './types';

const App: React.FC = () => {
  const [step, setStep] = useState<'intro' | 'survey' | 'result'>('intro');
  const [scores, setScores] = useState<ScoreState>(() => {
    const initial: ScoreState = {};
    SURVEY_QUESTIONS.forEach((q) => {
      initial[q.id] = { scoreA: 1, scoreB: 2 }; // Default balanced
    });
    return initial;
  });

  const totalPossible = SURVEY_QUESTIONS.length * 3; // 63

  const handleScoreChange = (id: number, valA: number) => {
    setScores(prev => ({
      ...prev,
      [id]: {
        scoreA: valA,
        scoreB: 3 - valA
      }
    }));
  };

  const categoryTotals = useMemo(() => {
    const totals: Record<PowerCategory, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0 };
    SURVEY_QUESTIONS.forEach(q => {
      totals[q.catA] += scores[q.id].scoreA;
      totals[q.catB] += scores[q.id].scoreB;
    });
    return totals;
  }, [scores]);

  const chartData = useMemo(() => {
    return Object.entries(categoryTotals).map(([cat, score]) => ({
      subject: POWER_BASES[cat].name.split(' (')[0],
      fullLabel: POWER_BASES[cat].name,
      value: score,
      color: POWER_BASES[cat].color,
      category: cat
    }));
  }, [categoryTotals]);

  const topPower = useMemo(() => {
    return [...chartData].sort((a, b) => b.value - a.value)[0];
  }, [chartData]);

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl max-w-2xl w-full text-center">
          <div className="mb-6 inline-block p-4 bg-indigo-100 rounded-full">
            <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">나의 POWER는?</h1>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            후배들이 나의 요구를 따르는 진실된 이유는 무엇일까요?<br/>
            21개의 문항을 통해 당신의 <span className="font-bold text-indigo-600">리더십 파워 기반</span>을 진단해보세요.
          </p>
          <div className="bg-slate-50 p-6 rounded-2xl text-left mb-8 border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-2">💡 참여 방법</h3>
            <ul className="text-slate-600 space-y-2 text-sm">
              <li>• 총 21개 쌍의 문항이 제시됩니다.</li>
              <li>• 각 쌍에 대해 총 <strong>3점</strong>을 배분합니다 (예: 1점:2점).</li>
              <li>• 솔직하게 답변할수록 정확한 결과가 나옵니다.</li>
            </ul>
          </div>
          <button 
            onClick={() => setStep('survey')}
            className="w-full py-4 px-8 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all transform hover:scale-[1.02] active:scale-95"
          >
            진단 시작하기
          </button>
        </div>
      </div>
    );
  }

  if (step === 'survey') {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="sticky top-4 z-10 bg-white/80 backdrop-blur shadow-sm p-4 rounded-2xl mb-8 flex justify-between items-center border border-slate-200">
            <div>
              <h2 className="font-bold text-slate-800 text-xl">파워 기반 진단 중</h2>
              <p className="text-xs text-slate-500">각 질문의 합계는 3점이어야 합니다.</p>
            </div>
            <button 
              onClick={() => setStep('result')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 shadow-md"
            >
              결과 보기
            </button>
          </div>

          <div className="space-y-6">
            {SURVEY_QUESTIONS.map((q, idx) => (
              <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </span>
                  <div className="h-px flex-grow bg-slate-100"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <div className={`p-4 rounded-xl transition-all ${scores[q.id].scoreA > 1.5 ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'bg-slate-50'}`}>
                    <p className="text-slate-800 text-sm mb-3 leading-snug">{q.textA}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-indigo-500">파워 A ({q.catA})</span>
                      <span className="text-xl font-bold text-indigo-600">{scores[q.id].scoreA}점</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl transition-all ${scores[q.id].scoreB > 1.5 ? 'bg-pink-50 ring-1 ring-pink-200' : 'bg-slate-50'}`}>
                    <p className="text-slate-800 text-sm mb-3 leading-snug">{q.textB}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-pink-500">파워 B ({q.catB})</span>
                      <span className="text-xl font-bold text-pink-600">{scores[q.id].scoreB}점</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 px-4">
                  <input 
                    type="range" 
                    min="0" 
                    max="3" 
                    step="1" 
                    value={scores[q.id].scoreA}
                    onChange={(e) => handleScoreChange(q.id, parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 px-1 uppercase tracking-tighter">
                    <span>A가 훨씬 높음</span>
                    <span>중간</span>
                    <span>B가 훨씬 높음</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 mb-20">
            <button 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setStep('result');
              }}
              className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-[1.01]"
            >
              모든 진단 완료 및 결과 확인
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">리더십 파워 프로필</h2>
            <p className="text-slate-500">당신의 영향력은 어디에서 나오는지 확인해보세요.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                  <Radar
                    name="Power Score"
                    dataKey="value"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                <h4 className="text-indigo-900 font-bold mb-1">당신의 주된 파워 소스</h4>
                <div className="text-4xl font-black text-indigo-600 mb-2">{topPower.fullLabel}</div>
                <p className="text-sm text-indigo-700 leading-relaxed">
                  {POWER_BASES[topPower.category].description}
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {chartData.sort((a,b) => b.value - a.value).map((item) => (
                  <div key={item.category} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: item.color }}>
                      {item.category}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-semibold text-slate-700">{item.subject}</span>
                        <span className="text-sm font-bold text-slate-900">{item.value} / 20</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-1000" 
                          style={{ width: `${(item.value / 20) * 100}%`, backgroundColor: item.color }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              권력 기반 가이드 (French & Raven)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(POWER_BASES).map((base) => (
                <div key={base.category} className="p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="font-bold text-slate-800 mb-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: base.color }}></span>
                    {base.name}
                  </div>
                  <p className="text-xs text-slate-500 leading-normal">{base.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex gap-4">
            <button 
              onClick={() => {
                setScores(Object.fromEntries(SURVEY_QUESTIONS.map(q => [q.id, { scoreA: 1, scoreB: 2 }])));
                setStep('intro');
              }}
              className="flex-grow py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
            >
              다시 진단하기
            </button>
            <button 
              onClick={() => window.print()}
              className="px-8 py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all"
            >
              PDF로 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
