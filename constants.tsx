
import { QuestionPair, PowerBaseInfo } from './types';

export const POWER_BASES: Record<string, PowerBaseInfo> = {
  A: { category: 'A', name: '강압적 권력 (Coercive)', description: '제재, 징벌, 불이익을 줄 수 있는 권한에 기반합니다.', color: '#EF4444' },
  B: { category: 'B', name: '연계적 권력 (Connection)', description: '조직 내 실력자들과의 긴밀한 관계나 인맥에 기반합니다.', color: '#F59E0B' },
  C: { category: 'C', name: '전문적 권력 (Expert)', description: '나의 지식, 능력, 경험 및 정확한 판단력에 기반합니다.', color: '#10B981' },
  D: { category: 'D', name: '정보적 권력 (Information)', description: '가치 있는 정보나 데이터의 소유 및 통로 확보에 기반합니다.', color: '#3B82F6' },
  E: { category: 'E', name: '합법적 권력 (Legitimate)', description: '조직에서 부여한 공식적인 직위와 권한에 기반합니다.', color: '#8B5CF6' },
  F: { category: 'F', name: '준거적 권력 (Referent)', description: '후배들의 개인적 호의와 나를 닮고 싶어하는 마음(롤모델)에 기반합니다.', color: '#EC4899' },
  G: { category: 'G', name: '보상적 권력 (Reward)', description: '보수를 주거나 칭찬, 지지 등 혜택을 줄 수 있는 권한에 기반합니다.', color: '#06B6D4' }
};

export const SURVEY_QUESTIONS: QuestionPair[] = [
  { id: 1, catA: 'A', textA: '나에게 협력하지 않는 사람들에게 제재나 징벌을 행사할 수 있다.', catB: 'B', textB: '내가 영향력 있는 실력자들과 연줄이 있음을 후배들이 알고 있다.' },
  { id: 2, catA: 'C', textA: '나의 지식, 능력, 판단력 등을 인정받고 경의를 받고 있다.', catB: 'D', textB: '후배들에게 가치 있는 정보나 데이터를 제공할 수 있는 위치에 있다.' },
  { id: 3, catA: 'E', textA: '조직상 나의 직위가 후배들을 지휘 명령할 권한을 부여했다.', catB: 'F', textB: '후배들이 나에게 개인적 호의를 갖고 있어 내 뜻에 맞게 행동한다.' },
  { id: 4, catA: 'G', textA: '협력하는 사람들에게 보수를 주거나 지지해 줄 수 있다.', catB: 'A', textB: '협력하지 않는 사람들에게 불이익을 줄 수 있는 권한이 있다.' },
  { id: 5, catA: 'B', textA: '실력자들과의 관계가 돈독하여 그들로부터 지원을 받을 수 있다.', catB: 'C', textB: '나의 뛰어난 전문 지식과 경험을 후배들이 신뢰한다.' },
  { id: 6, catA: 'D', textA: '필요한 정보를 손에 넣는 통로를 정확히 알고 있다.', catB: 'E', textB: '상사로서 합법적으로 업무를 지시할 자격이 있다.' },
  { id: 7, catA: 'F', textA: '후배들이 나를 인간적으로 좋아하고 따르고 싶어한다.', catB: 'G', textB: '후배들이 원하는 보상이나 혜택을 제공할 수 있다.' },
  { id: 8, catA: 'B', textA: '높은 분들과 친분이 두터워 영향력을 행사할 수 있다.', catB: 'F', textB: '후배들이 나를 역할 모델로 삼고 나처럼 되기를 원한다.' },
  { id: 9, catA: 'C', textA: '내 분야에서 누구보다 앞선 전문성을 갖추고 있다.', catB: 'A', textB: '지시를 어길 경우 인사상의 조치를 취할 수 있다.' },
  { id: 10, catA: 'D', textA: '업무에 꼭 필요한 핵심 데이터를 독점적으로 알고 있다.', catB: 'E', textB: '직위 자체만으로도 후배들이 지시를 따를 의무를 느낀다.' },
  { id: 11, catA: 'A', textA: '벌칙이나 경고를 통해 후배들을 통제할 수 있다.', catB: 'B', textB: '중요한 인맥을 통해 후배들의 문제를 해결해 줄 수 있다.' },
  { id: 12, catA: 'E', textA: '공식적인 명령 체계상 내가 결정권을 가지고 있다.', catB: 'B', textB: '상위 리더들과 대화가 잘 통하며 영향력을 공유한다.' },
  { id: 13, catA: 'F', textA: '나의 인격과 인간미에 매료되어 후배들이 협조한다.', catB: 'C', textB: '해결하기 어려운 문제에 대해 명쾌한 해답을 줄 수 있다.' },
  { id: 14, catA: 'G', textA: '인센티브나 칭찬 등 긍정적 보상을 줄 수 있다.', catB: 'B', textB: '배후에 든든한 조력자들이 있음을 은연중에 보여준다.' },
  { id: 15, catA: 'A', textA: '엄격한 규율과 통제를 통해 후배들이 따르게 한다.', catB: 'E', textB: '회사가 나에게 부여한 정당한 관리 권한이 있다.' },
  { id: 16, catA: 'B', textA: '네트워크 파워를 통해 필요한 자원을 끌어올 수 있다.', catB: 'F', textB: '후배들과 정서적 유대감이 깊고 친밀한 관계를 맺고 있다.' },
  { id: 17, catA: 'C', textA: '전문가로서의 카리스마와 실력을 갖추고 있다.', catB: 'G', textB: '성과를 낸 후배에게 유무형의 확실한 보상을 제공한다.' },
  { id: 18, catA: 'D', textA: '업무 흐름에 결정적인 정보를 가장 먼저 파악한다.', catB: 'F', textB: '후배들이 나를 존경하며 나의 가치관을 공유하고자 한다.' },
  { id: 19, catA: 'E', textA: '직무 기술서상 명시된 나의 권한을 행사한다.', catB: 'G', textB: '후배들이 성취감을 느낄 수 있는 기회를 배분해준다.' },
  { id: 20, catA: 'F', textA: '나와 함께 일하는 것을 후배들이 즐겁게 생각한다.', catB: 'A', textB: '나의 비협조는 후배들에게 큰 압박과 두려움이 된다.' },
  { id: 21, catA: 'G', textA: '승진이나 평가 등 실질적인 보상 권한을 가졌다.', catB: 'D', textB: '조직 내 돌아가는 사정을 꿰뚫는 정보력을 가졌다.' }
];
