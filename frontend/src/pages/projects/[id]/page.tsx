
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockProjects } from '../../../mocks/users';
import Button from '../../../components/base/Button';
import Modal from '../../../components/base/Modal';

interface ProjectDetailProps {
  userType?: 'client' | 'freelancer';
}

export default function ProjectDetail({ userType = 'freelancer' }: ProjectDetailProps) {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'info' | 'applicants' | 'proposed' | 'myApplication'>('info');
  
  const project = mockProjects.find(p => p.id === Number(id));
  
  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">프로젝트를 찾을 수 없습니다</h2>
          <Link to="/projects">
            <Button>프로젝트 목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isMyProject = userType === 'client' && project.clientId === 1; // 현재 로그인한 클라이언트의 프로젝트
  const hasApplied = userType === 'freelancer'; // 프리랜서가 지원한 상태 가정

  // 내가 제안한 프리랜서 목록 (임시 데이터)
  const proposedFreelancers = [
    {
      id: 1,
      name: '김개발',
      email: 'kim@example.com',
      skills: ['React', 'Node.js'],
      interests: ['웹개발', 'UI/UX'],
      status: '대기중',
      proposedAt: '2024.01.21'
    },
    {
      id: 2,
      name: '박디자인',
      email: 'park@example.com',
      skills: ['Figma', 'Photoshop'],
      interests: ['디자인', 'UI/UX'],
      status: '거절',
      proposedAt: '2024.01.20'
    }
  ];

  // 내 지원서 정보 (프리랜서용)
  const myApplication = {
    id: 1,
    expectedPrice: '2500만원',
    expectedDuration: '3개월',
    workPlan: '첫 달에는 기획 및 디자인, 둘째 달에는 개발, 셋째 달에는 테스트 및 배포를 진행할 예정입니다.',
    additionalRequests: '주 1회 정기 미팅을 통해 진행 상황을 공유하고 싶습니다.',
    status: '대기중',
    appliedAt: '2024.01.20'
  };

  const updateApplicantStatus = (applicantId: number, status: 'approved' | 'rejected') => {
    console.log(`지원자 ${applicantId} 상태를 ${status}로 변경`);
    alert(`지원자 상태가 ${status === 'approved' ? '승인' : '거절'}으로 변경되었습니다.`);
  };

  const cancelProposal = (freelancerId: number) => {
    console.log(`프리랜서 ${freelancerId}에게 보낸 제안을 취소`);
    alert('제안이 취소되었습니다.');
  };

  // 탭 구성
  const tabs = userType === 'client' && isMyProject
    ? [
        { id: 'info', label: '프로젝트 정보', icon: 'ri-information-line' },
        { id: 'applicants', label: `지원자 (${project.applicants?.length || 0})`, icon: 'ri-user-line' },
        { id: 'proposed', label: `제안한 프리랜서 (${proposedFreelancers.length})`, icon: 'ri-send-plane-line' }
      ]
    : userType === 'freelancer' && hasApplied
    ? [
        { id: 'info', label: '프로젝트 정보', icon: 'ri-information-line' },
        { id: 'myApplication', label: '내 지원서', icon: 'ri-file-text-line' }
      ]
    : [
        { id: 'info', label: '프로젝트 정보', icon: 'ri-information-line' }
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 뒤로가기 */}
        <div className="mb-6">
          <Link to="/projects" className="flex items-center text-indigo-600 hover:text-indigo-700 cursor-pointer font-medium">
            <i className="ri-arrow-left-line mr-2 text-lg"></i>
            프로젝트 목록으로 돌아가기
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-3">
            {/* 프로젝트 헤더 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-md ${
                      project.status === '모집중' 
                        ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' 
                        : project.status === '진행중'
                        ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
                        : 'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
                    }`}>
                      {project.status}
                    </span>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                      {project.category}
                    </span>
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">{project.title}</h1>
                  <div className="flex items-center space-x-6 text-gray-600">
                    <span className="flex items-center">
                      <i className="ri-building-line mr-2 text-indigo-500"></i>
                      <span className="font-medium">{project.clientName}</span>
                    </span>
                    <span className="flex items-center">
                      <i className="ri-calendar-line mr-2 text-blue-500"></i>
                      <span>등록: {project.createdAt}</span>
                    </span>
                    <span className="flex items-center">
                      <i className="ri-calendar-deadline-line mr-2 text-red-500"></i>
                      <span>마감: {project.deadline}</span>
                    </span>
                  </div>
                </div>
                
                {isMyProject && (
                  <div className="flex space-x-3">
                    <Button variant="outline" size="sm" className="rounded-xl">
                      <i className="ri-edit-line mr-2"></i>
                      수정
                    </Button>
                    <Button variant="danger" size="sm" className="rounded-xl">
                      <i className="ri-delete-bin-line mr-2"></i>
                      삭제
                    </Button>
                  </div>
                )}
              </div>

              {/* 탭 네비게이션 */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex space-x-8 border-b border-gray-200">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`pb-4 px-2 border-b-3 font-semibold text-sm cursor-pointer flex items-center transition-all ${
                        activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <i className={`${tab.icon} mr-2 text-lg`}></i>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 탭 콘텐츠 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              {/* 프로젝트 정보 탭 */}
              {activeTab === 'info' && (
                <div className="space-y-10">
                  {/* 프로젝트 개요 */}
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">프로젝트 개요</h2>
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 mb-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <i className="ri-wallet-3-line text-white text-2xl"></i>
                          </div>
                          <p className="text-sm text-gray-600 font-medium mb-1">프로젝트 예산</p>
                          <p className="text-2xl font-bold text-green-600">{project.budget}</p>
                        </div>
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <i className="ri-time-line text-white text-2xl"></i>
                          </div>
                          <p className="text-sm text-gray-600 font-medium mb-1">예상 기간</p>
                          <p className="text-2xl font-bold text-blue-600">{project.duration}</p>
                        </div>
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <i className="ri-calendar-deadline-line text-white text-2xl"></i>
                          </div>
                          <p className="text-sm text-gray-600 font-medium mb-1">지원 마감일</p>
                          <p className="text-2xl font-bold text-red-600">{project.deadline}</p>
                        </div>
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <i className="ri-bookmark-line text-white text-2xl"></i>
                          </div>
                          <p className="text-sm text-gray-600 font-medium mb-1">프로젝트 분야</p>
                          <p className="text-xl font-bold text-purple-600">{project.category}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 상세 설명 */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">프로젝트 상세 설명</h3>
                    <div className="bg-gray-50 rounded-2xl p-8">
                      <div className="prose max-w-none">
                        <p className="text-lg text-gray-700 leading-relaxed mb-6">{project.description}</p>
                        
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">📋 주요 업무 내용</h4>
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                              <li>사용자 친화적인 UI/UX 설계 및 구현</li>
                              <li>반응형 웹 디자인으로 모바일/데스크톱 호환성 확보</li>
                              <li>상품 관리 시스템 (등록, 수정, 삭제, 카테고리 관리)</li>
                              <li>장바구니 및 주문 처리 시스템 구축</li>
                              <li>안전한 결제 시스템 연동 (PG사 API 연동)</li>
                              <li>회원 관리 시스템 (회원가입, 로그인, 마이페이지)</li>
                              <li>관리자 대시보드 개발</li>
                              <li>SEO 최적화 및 성능 튜닝</li>
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">🎯 프로젝트 목표</h4>
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                              <li>월 평균 1만 명 이상의 사용자가 이용할 수 있는 안정적인 플랫폼 구축</li>
                              <li>직관적이고 사용하기 쉬운 인터페이스 제공</li>
                              <li>모바일 우선 설계로 모든 디바이스에서 최적화된 경험</li>
                              <li>보안성과 확장성을 고려한 아키텍처 설계</li>
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3">📈 예상 성과</h4>
                            <ul className="list-disc list-inside space-y-2 text-gray-700">
                              <li>온라인 매출 채널 확보를 통한 매출 증대</li>
                              <li>브랜드 인지도 향상 및 고객 접점 확대</li>
                              <li>효율적인 재고 관리 및 주문 처리 자동화</li>
                              <li>데이터 기반의 마케팅 전략 수립 가능</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 요구 기술 스택 */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">🛠️ 요구 기술 스택</h3>
                    <div className="bg-white rounded-2xl border border-gray-200 p-8">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {project.skills.map((skill) => (
                          <div key={skill} className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                              <i className="ri-code-line text-white"></i>
                            </div>
                            <span className="text-lg font-semibold text-gray-900">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 우대 사항 */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">⭐ 우대 사항</h3>
                    <div className="bg-yellow-50 rounded-2xl p-8 border border-yellow-200">
                      <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start">
                          <i className="ri-check-line text-green-500 mt-1 mr-3"></i>
                          <span>유사한 E-커머스 프로젝트 개발 경험 보유자</span>
                        </li>
                        <li className="flex items-start">
                          <i className="ri-check-line text-green-500 mt-1 mr-3"></i>
                          <span>AWS, Docker 등 클라우드 및 배포 환경 경험</span>
                        </li>
                        <li className="flex items-start">
                          <i className="ri-check-line text-green-500 mt-1 mr-3"></i>
                          <span>PG사 결제 연동 경험 (토스페이먼츠, 이니시스 등)</span>
                        </li>
                        <li className="flex items-start">
                          <i className="ri-check-line text-green-500 mt-1 mr-3"></i>
                          <span>Git을 활용한 협업 및 코드 리뷰 경험</span>
                        </li>
                        <li className="flex items-start">
                          <i className="ri-check-line text-green-500 mt-1 mr-3"></i>
                          <span>UI/UX 디자인에 대한 이해와 센스</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* 급여 및 지급 조건 */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">💰 급여 및 지급 조건</h3>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 mb-4">💵 프로젝트 예산</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">총 프로젝트 비용</span>
                              <span className="text-2xl font-bold text-green-600">{project.budget}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">VAT 별도</span>
                              <span className="text-lg font-semibold text-gray-900">10%</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 mb-4">📅 지급 일정</h4>
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <i className="ri-checkbox-circle-line text-green-500 mr-3"></i>
                              <span className="text-gray-700">계약금: 30% (계약 체결 시)</span>
                            </div>
                            <div className="flex items-center">
                              <i className="ri-checkbox-circle-line text-green-500 mr-3"></i>
                              <span className="text-gray-700">중간금: 40% (중간 검수 완료 시)</span>
                            </div>
                            <div className="flex items-center">
                              <i className="ri-checkbox-circle-line text-green-500 mr-3"></i>
                              <span className="text-gray-700">잔금: 30% (최종 완료 시)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 pt-6 border-t border-green-200">
                        <div className="flex items-start">
                          <i className="ri-information-line text-blue-500 mt-1 mr-3"></i>
                          <div className="text-sm text-gray-600">
                            <p className="font-medium mb-1">추가 정보</p>
                            <ul className="space-y-1">
                              <li>• 지급일: 세금계산서 발행 후 30일 이내</li>
                              <li>• 업무 범위 변경 시 별도 협의</li>
                              <li>• 유지보수 계약 별도 가능 (월 50만원)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 근무 조건 */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">🏢 근무 조건</h3>
                    <div className="bg-white rounded-2xl border border-gray-200 p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-4">📍 근무 형태</h4>
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <i className="ri-home-wifi-line text-indigo-500 mr-3"></i>
                              <span className="text-gray-700">원격 근무 가능</span>
                            </div>
                            <div className="flex items-center">
                              <i className="ri-building-line text-indigo-500 mr-3"></i>
                              <span className="text-gray-700">필요시 사무실 출입 가능</span>
                            </div>
                            <div className="flex items-center">
                              <i className="ri-calendar-check-line text-indigo-500 mr-3"></i>
                              <span className="text-gray-700">주 1회 정기 미팅 (화상 또는 대면)</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-4">⏰ 소통 방식</h4>
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <i className="ri-slack-line text-indigo-500 mr-3"></i>
                              <span className="text-gray-700">Slack을 통한 일상 소통</span>
                            </div>
                            <div className="flex items-center">
                              <i className="ri-github-line text-indigo-500 mr-3"></i>
                              <span className="text-gray-700">GitHub을 통한 코드 리뷰</span>
                            </div>
                            <div className="flex items-center">
                              <i className="ri-presentation-line text-indigo-500 mr-3"></i>
                              <span className="text-gray-700">주간 진행상황 보고</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 지원자 탭 (클라이언트 전용) */}
              {activeTab === 'applicants' && isMyProject && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900">지원자 목록</h3>
                    <div className="text-sm text-gray-600">
                      총 <span className="font-bold text-indigo-600">{project.applicants?.length || 0}</span>명의 지원자
                    </div>
                  </div>
                  {project.applicants?.map((applicant) => (
                    <div key={applicant.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                            {applicant.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-gray-900">{applicant.name}</h4>
                            <p className="text-gray-600">{applicant.email}</p>
                            <p className="text-gray-600">{applicant.contact}</p>
                          </div>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                          applicant.status === '대기중' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : applicant.status === '승인'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {applicant.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6 mb-4 p-4 bg-gray-50 rounded-xl">
                        <div>
                          <span className="text-sm text-gray-600 font-medium">예상 견적</span>
                          <p className="text-lg font-bold text-green-600">{applicant.expectedPrice}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600 font-medium">예상 기간</span>
                          <p className="text-lg font-bold text-blue-600">{applicant.expectedDuration}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="font-bold text-gray-900 mb-2">작업 계획</h5>
                        <p className="text-gray-700 bg-blue-50 p-4 rounded-xl leading-relaxed">{applicant.workPlan}</p>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-3">
                          <Button size="sm" variant="outline" className="rounded-xl">
                            <i className="ri-file-text-line mr-2"></i>
                            이력서
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-xl">
                            <i className="ri-folder-line mr-2"></i>
                            포트폴리오
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-xl">
                            <i className="ri-user-line mr-2"></i>
                            프로필 보기
                          </Button>
                        </div>
                        
                        {applicant.status === '대기중' && (
                          <div className="flex space-x-3">
                            <Button 
                              size="sm" 
                              onClick={() => updateApplicantStatus(applicant.id, 'approved')}
                              className="rounded-xl px-6"
                            >
                              <i className="ri-check-line mr-2"></i>
                              승인
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => updateApplicantStatus(applicant.id, 'rejected')}
                              className="rounded-xl px-6"
                            >
                              <i className="ri-close-line mr-2"></i>
                              거절
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-16 text-gray-500">
                      <i className="ri-inbox-line text-5xl mb-4"></i>
                      <h4 className="text-xl font-bold mb-2">아직 지원자가 없습니다</h4>
                      <p>프로젝트가 더 많은 프리랜서에게 노출되도록 홍보해보세요</p>
                    </div>
                  )}
                </div>
              )}

              {/* 제안한 프리랜서 탭 (클라이언트 전용) */}
              {activeTab === 'proposed' && isMyProject && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900">제안한 프리랜서</h3>
                    <div className="text-sm text-gray-600">
                      총 <span className="font-bold text-green-600">{proposedFreelancers.length}</span>명에게 제안
                    </div>
                  </div>
                  {proposedFreelancers.map((freelancer) => (
                    <div key={freelancer.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                            {freelancer.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-gray-900">{freelancer.name}</h4>
                            <p className="text-gray-600">{freelancer.email}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {freelancer.skills.map((skill) => (
                                <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                          freelancer.status === '대기중' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : freelancer.status === '수락'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {freelancer.status}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-gray-600">
                          제안일: <span className="font-medium">{freelancer.proposedAt}</span>
                        </div>
                        
                        <div className="flex space-x-3">
                          <Link to={`/freelancers/${freelancer.id}`}>
                            <Button size="sm" variant="outline" className="rounded-xl">
                              <i className="ri-user-line mr-2"></i>
                              프로필 보기
                            </Button>
                          </Link>
                          {freelancer.status === '대기중' && (
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => cancelProposal(freelancer.id)}
                              className="rounded-xl"
                            >
                              <i className="ri-close-line mr-2"></i>
                              제안 취소
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 내 지원서 탭 (프리랜서 전용) */}
              {activeTab === 'myApplication' && userType === 'freelancer' && hasApplied && (
                <div className="space-y-8">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold text-gray-900">내 지원서</h3>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      myApplication.status === '대기중' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : myApplication.status === '승인'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {myApplication.status}
                    </span>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <i className="ri-wallet-3-line text-white text-xl"></i>
                        </div>
                        <span className="text-sm text-gray-600 font-medium block">제안 견적</span>
                        <p className="text-2xl font-bold text-green-600">{myApplication.expectedPrice}</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <i className="ri-time-line text-white text-xl"></i>
                        </div>
                        <span className="text-sm text-gray-600 font-medium block">예상 기간</span>
                        <p className="text-2xl font-bold text-blue-600">{myApplication.expectedDuration}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-3">📋 작업 계획</h4>
                        <p className="text-gray-700 bg-white p-6 rounded-xl leading-relaxed">{myApplication.workPlan}</p>
                      </div>

                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-3">💬 추가 요청사항</h4>
                        <p className="text-gray-700 bg-white p-6 rounded-xl leading-relaxed">{myApplication.additionalRequests}</p>
                      </div>

                      <div className="text-sm text-gray-600 bg-white p-4 rounded-xl">
                        <span>지원일: </span>
                        <span className="font-medium">{myApplication.appliedAt}</span>
                      </div>
                    </div>
                  </div>

                  {myApplication.status === '대기중' && (
                    <div className="flex space-x-4">
                      <Button className="rounded-xl px-8">
                        <i className="ri-edit-line mr-2"></i>
                        지원서 수정
                      </Button>
                      <Button variant="outline" className="rounded-xl px-8">
                        <i className="ri-delete-bin-line mr-2"></i>
                        지원 취소
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* 사이드바 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 의뢰자 정보 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">의뢰자 정보</h3>
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                  {project.clientName.charAt(0)}
                </div>
                <h4 className="text-xl font-bold text-gray-900">{project.clientName}</h4>
                <p className="text-gray-600 mt-1">IT 서비스 전문 기업</p>
                <div className="flex items-center justify-center mt-3">
                  <i className="ri-star-fill text-yellow-400 mr-1"></i>
                  <span className="text-lg font-bold">4.8</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium">완료 프로젝트</span>
                  <span className="font-bold text-indigo-600">24건</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium">평균 응답 시간</span>
                  <span className="font-bold text-blue-600">2시간</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium">재계약률</span>
                  <span className="font-bold text-green-600">85%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-600 font-medium">결제 준수율</span>
                  <span className="font-bold text-emerald-600">100%</span>
                </div>
              </div>
            </div>

            {/* 지원 현황 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">지원 현황</h3>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <i className="ri-user-line text-white text-2xl"></i>
                  </div>
                  <span className="text-sm text-gray-600 font-medium block">지원자 수</span>
                  <p className="text-3xl font-bold text-blue-600">{project.applicants?.length || 0}명</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <i className="ri-calendar-deadline-line text-white text-2xl"></i>
                  </div>
                  <span className="text-sm text-gray-600 font-medium block">마감까지</span>
                  <p className="text-3xl font-bold text-red-600">D-7</p>
                </div>
              </div>
              
              <div className="mt-8 space-y-3">
                {!isMyProject && userType === 'freelancer' && !hasApplied && (
                  <Link to={`/projects/${project.id}/apply`}>
                    <Button className="w-full" size="lg" className="rounded-xl">
                      <i className="ri-send-plane-line mr-2"></i>
                      지원하기
                    </Button>
                  </Link>
                )}
                
                {hasApplied && userType === 'freelancer' && (
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <i className="ri-check-line text-blue-600 text-2xl mb-2"></i>
                    <p className="text-sm text-blue-600 font-bold">지원 완료</p>
                  </div>
                )}
                
                {isMyProject && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">{project.applicants?.length || 0}</div>
                      <div className="text-xs text-blue-600 font-medium">지원자</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">{proposedFreelancers.length}</div>
                      <div className="text-xs text-green-600 font-medium">제안</div>
                    </div>
                  </div>
                )}
                
                <Button variant="outline" className="w-full rounded-xl">
                  <i className="ri-heart-line mr-2"></i>
                  관심 프로젝트 등록
                </Button>
                
                <Button variant="outline" className="w-full rounded-xl">
                  <i className="ri-share-line mr-2"></i>
                  공유하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}