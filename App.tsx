
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer
} from 'recharts';
import { GoogleGenAI } from "@google/genai"; // GoogleGenAI import 추가
import { SURVEY_QUESTIONS, POWER_BASES } from './constants';
import { ScoreState, PowerCategory } from './types';

// Custom tick component for PolarAngleAxis to highlight top/bottom categories
interface CustomPolarAngleAxisTickProps {
  x?: number;
  y?: number;
  payload?: {
    value: string; // This will be the 'subject' from chartData
    offset: number;
    coordinate: number;
    // ... other props
  };
  top3Categories: string[];
  bottom3Categories: string[];
}

const CustomPolarAngleAxisTick: React.FC<CustomPolarAngleAxisTickProps> = ({
  x,
  y,
  payload,
  top3Categories,
  bottom3Categories,
}) => {
  if (!payload) return null;

  const subject = payload.value;
  const isTop = top3Categories.includes(subject);
  const isBottom = bottom3Categories.includes(subject);

  let fillColor = '#475569'; // default slate-700
  let fontWeight = 700;
  let fontSize = 13;

  if (isTop) {
    fillColor = '#4f46e5'; // indigo-600
    fontWeight = 900; // Extra bold
    fontSize = 14;
  } else if (isBottom) {
    fillColor = '#ef4444'; // red-500
    fontWeight = 600; // Semi-bold
    fontSize = 12;
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={4}
        textAnchor="middle"
        fill={fillColor}
        fontWeight={fontWeight}
        fontSize={fontSize}
      >
        {subject}
      </text>
    </g>
  );
};


const App: React.FC = () => {
  const [step, setStep] = useState<'intro' | 'survey' | 'result'>('intro');
  const [scores, setScores] = useState<ScoreState>(() => {
    const initial: ScoreState = {};
    SURVEY_QUESTIONS.forEach((q) => {
      initial[q.id] = { scoreA: 1, scoreB: 2 }; 
    });
    return initial;
  });

  const [aiReport, setAiReport] = useState<string>(''); // AI 리포트 상태 추가
  const [isAnalyzing, setIsAnalyzing] = useState(false); // AI 분석 중 상태 추가

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

  // 상위/하위 3개 카테고리 계산 (레이더 차트 라벨 강조용)
  const sortedChartData = useMemo(() => {
    return [...chartData].sort((a, b) => b.value - a.value);
  }, [chartData]);

  const top3Categories = useMemo(() => {
    return sortedChartData.slice(0, 3).map(item => item.subject);
  }, [sortedChartData]);

  const bottom3Categories = useMemo(() => {
    const effectiveBottomStart = Math.max(0, sortedChartData.length - 3);
    return sortedChartData.slice(effectiveBottomStart).map(item => item.subject);
  }, [sortedChartData]);


  // AI 리포트 생성 함수 재추가
  const generateAIReport = async () => {
    setIsAnalyzing(true);
    setAiReport('');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const scoreSummary = Object.entries(categoryTotals)
        .map(([cat, score]) => `${POWER_BASES[cat].name}: ${score}점`)
        .join(', ');

      const prompt = `
        당신은 리더의 강점과 약점을 파악하여 실용적인 개발 전략을 제시하는 '리더십 실천 가이드'입니다. 
        사용자의 리더십 파워 진단 결과는 다음과 같습니다: [ ${scoreSummary} ]
        
        위 데이터를 바탕으로 다음 3가지 핵심 내용을 A4 1장 분량으로 간결하게 작성해주세요:
        
        1.  **강점 파악 및 활용**: 가장 높은 점수를 얻은 파워 유형은 무엇이며, 업무 현장에서 이를 어떻게 효과적으로 무기로 활용할 수 있을까요? 구체적인 팁을 포함해주세요.
        2.  **약점 분석 및 보완**: 상대적으로 낮은 점수를 기록한 파워 유형은 무엇이며, 이것이 리더십에 미칠 수 있는 잠재적 위험은 무엇인가요? 이를 상쇄하거나 보완하기 위한 실용적인 전략을 제시해주세요.
        3.  **실전 개발 로드맵**: 영향력을 더욱 증진시키기 위해 당장 내일부터 시작할 수 있는 구체적인 행동 지침 3가지를 단계별로 제시해주세요.
        
        서술형보다는 핵심 요약 중심(Bullet points 또는 짧은 문단)으로, 전문적이면서도 명쾌하고 실천 의지를 고취시키는 어조로 작성해주세요. Markdown 형식을 사용하여 제목, 리스트, 강조 등을 적절히 활용하여 가독성을 극대화하세요.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          maxOutputTokens: 1200, // A4 1장 분량 조절
          thinkingConfig: { thinkingBudget: 100 }, // 적절한 Thinking Budget 설정
          temperature: 0.7, // 창의성 조절
        }
      });

      setAiReport(response.text || '분석 결과를 생성할 수 없습니다.');
    } catch (error) {
      console.error("AI Analysis Error:", error);
      setAiReport('현재 AI 분석 서비스가 일시적으로 지연되고 있습니다. 결과 상단의 점수와 차트를 중심으로 자신의 리더십 스타일을 먼저 확인해 주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // AI 리포트 생성 트리거 useEffect 재추가
  useEffect(() => {
    if (step === 'result') {
      generateAIReport();
    }
  }, [step]);


  const handleScoreChange = (id: number, valA: number) => {
    setScores(prev => ({
      ...prev,
      [id]: {
        scoreA: valA,
        scoreB: 3 - valA
      }
    }));
  };

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl max-w-2xl w-full text-center">
          <div className="mb-6 inline-block p-4 bg-indigo-100 rounded-full">
            <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Leadership Power Profile</h1>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            나의 영향력은 어디에서 나오는가?<br/>
            French & Raven의 이론을 바탕으로 당신이 주로 사용하는<br/>
            <strong>7가지 파워 원천</strong>을 진단하고, <strong>AI 맞춤 개발 전략</strong>을 받아보세요.
          </p>
          <div className="bg-slate-50 p-6 rounded-2xl text-left mb-8 border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"/></svg>
              진단 방법
            </h3>
            <ul className="text-slate-600 space-y-2 text-sm">
              <li>• 총 21개 문항에서 두 가지 항목 중 본인에게 가까운 정도를 선택합니다.</li>
              <li>• 모든 문항에 응답하면 당신의 영향력 지도가 생성됩니다.</li>
              <li>• 결과를 통해 자신의 리더십 강점과 보완점을 확인하고, AI 개발 전략을 받아보세요.</li>
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
          <div className="sticky top-4 z-20 bg-white/90 backdrop-blur shadow-lg p-5 rounded-2xl mb-8 flex justify-between items-center border border-slate-200 border-t-4 border-t-indigo-500">
            <div>
              <h2 className="font-bold text-slate-800 text-xl">진단 진행 중</h2>
              <div className="w-48 bg-slate-100 h-2 mt-2 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all" style={{ width: `${(Object.keys(scores).length / SURVEY_QUESTIONS.length) * 100}%` }}></div>
              </div>
            </div>
            <button 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setStep('result');
              }}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-indigo-200 shadow-lg transition-all"
            >
              결과 보기
            </button>
          </div>

          <div className="space-y-6">
            {SURVEY_QUESTIONS.map((q, idx) => (
              <div key={q.id} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-indigo-300 transition-all group">
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </span>
                  <div className="h-px flex-grow bg-slate-100"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <button 
                    className={`p-5 rounded-2xl text-left transition-all duration-300 ${scores[q.id].scoreA > 1.5 ? 'bg-indigo-50 ring-2 ring-indigo-500' : 'bg-slate-50 hover:bg-slate-100'}`}
                    onClick={() => handleScoreChange(q.id, 3)}
                  >
                    <p className="text-slate-800 font-medium leading-relaxed mb-3 text-sm md:text-base">{q.textA}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider">{POWER_BASES[q.catA].name.split(' ')[0]}</span>
                      <span className="text-indigo-600 font-black">{scores[q.id].scoreA}점</span>
                    </div>
                  </button>

                  <button 
                    className={`p-5 rounded-2xl text-left transition-all duration-300 ${scores[q.id].scoreB > 1.5 ? 'bg-pink-50 ring-2 ring-pink-500' : 'bg-slate-50 hover:bg-slate-100'}`}
                    onClick={() => handleScoreChange(q.id, 0)}
                  >
                    <p className="text-slate-800 font-medium leading-relaxed mb-3 text-sm md:text-base">{q.textB}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider">{POWER_BASES[q.catB].name.split(' ')[0]}</span>
                      <span className="text-pink-600 font-black">{scores[q.id].scoreB}점</span>
                    </div>
                  </button>
                </div>

                <div className="mt-6 px-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="3" 
                    step="1" 
                    value={scores[q.id].scoreA}
                    onChange={(e) => handleScoreChange(q.id, parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                    <span>A 강함</span>
                    <span>중간</span>
                    <span>B 강함</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 mb-20 text-center">
            <button 
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setStep('result');
              }}
              className="px-12 py-5 bg-indigo-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:bg-indigo-700 transition-all transform hover:scale-105"
            >
              진단 완료 및 결과 보기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Main Result Card */}
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-2">리더십 파워 프로필 결과</h2>
            <p className="text-slate-500 font-medium">당신이 조직 내에서 주로 행사하는 영향력의 지도입니다.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
            <div className="h-[350px] bg-slate-50 rounded-3xl p-4 border border-slate-100">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={<CustomPolarAngleAxisTick top3Categories={top3Categories} bottom3Categories={bottom3Categories} />}
                  />
                  <PolarRadiusAxis domain={[0, 21]} tick={false} axisLine={false} /> {/* Domain adjusted to max possible score */}
                  <Radar
                    name="Power"
                    dataKey="value"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    fill="#6366f1"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-indigo-600 rounded-2xl text-white shadow-lg">
                <span className="text-[10px] font-bold uppercase opacity-70 tracking-widest">나의 핵심 파워</span>
                <h3 className="text-2xl font-black mt-1">{topPower.fullLabel}</h3>
                <p className="text-sm mt-2 opacity-90 leading-relaxed">{POWER_BASES[topPower.category].description}</p>
              </div>
              
              <div className="space-y-2">
                {chartData.sort((a,b) => b.value - a.value).map((item) => (
                  <div key={item.category} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: item.color }}>
                      {item.category}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-700">{item.subject}</span>
                        <span className="text-xs font-black text-slate-900">{item.value}점</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full transition-all duration-700" style={{ width: `${(item.value / 21) * 100}%`, backgroundColor: item.color }}></div> {/* Changed divisor to 21 */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-12">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              영향력의 7가지 원천 상세 설명
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(POWER_BASES).map((base) => (
                <div key={base.category} className="p-4 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 transition-colors group">
                  <div className="font-bold text-slate-800 mb-1 flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: base.color }}></span>
                    {base.name}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{base.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Coaching Report Section 재추가 */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-indigo-100 overflow-hidden print-break">
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">AI 핵심 개발 전략 리포트</h3>
                  <p className="text-slate-500 font-medium">강점과 약점을 기반으로 한 실용적 요약 가이드입니다.</p>
                </div>
              </div>
              <button 
                onClick={generateAIReport}
                disabled={isAnalyzing}
                className="no-print px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <svg className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                재분석
              </button>
            </div>

            {isAnalyzing ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-800 mb-2">실무 전략을 도출하고 있습니다...</h4>
                  <p className="text-slate-500 max-w-sm mx-auto">간결하고 명확한 개발 전략을 구성하는 중입니다.</p>
                </div>
              </div>
            ) : aiReport ? (
              <div className="bg-slate-50 p-6 md:p-10 rounded-[2rem] border border-slate-100 prose prose-slate max-w-none prose-sm md:prose-base">
                {aiReport.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) return <h2 key={i} className="text-xl font-black text-indigo-700 mt-6 mb-4">{line.replace('# ', '')}</h2>;
                  if (line.startsWith('## ')) return <h3 key={i} className="text-lg font-bold text-slate-800 mt-6 mb-3 border-l-4 border-indigo-400 pl-3">{line.replace('## ', '')}</h3>;
                  if (line.startsWith('### ')) return <h4 key={i} className="text-md font-bold text-slate-700 mt-4 mb-2">{line.replace('### ', '')}</h4>;
                  if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 mb-1 text-slate-600">{line.replace(/^[-*]\s/, '')}</li>;
                  if (line.trim() === '') return <div key={i} className="h-2" />;
                  return <p key={i} className="text-slate-600 leading-relaxed mb-2">{line}</p>;
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 border-2 border-dashed rounded-3xl">
                분석 데이터를 가져오지 못했습니다.
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col md:flex-row gap-4 justify-center pb-20 no-print">
          <button 
            onClick={() => { setStep('intro'); setAiReport(''); }}
            className="px-8 py-4 bg-white text-slate-600 font-bold rounded-2xl hover:bg-slate-50 border border-slate-200 transition-all shadow-sm"
          >
            다시 진단하기
          </button>
          <button 
            onClick={() => window.print()}
            className="px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            전략 리포트 저장 / 인쇄
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
