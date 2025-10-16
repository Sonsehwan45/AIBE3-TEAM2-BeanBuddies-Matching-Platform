
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
import Badge from '../../components/base/Badge';
import Input from '../../components/base/Input';
import Select from '../../components/base/Select';
import { client } from '@/lib/backend/client';
import { useAuth } from '@/context/AuthContext';
import { mockProjects, mockFreelancers, mockFeedback } from '@/mocks/users';

interface BaseProfile {
  username: string;
  name: string;
  role: 'CLIENT' | 'FREELANCER';
  createdAt: string;
  ratingAvg: number;
  email: string;
  profileScope?: 'PUBLIC' | 'PRIVATE';
  // 공통 제공 필드 (백엔드 ProfileResponseDto 기준)
  skills?: string[];
  interests?: string[];
}

interface FreelancerProfile extends BaseProfile {
  role: 'FREELANCER';
  job: string;
  career: { [key: string]: number };
  freelancerEmail: string;
  comment: string;
}

interface ClientProfile extends BaseProfile {
  role: 'CLIENT';
  companyName: string;
  companySize: 'STARTUP' | 'SMALL' | 'MEDIUM' | 'LARGE';
  companyDescription: string;
  representative: string;
  businessNo: string;
  companyPhone: string;
  companyEmail: string;
}

type ExtendedProfileResponse = FreelancerProfile | ClientProfile;

// 내가 지원한 프로젝트 응답 아이템 타입
interface MyApplicationItem {
  id: number;
  estimatedPay: number;
  expectedDuration: string;
  workPlan: string;
  additionalRequest?: string;
  status: 'WAIT' | 'ACCEPT' | 'DENIED';
  createDate: string;
  projectId: number;
  projectTitle: string;
  freelancerId: number;
  freelancerName: string;
}

// 내가 등록한 프로젝트 응답 아이템 타입 (CLIENT 전용)
interface MyProjectItem {
  id: number;
  title: string;
  summary: string;
  status: string; // e.g., OPEN | CLOSED
  ownerName: string;
  duration: string;
  price: number;
  deadline: string; // yyyy-MM-dd
  createDate: string; // ISO
  skills: { id: number; name: string }[];
  interests: { id: number; name: string }[];
}

interface MyPageProps {
  userType?: 'client' | 'freelancer';
}

export default function MyPage({ userType = 'client' }: MyPageProps) {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'bookmarks' | 'feedback'>(
    'profile',
  );
  

  const defaultFreelancerProfile: FreelancerProfile = {
    username: '',
    name: '',
    role: 'FREELANCER',
    createdAt: '',
    ratingAvg: 0,
    email: '',
    profileScope: 'PUBLIC',
    skills: [],
    interests: [],
    job: '',
    career: {},
    freelancerEmail: '',
    comment: ''
  };

  const defaultClientProfile: ClientProfile = {
    username: '',
    name: '',
    role: 'CLIENT',
    createdAt: '',
    ratingAvg: 0,
    email: '',
    profileScope: 'PUBLIC',
    companyName: '',
    companySize: 'STARTUP',
    companyDescription: '',
    representative: '',
    businessNo: '',
    companyPhone: '',
    companyEmail: ''
  };

  const [profileData, setProfileData] = useState<ExtendedProfileResponse>(
    userType === 'freelancer' ? defaultFreelancerProfile : defaultClientProfile
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // skills 편집 상태
  const [allSkills, setAllSkills] = useState<{ id: number; name: string }[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);
  // projects 탭 필터 상태
  const [projectStatusFilter, setProjectStatusFilter] = useState<'all' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED'>('IN_PROGRESS');
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<'all' | 'WAIT' | 'ACCEPT' | 'DENIED'>('all');

  // applications/projects for profile tab
  const [applications, setApplications] = useState<MyApplicationItem[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [projects, setProjects] = useState<MyProjectItem[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  // pagination for profile tab lists
  const [appsPage, setAppsPage] = useState(1);
  const [appsPageSize] = useState(5);
  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsPageSize] = useState(5);
  const appsSectionRef = useRef<HTMLDivElement>(null);
  const projectsSectionRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 로그인 체크 및 리다이렉트
  useEffect(() => {
    if (!isLoggedIn) {
      alert('로그인이 필요한 페이지입니다.');
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // 프리랜서만: 내가 지원한 프로젝트 목록 조회
  useEffect(() => {
    const fetchMyApplications = async () => {
      if (!isLoggedIn) return;
      if (profileData.role !== 'FREELANCER') return;

      try {
        setAppsLoading(true);
        const accessToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('accessToken='))
          ?.split('=')[1];

        const { data, error } = await client.GET('/api/v1/members/me/applications', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (error) {
          const code = (error as any)?.data?.resultCode;
          if (code === '401-1') {
            navigate('/login');
            return;
          }
          if (code?.startsWith('400-')) {
            console.warn('지원 목록 400 응답 처리:', (error as any)?.data?.msg);
            setApplications([]);
            return;
          }
          console.error('지원 목록 조회 에러:', error);
          setApplications([]);
          return;
        }

        if (!data) {
          console.error('지원 목록 데이터가 없습니다.');
          setApplications([]);
          return;
        }

        if ((data as any)?.resultCode === '401-1') {
          navigate('/login');
          return;
        }

        if (Array.isArray(data.data)) {
          setApplications(data.data);
        } else {
          console.warn('지원 목록 응답 포맷이 예상과 다릅니다:', data);
          setApplications([]);
        }
      } catch (err) {
        console.error('지원 목록 조회 실패:', err);
        setApplications([]);
      } finally {
        setAppsLoading(false);
      }
    };

    fetchMyApplications();
  }, [isLoggedIn, profileData.role, navigate]);

  // 스킬 전체 목록 로드
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data, error } = await client.GET('/api/v1/skills');
        if (error) {
          console.warn('스킬 목록 조회 에러:', error);
          return;
        }
        if (data && Array.isArray((data as any).data)) {
          const list = ((data as any).data as any[])
            .map((s) => ({ id: s.id as number, name: s.name as string }))
            .filter((s) => s.id != null && s.name);
          setAllSkills(list);
        }
      } catch (e) {
        console.warn('스킬 목록 조회 실패:', e);
      }
    };
    fetchSkills();
  }, []);

  // 목록 길이 변경 시 페이지 보정
  useEffect(() => {
    const total = Math.max(1, Math.ceil(applications.length / appsPageSize));
    if (appsPage > total) setAppsPage(total);
  }, [applications, appsPage, appsPageSize]);

  useEffect(() => {
    const total = Math.max(1, Math.ceil(projects.length / projectsPageSize));
    if (projectsPage > total) setProjectsPage(total);
  }, [projects, projectsPage, projectsPageSize]);

  // 클라이언트만: 내가 등록한 프로젝트 목록 조회
  useEffect(() => {
    const fetchMyProjects = async () => {
      if (!isLoggedIn) return;
      if (profileData.role !== 'CLIENT') return;
      try {
        setProjectsLoading(true);
        const accessToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('accessToken='))
          ?.split('=')[1];

        const { data, error } = await client.GET('/api/v1/members/me/projects', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (error) {
          const code = (error as any)?.data?.resultCode;
          if (code === '401-1') {
            navigate('/login');
            return;
          }
          if (code === '400-1') {
            console.warn('프로젝트 목록 400 응답 처리:', (error as any)?.data?.msg);
            setProjects([]);
            return;
          }
          console.error('프로젝트 목록 조회 에러:', error);
          setProjects([]);
          return;
        }
        if (!data) throw new Error('프로젝트 목록 데이터가 없습니다.');

        if (data.resultCode === '200-9' && Array.isArray(data.data)) {
          setProjects(data.data as MyProjectItem[]);
        } else if (data.resultCode === '401-1') {
          navigate('/login');
        } else if (data.resultCode === '400-1') {
          console.warn('프로젝트 목록 400 응답 처리:', data.msg);
          setProjects([]);
        } else {
          console.warn('프로젝트 목록 응답 포맷이 예상과 다릅니다:', data);
          setProjects([]);
        }
      } catch (err) {
        console.error('프로젝트 목록 조회 실패:', err);
        setProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchMyProjects();
  }, [isLoggedIn, profileData.role, navigate]);

  // 프로필 조회
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const accessToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('accessToken='))
          ?.split('=')[1];

        const { data, error } = await client.GET('/api/v1/members/me', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error('프로필 데이터가 없습니다.');
        }

        if (data.resultCode === '200-7') {
          const responseData = data.data;
          setProfileData(prev => ({
            ...prev,
            ...responseData,
            // 명시적으로 기본값 보정
            skills: (responseData as any)?.skills || [],
            interests: (responseData as any)?.interests || [],
            profileScope: (responseData as any)?.profileScope || 'PUBLIC',
            ...(responseData.role === 'CLIENT'
              ? {
                  companyName: responseData.companyName || responseData.name || '',
                  companySize: responseData.companySize || 'STARTUP',
                  companyDescription: responseData.companyDescription || '',
                  representative: responseData.representative || '',
                  businessNo: responseData.businessNo || '',
                  companyPhone: responseData.companyPhone || '',
                  companyEmail: responseData.companyEmail || ''
                }
              : {
                  job: responseData.job || '',
                  career: responseData.career || {},
                  freelancerEmail: responseData.freelancerEmail || responseData.email || '',
                  comment: responseData.comment || ''
                })
          }));
        } else {
          throw new Error('프로필 조회에 실패했습니다.');
        }
      } catch (error: any) {
        if (error?.data?.resultCode === '401-1') {
          navigate('/login');
        } else {
          alert('프로필 조회에 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
      } finally {
        // no-op
      }
    };

    if (isLoggedIn) {
      fetchProfile();
    }
  }, [isLoggedIn, navigate]);

  // 프로필 skills(이름) -> selectedSkillIds(아이디) 초기 동기화
  useEffect(() => {
    if (profileData.role === 'FREELANCER' && Array.isArray(profileData.skills) && allSkills.length > 0) {
      const mapped = profileData.skills
        .map((name) => allSkills.find((s) => s.name === name)?.id)
        .filter((id): id is number => typeof id === 'number');
      setSelectedSkillIds(mapped);
    }
  }, [profileData.role, profileData.skills, allSkills]);

  const tabs =
    userType === 'client'
      ? [
          { id: 'profile', label: '프로필 관리', icon: 'ri-user-3-line' },
          { id: 'projects', label: '프로젝트 관리', icon: 'ri-briefcase-4-line' },
          { id: 'bookmarks', label: '관심 프리랜서', icon: 'ri-heart-3-line' },
          { id: 'feedback', label: '피드백 관리', icon: 'ri-star-line' },
        ]
      : [
          { id: 'profile', label: '프로필 관리', icon: 'ri-user-3-line' },
          { id: 'projects', label: '지원 현황', icon: 'ri-briefcase-4-line' },
          { id: 'bookmarks', label: '관심 프로젝트', icon: 'ri-heart-3-line' },
          { id: 'feedback', label: '피드백 관리', icon: 'ri-star-line' },
        ];

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updateData = profileData.role === 'CLIENT' ? {
        name: (profileData as ClientProfile).companyName || profileData.name || '',
        profileScope: profileData.profileScope || 'PUBLIC',
        companyName: (profileData as ClientProfile).companyName || profileData.name || '',
        companySize: (profileData as ClientProfile).companySize || 'STARTUP',
        companyDescription: (profileData as ClientProfile).companyDescription || '',
        representative: (profileData as ClientProfile).representative || '',
        businessNo: (profileData as ClientProfile).businessNo || '',
        companyPhone: (profileData as ClientProfile).companyPhone || '',
        companyEmail: (profileData as ClientProfile).companyEmail || '',
        email: profileData.email || ''
      } : {
        name: profileData.name || '',
        profileScope: profileData.profileScope || 'PUBLIC',
        job: (profileData as FreelancerProfile).job || '',
        freelancerEmail: (profileData as FreelancerProfile).freelancerEmail || '',
        comment: (profileData as FreelancerProfile).comment || '',
        career: (profileData as FreelancerProfile).career || {},
        // skills 편집: 선택된 스킬 아이디 전송
        skillIds: selectedSkillIds
      };

      const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1];

      const { data, error } = await client.PATCH('/api/v1/members/me/profile', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: updateData
      });

      if (error || !data) {
        throw error || new Error('프로필 수정에 실패했습니다.');
      }

      if (data.resultCode === '200-8') {
        alert('프로필이 성공적으로 업데이트되었습니다!');
      }
    } catch (error: any) {
      if (error?.data?.resultCode === '401-1') {
        alert('로그인이 필요한 서비스입니다.');
        navigate('/login');
      } else {
        alert('프로필 수정에 실패했습니다.');
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 프로젝트 즐겨찾기/북마크 용 데이터는 아래에서 직접 사용합니다.

  // 북마크된 프리랜서/프로젝트 (임시 데이터)
  const bookmarkedFreelancers = mockFreelancers.slice(0, 3);
  const bookmarkedProjects = mockProjects.slice(0, 3);

  const removeBookmark = (id: number, type: 'freelancer' | 'project') => {
    console.log(`${type} ${id} 북마크 해제`);
    alert('북마크가 해제되었습니다.');
  };

  

  // 프로젝트 통계
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Profile"
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-xl"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-xl">
                  {profileData.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{profileData.name}</h1>
              <div className="flex items-center space-x-4">
                <p className="text-lg text-gray-600 flex items-center">
                  <i className="ri-briefcase-line mr-2"></i>
                  {userType === 'client' ? '클라이언트' : '프리랜서'}
                </p>
                <div className="flex items-center">
                  <i className="ri-star-fill text-yellow-400 mr-1"></i>
                  <span className="font-bold text-lg text-gray-900">{(profileData as any).ratingAvg ?? (profileData as any).averageRating ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* 사이드바 */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-[1.02]'
                        : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    <i className={`${tab.icon} mr-3 text-lg`}></i>
                    {tab.label}
                  </button>
                ))}
              </nav>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="space-y-3">
                  <Link to="/auth/change-password">
                    <Button variant="outline" size="sm" className="w-full rounded-xl">
                      <i className="ri-lock-password-line mr-2"></i>
                      비밀번호 변경
                    </Button>
                  </Link>
                  <Link to="/auth/delete-account">
                    <Button variant="danger" size="sm" className="w-full rounded-xl">
                      <i className="ri-delete-bin-line mr-2"></i>
                      계정 탈퇴
                    </Button>
                  </Link>
                </div>
              </div>

            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              {/* 프로필 관리 */}
              {activeTab === 'profile' && (
                <>
                  <div className="p-8">
                    <div className="flex items-center space-x-3 mb-8">
                      <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                        <i className="ri-user-3-line text-white text-xl"></i>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">프로필 관리</h2>
                        <p className="text-gray-600">계정 정보를 관리하세요</p>
                      </div>
                    </div>

                    <form onSubmit={handleProfileUpdate} className="space-y-8">
                      {/* 프로필 사진 업로드 */}
                      <div className="text-center">
                        <div className="relative inline-block">
                          {selectedImage ? (
                            <img
                              src={selectedImage}
                              alt="Profile"
                              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
                            />
                          ) : (
                            <div className="w-32 h-32 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                              {profileData.name.charAt(0)}
                            </div>
                          )}
                          <label className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors shadow-lg border-2 border-indigo-100">
                            <i className="ri-camera-line text-indigo-600 text-lg"></i>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                          </label>
                        </div>
                        <p className="text-sm text-gray-500 mt-3">프로필 사진을 업로드하세요</p>
                        {profileData.createdAt && (
                          <p className="text-xs text-gray-400 mt-1">등록일: {new Date(profileData.createdAt).toLocaleDateString('ko-KR')}</p>
                        )}
                      </div>

                      {/* 프로필 공개 범위 설정 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                          label="프로필 공개 범위"
                          value={profileData.profileScope || 'PUBLIC'}
                          onChange={handleSelectChange('profileScope')}
                          options={[
                            { label: '공개', value: 'PUBLIC' },
                            { label: '비공개', value: 'PRIVATE' },
                          ]}
                        />
                      </div>

                      {profileData.role === 'CLIENT' ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                              label="회사명"
                              name="companyName"
                              value={(profileData as ClientProfile).companyName || ''}
                              onChange={handleInputChange}
                              className="rounded-xl"
                            />
                            <Select
                              label="회사 규모"
                              value={(profileData as ClientProfile).companySize || ''}
                              onChange={handleSelectChange('companySize')}
                              options={[
                                { label: '스타트업', value: 'STARTUP' },
                                { label: '중소기업', value: 'SMALL' },
                                { label: '중견기업', value: 'MEDIUM' },
                                { label: '대기업', value: 'LARGE' }
                              ]}
                            />
                          </div>

                          <div className="grid grid-cols-1 gap-6">
                            <Input
                              label="개인 이메일"
                              type="email"
                              name="email"
                              placeholder="개인 연락용 이메일을 입력하세요"
                              value={profileData.email || ''}
                              onChange={handleInputChange}
                              className="rounded-xl"
                            />
                          </div>

                          {/* (선택) 기술 스택 표시 */}
                          {Array.isArray(profileData.skills) && profileData.skills.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">기술 스택</label>
                              <div className="flex flex-wrap gap-2">
                                {profileData.skills.map((skill, idx) => (
                                  <span key={`${skill}-${idx}`} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">회사 소개</label>
                            <textarea
                              name="companyDescription"
                              rows={4}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                              value={(profileData as ClientProfile).companyDescription || ''}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                              label="연락처"
                              name="companyPhone"
                              value={(profileData as ClientProfile).companyPhone || ''}
                              onChange={handleInputChange}
                              className="rounded-xl"
                            />
                            <Input
                              label="회사 이메일"
                              type="email"
                              name="companyEmail"
                              placeholder="회사 업무용 이메일을 입력하세요"
                              value={(profileData as ClientProfile).companyEmail || ''}
                              onChange={handleInputChange}
                              className="rounded-xl"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                              label="대표자명"
                              name="representative"
                              value={(profileData as ClientProfile).representative || ''}
                              onChange={handleInputChange}
                              className="rounded-xl"
                            />
                            <Input
                              label="사업자등록번호"
                              name="businessNo"
                              value={(profileData as ClientProfile).businessNo || ''}
                              onChange={handleInputChange}
                              className="rounded-xl"
                            />
                          </div>

                          {/* 내가 등록한 프로젝트 목록 (클라이언트 전용) */}
                          <div className="mt-10" ref={projectsSectionRef}>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">내가 등록한 프로젝트</h3>
                            {projectsLoading ? (
                              <div className="text-sm text-gray-500">불러오는 중...</div>
                            ) : projects.length === 0 ? (
                              <div className="text-sm text-gray-500">등록한 프로젝트가 없습니다.</div>
                            ) : (
                              <div className="space-y-3">
                                {projects
                                  .slice((projectsPage - 1) * projectsPageSize, projectsPage * projectsPageSize)
                                  .map((p) => (
                                  <Card key={p.id} className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                          <Link to={`/projects/${p.id}`} className="text-base font-semibold text-gray-900 hover:underline truncate">
                                            {p.title}
                                          </Link>
                                          <Badge variant={(p.status === 'OPEN' ? 'success' : 'secondary')} size="sm">{p.status}</Badge>
                                        </div>
                                        <div className="mt-1 text-sm text-gray-600 line-clamp-2">{p.summary}</div>
                                        <div className="mt-1 text-sm text-gray-600">예산: {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(p.price)} · 기간: {p.duration} · 마감: {p.deadline}</div>
                                        <div className="mt-1 text-xs text-gray-500">
                                          스킬: {p.skills?.map(s => s.name).join(', ') || '-'}
                                        </div>
                                        <div className="mt-0.5 text-xs text-gray-500">
                                          관심사: {p.interests?.map(i => i.name).join(', ') || '-'}
                                        </div>
                                      </div>
                                      <div className="text-xs text-gray-500 whitespace-nowrap">{new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(p.createDate))}</div>
                                    </div>
                                  </Card>
                                ))}
                                {/* pagination controls */}
                                <div className="flex items-center justify-center gap-3 pt-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    disabled={projectsPage <= 1}
                                    onClick={() => {
                                      setProjectsPage((prev) => Math.max(1, prev - 1));
                                      projectsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="rounded-xl"
                                  >
                                    이전
                                  </Button>
                                  <span className="text-sm text-gray-600">
                                    {projectsPage} / {Math.max(1, Math.ceil(projects.length / projectsPageSize))}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    disabled={projectsPage >= Math.ceil(projects.length / projectsPageSize)}
                                    onClick={() => {
                                      const total = Math.max(1, Math.ceil(projects.length / projectsPageSize));
                                      setProjectsPage((prev) => Math.min(total, prev + 1));
                                      projectsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="rounded-xl"
                                  >
                                    다음
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                              label="이름"
                              name="name"
                              value={profileData.name}
                              onChange={handleInputChange}
                              className="rounded-xl"
                            />
                            <Input
                              label="개인 이메일"
                              type="email"
                              name="email"
                              placeholder="개인 연락용 이메일을 입력하세요"
                              value={profileData.email || ''}
                              onChange={handleInputChange}
                              className="rounded-xl"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">직무</label>
                            <Input
                              name="job"
                              value={(profileData as FreelancerProfile).job || ''}
                              onChange={handleInputChange}
                              placeholder="예: 백엔드 개발자"
                              className="rounded-xl"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">경력</label>
                            <div className="grid grid-cols-1 gap-4">
                              {Object.entries((profileData as FreelancerProfile).career || {}).map(([skill, months]) => (
                                <div key={skill} className="flex items-center gap-4">
                                  <Input
                                    name={`skill-${skill}`}
                                    value={skill}
                                    onChange={(e) => {
                                      const newCareer = { ...(profileData as FreelancerProfile).career };
                                      delete newCareer[skill];
                                      newCareer[e.target.value] = months as number;
                                      setProfileData(prev => ({
                                        ...prev,
                                        career: newCareer
                                      }) as FreelancerProfile);
                                    }}
                                    placeholder="기술명"
                                    className="rounded-xl flex-1"
                                  />
                                  <Input
                                    name={`months-${skill}`}
                                    type="number"
                                    value={String(months)}
                                    onChange={(e) => {
                                      setProfileData(prev => ({
                                        ...prev,
                                        career: {
                                          ...(prev as FreelancerProfile).career,
                                          [skill]: parseInt(e.target.value) || 0
                                        }
                                      }) as FreelancerProfile);
                                    }}
                                    placeholder="개월 수"
                                    className="rounded-xl w-32"
                                  />
                                </div>
                              ))}
                              <Button 
                                type="button"
                                onClick={() => {
                                  setProfileData(prev => ({
                                    ...prev,
                                    career: {
                                      ...(prev as FreelancerProfile).career,
                                      '': 0
                                    }
                                  }) as FreelancerProfile);
                                }}
                                className="mt-2"
                              >
                                + 기술 추가
                              </Button>
                            </div>
                          </div>

                          {/* 기술 스택 (편집) */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">기술 스택</label>
                            <div className="space-y-3">
                              {/* 선택된 스킬 표시 */}
                              <div>
                                <div className="text-xs text-gray-600 mb-1">선택된 스킬: {selectedSkillIds.length}개</div>
                                {selectedSkillIds.length > 0 ? (
                                  <div className="flex flex-wrap gap-2">
                                    {allSkills
                                      .filter((s) => selectedSkillIds.includes(s.id))
                                      .map((s) => (
                                        <span
                                          key={`sel-${s.id}`}
                                          className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs cursor-pointer"
                                          onClick={() => setSelectedSkillIds((prev) => prev.filter((id) => id !== s.id))}
                                          title="클릭하여 제거"
                                        >
                                          {s.name}
                                          <i className="ri-close-line"></i>
                                        </span>
                                      ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">아직 선택된 스킬이 없습니다.</p>
                                )}
                              </div>

                              {/* 전체 스킬 토글 목록 */}
                              <div className="flex flex-wrap gap-2 max-h-52 overflow-auto border border-gray-200 rounded-xl p-3">
                                {allSkills.length > 0 ? (
                                  allSkills.map((skill) => {
                                    const active = selectedSkillIds.includes(skill.id);
                                    return (
                                      <button
                                        type="button"
                                        key={skill.id}
                                        onClick={() =>
                                          setSelectedSkillIds((prev) =>
                                            prev.includes(skill.id)
                                              ? prev.filter((id) => id !== skill.id)
                                              : [...prev, skill.id]
                                          )
                                        }
                                        className={`px-2 py-1 rounded text-xs border transition-colors ${
                                          active
                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                      >
                                        {skill.name}
                                      </button>
                                    );
                                  })
                                ) : (
                                  <div className="text-sm text-gray-500">스킬 목록을 불러오는 중이거나, 스킬이 없습니다.</div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">업무용 이메일</label>
                              <Input
                                name="freelancerEmail"
                                type="email"
                                value={(profileData as FreelancerProfile).freelancerEmail || ''}
                                onChange={handleInputChange}
                                placeholder="업무 연락용 이메일을 입력하세요"
                                className="rounded-xl"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">한줄 소개</label>
                              <textarea
                                name="comment"
                                rows={2}
                                placeholder="간단한 자기소개를 작성해주세요"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                value={(profileData as FreelancerProfile).comment || ''}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>

                          {/* 내가 지원한 프로젝트 목록 (프리랜서 전용) */}
                          <div className="mt-10" ref={appsSectionRef}>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">내 지원 현황</h3>
                            {appsLoading ? (
                              <div className="text-sm text-gray-500">불러오는 중...</div>
                            ) : applications.length === 0 ? (
                              <div className="text-sm text-gray-500">지원한 프로젝트가 없습니다.</div>
                            ) : (
                              <div className="space-y-3">
                                {applications
                                  .slice((appsPage - 1) * appsPageSize, appsPage * appsPageSize)
                                  .map((app) => (
                                  <Card key={app.id} className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <Link to={`/projects/${app.projectId}/apply/${app.id}`} className="text-base font-semibold text-gray-900 hover:underline">
                                            {app.projectTitle}
                                          </Link>
                                          <Badge variant={(app.status === 'WAIT' ? 'warning' : app.status === 'ACCEPT' ? 'success' : 'danger')} size="sm">{app.status}</Badge>
                                        </div>
                                        <div className="mt-1 text-sm text-gray-600">예상 급여: {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(app.estimatedPay)}</div>
                                        <div className="mt-0.5 text-sm text-gray-600">예상 기간: {app.expectedDuration}</div>
                                        <div className="mt-0.5 text-sm text-gray-600">근무 계획: {app.workPlan}</div>
                                      </div>
                                      <div className="text-xs text-gray-500 whitespace-nowrap">{new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(app.createDate))}</div>
                                    </div>
                                  </Card>
                                ))}
                                {/* pagination controls */}
                                <div className="flex items-center justify-center gap-3 pt-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    disabled={appsPage <= 1}
                                    onClick={() => {
                                      setAppsPage((prev) => Math.max(1, prev - 1));
                                      appsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="rounded-xl"
                                  >
                                    이전
                                  </Button>
                                  <span className="text-sm text-gray-600">
                                    {appsPage} / {Math.max(1, Math.ceil(applications.length / appsPageSize))}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    disabled={appsPage >= Math.ceil(applications.length / appsPageSize)}
                                    onClick={() => {
                                      const total = Math.max(1, Math.ceil(applications.length / appsPageSize));
                                      setAppsPage((prev) => Math.min(total, prev + 1));
                                      appsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="rounded-xl"
                                  >
                                    다음
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      <div className="flex justify-end space-x-4 pt-8">
                        <Button variant="outline" type="button" className="rounded-xl">
                          취소
                        </Button>
                        <Button type="submit" className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600">
                          저장
                        </Button>
                      </div>
                    </form>
                  </div>
                </>
              )}

              {/* 프로젝트 관리 */}
              {activeTab === 'projects' && (
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                      <i className="ri-briefcase-4-line text-white text-xl"></i>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {userType === 'client' ? '프로젝트 관리' : '지원 현황'}
                      </h2>
                      <p className="text-gray-600">
                        {userType === 'client' ? '내가 등록한 프로젝트를 확인하고 상태별로 살펴보세요.' : '내가 지원한 프로젝트를 상태별로 확인해보세요.'}
                      </p>
                    </div>
                  </div>

                  {userType === 'client' ? (
                    <>
                      {/* 상태 필터 */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {[
                          { key: 'all', label: '전체' },
                          { key: 'OPEN', label: '모집중' },
                          { key: 'IN_PROGRESS', label: '진행중' },
                          { key: 'COMPLETED', label: '완료' },
                          { key: 'CLOSED', label: '마감' },
                        ].map(({ key, label }) => (
                          <Button
                            key={key}
                            type="button"
                            variant={projectStatusFilter === (key as any) ? 'primary' : 'outline'}
                            size="sm"
                            className="rounded-xl"
                            onClick={() => setProjectStatusFilter(key as any)}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>

                      {/* 목록 */}
                      <div className="space-y-3">
                        {(projectStatusFilter === 'all'
                          ? projects
                          : projects.filter((p) => p.status === projectStatusFilter)
                        ).map((p) => (
                          <Card key={p.id} className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <Link to={`/projects/${p.id}`} className="text-base font-semibold text-gray-900 hover:underline truncate">
                                    {p.title}
                                  </Link>
                                  <Badge
                                    variant={p.status === 'OPEN' ? 'success' : p.status === 'IN_PROGRESS' ? 'warning' : p.status === 'COMPLETED' ? 'primary' : 'secondary'}
                                    size="sm"
                                  >
                                    {p.status === 'OPEN' ? '모집중' : p.status === 'IN_PROGRESS' ? '진행중' : p.status === 'COMPLETED' ? '완료' : '마감'}
                                  </Badge>
                                </div>
                                <div className="mt-1 text-sm text-gray-600 line-clamp-2">{p.summary}</div>
                                <div className="mt-1 text-sm text-gray-600">예산: {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(p.price)} · 기간: {p.duration} · 마감: {p.deadline}</div>
                                <div className="mt-1 text-xs text-gray-500">스킬: {p.skills?.map((s) => s.name).join(', ') || '-'}</div>
                                <div className="mt-0.5 text-xs text-gray-500">관심사: {p.interests?.map((i) => i.name).join(', ') || '-'}</div>
                              </div>
                              <div className="text-xs text-gray-500 whitespace-nowrap">
                                {new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(p.createDate))}
                              </div>
                            </div>
                          </Card>
                        ))}
                        {(
                          (projectStatusFilter === 'all' ? projects : projects.filter((p) => p.status === projectStatusFilter)).length === 0
                        ) && <div className="text-sm text-gray-500">표시할 프로젝트가 없습니다.</div>}
                      </div>
                    </>
                  ) : (
                    // 프리랜서 지원 현황
                    <>
                      {/* 상태 필터 */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {[
                          { key: 'all', label: '전체' },
                          { key: 'WAIT', label: '대기중' },
                          { key: 'ACCEPT', label: '승인됨' },
                          { key: 'DENIED', label: '거절됨' },
                        ].map(({ key, label }) => (
                          <Button
                            key={key}
                            type="button"
                            variant={applicationStatusFilter === (key as any) ? 'primary' : 'outline'}
                            size="sm"
                            className="rounded-xl"
                            onClick={() => setApplicationStatusFilter(key as any)}
                          >
                            {label}
                          </Button>
                        ))}
                      </div>

                      {/* 목록 */}
                      <div className="space-y-3">
                        {(applicationStatusFilter === 'all'
                          ? applications
                          : applications.filter((a) => a.status === applicationStatusFilter)
                        ).map((app) => (
                          <Card key={app.id} className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Link to={`/projects/${app.projectId}/apply/${app.id}`} className="text-base font-semibold text-gray-900 hover:underline">
                                    {app.projectTitle}
                                  </Link>
                                  <Badge variant={app.status === 'WAIT' ? 'warning' : app.status === 'ACCEPT' ? 'success' : 'danger'} size="sm">{app.status}</Badge>
                                </div>
                                <div className="mt-1 text-sm text-gray-600">예상 급여: {new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(app.estimatedPay)}</div>
                                <div className="mt-0.5 text-sm text-gray-600">예상 기간: {app.expectedDuration}</div>
                                <div className="mt-0.5 text-sm text-gray-600">근무 계획: {app.workPlan}</div>
                              </div>
                              <div className="text-xs text-gray-500 whitespace-nowrap">{new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(app.createDate))}</div>
                            </div>
                          </Card>
                        ))}
                        {(
                          (applicationStatusFilter === 'all' ? applications : applications.filter((a) => a.status === applicationStatusFilter)).length === 0
                        ) && <div className="text-sm text-gray-500">표시할 지원 내역이 없습니다.</div>}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* 북마크 관리 */}
              {activeTab === 'bookmarks' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    {userType === 'client' ? '관심 프리랜서' : '관심 프로젝트'}
                  </h2>

                  {userType === 'client' ? (
                    // 클라이언트 - 관심 프리랜서
                    <div className="space-y-4">
                      {bookmarkedFreelancers.map((freelancer) => (
                        <div key={freelancer.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                {freelancer.name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{freelancer.name}</h4>
                                <p className="text-sm text-gray-600">{freelancer.experience}</p>
                                <div className="flex items-center mt-1">
                                  <i className="ri-star-fill text-yellow-400 mr-1"></i>
                                  <span className="text-sm">{freelancer.averageRating}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Link to={`/freelancers/${freelancer.id}`}>
                                <Button variant="outline" size="sm">
                                  <i className="ri-user-line mr-1"></i>
                                  프로필 보기
                                </Button>
                              </Link>
                              <Link to={`/freelancers/${freelancer.id}/propose`}>
                                <Button size="sm">
                                  <i className="ri-send-plane-line mr-1"></i>
                                  제안하기
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeBookmark(freelancer.id, 'freelancer')}
                              >
                                <i className="ri-heart-fill text-red-500"></i>
                              </Button>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="flex flex-wrap gap-1">
                              {freelancer.skills.slice(0, 4).map((skill) => (
                                <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}

                      {bookmarkedFreelancers.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <i className="ri-heart-line text-4xl mb-2"></i>
                          <p>관심 프리랜서가 없습니다.</p>
                          <Link to="/freelancers">
                            <Button variant="outline" className="mt-3">
                              프리랜서 찾아보기
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    // 프리랜서 - 관심 프로젝트
                    <div className="space-y-4">
                      {bookmarkedProjects.map((project) => (
                        <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">{project.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                              <p className="text-sm text-gray-500 mt-1">{project.clientName}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  project.status === '모집중'
                                    ? 'bg-green-100 text-green-800'
                                    : project.status === '진행중'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {project.status}
                              </span>
                              <Button variant="outline" size="sm" onClick={() => removeBookmark(project.id, 'project')}>
                                <i className="ri-heart-fill text-red-500"></i>
                              </Button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex space-x-4 text-sm text-gray-600">
                              <span>예산: {project.budget}</span>
                              <span>기간: {project.duration}</span>
                              <span>마감: {project.deadline}</span>
                            </div>

                            <div className="flex space-x-2">
                              <Link to={`/projects/${project.id}`}>
                                <Button variant="outline" size="sm">
                                  상세보기
                                </Button>
                              </Link>
                              {project.status === '모집중' && (
                                <Link to={`/projects/${project.id}/apply`}>
                                  <Button size="sm">지원하기</Button>
                                </Link>
                              )}
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="flex flex-wrap gap-1">
                              {project.skills.slice(0, 4).map((skill) => (
                                <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}

                      {bookmarkedProjects.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <i className="ri-heart-line text-4xl mb-2"></i>
                          <p>관심 프로젝트가 없습니다.</p>
                          <Link to="/projects">
                            <Button variant="outline" className="mt-3">
                              프로젝트 찾아보기
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 피드백 관리 */}
              {activeTab === 'feedback' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">피드백 관리</h2>

                  <div className="space-y-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <i className="ri-star-fill text-yellow-400 text-xl mr-2"></i>
                        <span className="text-lg font-semibold text-gray-900">
                          평균 평점: {(profileData as any).ratingAvg ?? (profileData as any).averageRating ?? 0}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        총{' '}
                        {mockFeedback.filter((f) =>
                          userType === 'client' ? f.targetType === 'client' : f.targetType === 'freelancer',
                        ).length}{' '}
                        개의 리뷰
                      </p>
                    </div>

                    <div className="space-y-4">
                      {mockFeedback
                        .filter((feedback) =>
                          userType === 'client' ? feedback.targetType === 'client' : feedback.targetType === 'freelancer',
                        )
                        .map((feedback) => (
                          <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-900">{feedback.projectName}</h4>
                                <p className="text-sm text-gray-600">작성자: {feedback.authorName}</p>
                                <p className="text-xs text-gray-500">작성일: {feedback.createdAt}</p>
                              </div>
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <i
                                    key={star}
                                    className={`ri-star-${star <= feedback.rating ? 'fill' : 'line'} text-yellow-400`}
                                  ></i>
                                ))}
                                <span className="ml-2 font-medium">{feedback.rating}</span>
                              </div>
                            </div>

                            <p className="text-gray-700 mb-3">{feedback.feedback}</p>

                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div className="text-center">
                                <span className="text-gray-600">커뮤니케이션</span>
                                <div className="font-medium">{feedback.categories.communication}/5</div>
                              </div>
                              <div className="text-center">
                                <span className="text-gray-600">
                                  {userType === 'client' ? '프로젝트 관리' : '기술력'}
                                </span>
                                <div className="font-medium">{feedback.categories.technical}/5</div>
                              </div>
                              <div className="text-center">
                                <span className="text-gray-600">일정 준수</span>
                                <div className="font-medium">{feedback.categories.schedule}/5</div>
                              </div>
                              {feedback.categories.paymentCompliance && (
                                <div className="text-center">
                                  <span className="text-gray-600">급여 준수</span>
                                  <div className="font-medium">{feedback.categories.paymentCompliance}/5</div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
