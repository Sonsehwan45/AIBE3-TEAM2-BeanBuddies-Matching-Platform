import { client } from '@/lib/backend/client';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../../../components/base/Button';
import Select from '../../../../components/base/Select';
import { useAuth } from '../../../../context/AuthContext';

// 타입 정의
type FreelancerData = {
  id?: number;
  name?: string;
  careerLevel?: string;
  ratingAvg?: number;
  skills?: Array<{ id?: number; name?: string; }>;
};

type ProjectData = {
  id?: number;
  title?: string;
  summary?: string; // 새 API에서는 summary 사용
  budget?: number;  // 새 API에서는 price로 명명되지만 budget으로 매핑
  status?: string;
  ownerName?: string;
  price?: number;   // 새 API 필드
  duration?: string;
  deadline?: string;
  createDate?: string;
  skills?: Array<{ id?: number; name?: string; }>;
  interests?: Array<{ id?: number; name?: string; }>;
};

export default function FreelancerPropose() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [freelancer, setFreelancer] = useState<FreelancerData | null>(null);
  const [myProjects, setMyProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    projectId: '',
    message: ''
  });

  // 프리랜서 정보와 내 프로젝트 목록 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 로그인 체크
        if (!user) {
          alert('로그인이 필요합니다.');
          navigate('/login');
          return;
        }

        // 프리랜서 정보는 일단 목록에서 가져오는 것으로 처리 (개별 조회 API가 없다면)
        // 실제로는 프리랜서 상세 API가 있어야 함
        const freelancerData = {
          id: Number(id),
          name: `프리랜서 ${id}`,
          careerLevel: 'MID',
          ratingAvg: 4.5,
          skills: []
        };
        setFreelancer(freelancerData);

        // 내 프로젝트 목록 가져오기 - 새로운 API 사용
        const { data: projectsResponse } = await client.GET("/api/v1/members/me/projects", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (projectsResponse?.data) {
          // 새로운 API는 이미 현재 사용자의 프로젝트만 반환하므로 필터링 불필요
          const userProjects = projectsResponse.data as ProjectData[];
          setMyProjects(userProjects);
          console.log('내 프로젝트 조회 성공:', userProjects.length, '개');
        }
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.projectId || !formData.message.trim()) {
      alert('모든 필수 항목을 입력해주세요.');
      return;
    }

    if (formData.message.trim().length < 50) {
      alert('메시지를 최소 50자 이상 작성해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await client.POST("/api/v1/projects/{projectId}/proposals", {
        params: {
          path: {
            projectId: Number(formData.projectId)
          }
        },
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: {
          freelancerId: Number(id),
          message: formData.message.trim()
        }
      });

      if (data) {
        alert('프로젝트 제안이 성공적으로 전송되었습니다!');
        navigate(`/freelancers/${id}`);
      } else {
        throw new Error('제안 전송에 실패했습니다.');
      }
    } catch (error) {
      console.error('제안 전송 실패:', error);
      alert('제안 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">프리랜서를 찾을 수 없습니다</h2>
          <Link to="/freelancers">
            <Button>프리랜서 목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  const projectOptions = myProjects.map(project => ({
    value: project.id?.toString() || '',
    label: `${project.title || '제목 없음'} (예산: ${(project.price || project.budget)?.toLocaleString() || '미정'}원)`
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 뒤로가기 */}
        <div className="mb-6">
          <Link to={`/freelancers/${freelancer.id}`} className="flex items-center text-blue-600 hover:text-blue-700 cursor-pointer">
            <i className="ri-arrow-left-line mr-2"></i>
            프리랜서 프로필로 돌아가기
          </Link>
        </div>

        {/* 프리랜서 정보 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {freelancer.name?.charAt(0) || 'F'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{freelancer.name || '프리랜서'}</h2>
              <div className="flex items-center mt-1">
                <i className="ri-star-fill text-yellow-400 mr-1"></i>
                <span className="text-sm font-medium">{freelancer.ratingAvg?.toFixed(1) || '0.0'}</span>
                <span className="text-sm text-gray-500 ml-2">
                  경력: {freelancer.careerLevel === 'NEWBIE' && '신입'}
                  {freelancer.careerLevel === 'JUNIOR' && '주니어'}
                  {freelancer.careerLevel === 'MID' && '미드'}
                  {freelancer.careerLevel === 'SENIOR' && '시니어'}
                  {freelancer.careerLevel === 'UNDEFINED' && '미입력'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 제안서 작성 폼 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">프로젝트 제안하기</h1>
            <p className="text-gray-600">프리랜서에게 프로젝트를 제안해보세요.</p>
          </div>

          {myProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-6 bg-gray-50 rounded-xl inline-block">
                <i className="ri-folder-2-line text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">제안할 프로젝트가 없습니다</h3>
                <p className="text-gray-500 mb-4">먼저 프로젝트를 등록한 후 제안해보세요.</p>
                <div className="flex space-x-4 justify-center">
                  <Link to="/projects/create">
                    <Button className="rounded-xl">
                      <i className="ri-add-line mr-2"></i>
                      프로젝트 등록하기
                    </Button>
                  </Link>
                  <Link to={`/freelancers/${freelancer.id}`}>
                    <Button variant="outline" className="rounded-xl">
                      프로필로 돌아가기
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Select
                label="제안할 프로젝트"
                options={[
                  { value: '', label: '프로젝트를 선택하세요' },
                  ...projectOptions
                ]}
                value={formData.projectId}
                onChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제안 메시지 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="프리랜서에게 전달할 메시지를 작성해주세요. 프로젝트에 대한 상세한 설명과 기대사항을 포함해주세요."
                  required
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="mt-1 text-sm text-gray-500">최소 50자 이상 작성해주세요.</p>
              </div>

              {/* 선택된 프로젝트 정보 */}
              {formData.projectId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">선택된 프로젝트</h3>
                  {(() => {
                    const selectedProject = myProjects.find(p => p.id?.toString() === formData.projectId);
                    return selectedProject ? (
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">{selectedProject.title || '제목 없음'}</p>
                        <p className="mt-1">{selectedProject.summary || '설명 없음'}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span>예산: {(selectedProject.price || selectedProject.budget)?.toLocaleString() || '미정'}원</span>
                          <span>상태: {selectedProject.status || '미정'}</span>
                        </div>
                      </div>
                    ) : null
                  })()}
                </div>
              )}

              {/* 제출 버튼 */}
              <div className="flex space-x-4 pt-6">
                <Link to={`/freelancers/${freelancer.id}`} className="flex-1">
                  <Button variant="outline" className="w-full" size="lg" disabled={submitting}>
                    취소
                  </Button>
                </Link>
                <Button type="submit" className="flex-1" size="lg" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      전송 중...
                    </>
                  ) : (
                    '제안 전송'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* 안내사항 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex">
            <i className="ri-information-line text-blue-500 text-lg mr-3 mt-0.5"></i>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">프로젝트 제안 안내</p>
              <ul className="space-y-1 text-blue-700">
                <li>• 제안 전송 후 프리랜서가 검토하게 됩니다.</li>
                <li>• 프리랜서의 수락/거절 여부를 알림으로 받아보실 수 있습니다.</li>
                <li>• 성의 있고 구체적인 제안서가 수락률을 높입니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}