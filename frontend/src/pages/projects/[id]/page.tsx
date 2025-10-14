import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../../../components/base/Button';
import client from '../../../global/backend/client';

interface ProjectDetailProps {
  userType?: 'client' | 'freelancer';
}

interface Project {
  id: number;
  title: string;
  summary: string;
  duration: string;
  price: number;
  preferredCondition: string;
  payCondition: string;
  workingCondition: string;
  description: string;
  deadline: string;
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CLOSED";
  createDate: string;
  modifyDate: string;
  ownerName: string;
  skills: Array<{
    id: number;
    name: string;
  }>;
  interests: Array<{
    id: number;
    name: string;
  }>;
}

export default function ProjectDetail({ userType = 'freelancer' }: ProjectDetailProps) {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'applicants' | 'proposed' | 'myApplication'>('info');

  // 프로젝트 정보 가져오기
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!id) {
          setError('프로젝트 ID가 없습니다.');
          return;
        }

        const response = await client.GET(`/api/v1/projects/${id}`);
        
        // API 응답 로그 확인
        console.log('API Response:', response);
        
        if (response.error) throw response.error;
        
        // response.data에서 바로 프로젝트 데이터를 가져옴
        if (!response.data) {
          throw new Error('프로젝트 데이터가 없습니다.');
        }

        setProject(response.data);
      } catch (err: any) {
        console.error('프로젝트 조회 실패:', err);
        setError(err.message || '프로젝트 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">프로젝트 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || '프로젝트를 찾을 수 없습니다'}
          </h2>
          <Link to="/projects">
            <Button>프로젝트 목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 프로젝트 상태에 따른 배지 스타일
  const getStatusStyle = (status: Project['status']) => {
    switch (status) {
      case 'OPEN':
        return 'bg-gradient-to-r from-green-400 to-green-600 text-white';
      case 'IN_PROGRESS':
        return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
      case 'COMPLETED':
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
      case 'CLOSED':
        return 'bg-gradient-to-r from-red-400 to-red-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
    }
  };

  // 상태 텍스트 변환
  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'OPEN': return '모집중';
      case 'IN_PROGRESS': return '진행중';
      case 'COMPLETED': return '완료';
      case 'CLOSED': return '마감';
      default: return status;
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 금액 포맷팅
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(price);
  };

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

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          {/* 상태 배지 & 분야 */}
          <div className="flex items-center space-x-4 mb-4">
            <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-md ${getStatusStyle(project.status)}`}>
              {getStatusText(project.status)}
            </span>
            {project.interests.map(interest => (
              <span key={interest.id} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                {interest.name}
              </span>
            ))}
          </div>

          {/* 제목 & 메타 정보 */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">{project.title}</h1>
          <div className="flex items-center space-x-6 text-gray-600">
            <span className="flex items-center">
              <i className="ri-building-line mr-2 text-indigo-500"></i>
              <span className="font-medium">{project.ownerName}</span>
            </span>
            <span className="flex items-center">
              <i className="ri-calendar-line mr-2 text-blue-500"></i>
              <span>등록: {formatDate(project.createDate)}</span>
            </span>
            <span className="flex items-center">
              <i className="ri-calendar-deadline-line mr-2 text-red-500"></i>
              <span>마감: {formatDate(project.deadline)}</span>
            </span>
          </div>
        </div>

        {/* 프로젝트 정보 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="space-y-10">
            {/* 프로젝트 개요 */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">프로젝트 개요</h2>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <i className="ri-wallet-3-line text-white text-2xl"></i>
                    </div>
                    <p className="text-sm text-gray-600 font-medium mb-1">프로젝트 예산</p>
                    <p className="text-2xl font-bold text-green-600">{formatPrice(project.price)}</p>
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
                      <i className="ri-calendar-line text-white text-2xl"></i>
                    </div>
                    <p className="text-sm text-gray-600 font-medium mb-1">지원 마감일</p>
                    <p className="text-2xl font-bold text-red-600">{formatDate(project.deadline)}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <i className="ri-bookmark-line text-white text-2xl"></i>
                    </div>
                    <p className="text-sm text-gray-600 font-medium mb-1">프로젝트 분야</p>
                    <p className="text-xl font-bold text-purple-600">{project.interests.map(interest => interest.name).join(', ')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 프로젝트 상세 */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">프로젝트 상세 설명</h3>
              <div className="prose max-w-none bg-gray-50 rounded-2xl p-8">
                <div className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </div>
              </div>
            </div>

            {/* 기술 스택 */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">🛠️ 요구 기술 스택</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {project.skills.map(skill => (
                  <div key={skill.id} className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                      <i className="ri-code-line text-white"></i>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{skill.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 우대사항 */}
            {project.preferredCondition && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">⭐ 우대 사항</h3>
                <div className="bg-yellow-50 rounded-2xl p-8 border border-yellow-200">
                  <div className="prose max-w-none">
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {project.preferredCondition}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 급여 조건 */}
            {project.payCondition && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">💰 급여 조건</h3>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
                  <div className="prose max-w-none">
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {project.payCondition}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 업무 조건 */}
            {project.workingCondition && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">🏢 업무 조건</h3>
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <div className="prose max-w-none">
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {project.workingCondition}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}