import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/base/Button';
import Card from '../../components/base/Card';
import Badge from '../../components/base/Badge';
import Input from '../../components/base/Input';
import Select from '../../components/base/Select';
// removed unused profile types import
import { client } from '@/lib/backend/client';
import { useAuth } from '@/context/AuthContext';

interface BaseProfile {
  username: string;
  name: string;
  role: 'CLIENT' | 'FREELANCER';
  createdAt: string;
  ratingAvg: number;
  email: string;
  profileScope?: 'PUBLIC' | 'PRIVATE';
}

interface FreelancerProfile extends BaseProfile {
  role: 'FREELANCER';
  job: string;
  career: { [key: string]: number };  // e.g., { "JPA": 30, "Spring": 24 }
  freelancerEmail: string;
  comment: string;
}

interface ClientProfile extends BaseProfile {
  role: 'CLIENT';
  companyName: string;
  companySize: 'STARTUP' | 'MEDIUM' | 'LARGE';
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
  status: 'WAIT' | 'ACCEPT' | 'DENIED'; // 백엔드와 동일한 상태값 사용
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
  const defaultFreelancerProfile: FreelancerProfile = {
    username: '',
    name: '',
    role: 'FREELANCER',
    createdAt: '',
    ratingAvg: 0,
    email: '',
    profileScope: 'PUBLIC',
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
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<MyApplicationItem[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [projects, setProjects] = useState<MyProjectItem[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  
  // pagination states (client-side)
  const [appsPage, setAppsPage] = useState(1);
  const [appsPageSize] = useState(5);
  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsPageSize] = useState(5);

  // section refs for smooth scroll on page change
  const appsSectionRef = useRef<HTMLDivElement>(null);
  const projectsSectionRef = useRef<HTMLDivElement>(null);

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

  // recalc current page if data length shrinks
  useEffect(() => {
    const total = Math.max(1, Math.ceil(applications.length / appsPageSize));
    if (appsPage > total) setAppsPage(total);
  }, [applications, appsPage, appsPageSize]);

  useEffect(() => {
    const total = Math.max(1, Math.ceil(projects.length / projectsPageSize));
    if (projectsPage > total) setProjectsPage(total);
  }, [projects, projectsPage, projectsPageSize]);

  // 포맷터들
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(value);

  const formatDateTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      }).format(d);
    } catch {
      return iso;
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric', month: '2-digit', day: '2-digit'
      }).format(d);
    } catch {
      return iso;
    }
  };

  const statusVariant = (status: string): 'primary' | 'secondary' | 'success' | 'danger' | 'warning' => {
    switch (status) {
      case 'WAIT':
        return 'warning';
      case 'ACCEPT':
      case 'ACCEPTED':
        return 'success';
      case 'DENIED':
      case 'REJECTED':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // 프로젝트 상태 배지 색상 (CLIENT 전용 프로젝트 목록)
  const projectStatusVariant = (status: string): 'primary' | 'secondary' | 'success' | 'danger' | 'warning' => {
    switch (status) {
      case 'OPEN':
        return 'success';
      case 'CLOSED':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // access token을 쿠키에서 가져오기
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

        console.log('Profile Response:', data); // 응답 데이터 확인

        if (error) {
          console.error('API Error:', error); // 에러 상세 확인
          throw error;
        }

        if (!data) {
          throw new Error('프로필 데이터가 없습니다.');
        }

        if (data.resultCode === '200-7') {
          console.log('Server Response Data:', data.data);
          // 서버 응답 데이터로 상태 업데이트
          const responseData = data.data;
          setProfileData(prev => ({
            ...prev,
            ...responseData,
            profileScope: (responseData as any)?.profileScope || 'PUBLIC',
            // Role에 따른 필드 초기화
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
          console.error('Unexpected result code:', data.resultCode);
          throw new Error('프로필 조회에 실패했습니다.');
        }
      } catch (error: any) {
        console.error('프로필 조회 에러:', error);
        if (error?.data?.resultCode === '401-1') {
           navigate('/login');
        } else {
          alert('프로필 조회에 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchProfile();
    }
  }, [isLoggedIn, navigate]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Current Profile Data:', profileData);

      const updateData = profileData.role === 'CLIENT' ? {
        name: profileData.companyName || profileData.name || '',
        profileScope: profileData.profileScope || 'PUBLIC',
        companyName: profileData.companyName || profileData.name || '',
        companySize: profileData.companySize || 'STARTUP',
        companyDescription: profileData.companyDescription || '',
        representative: profileData.representative || '',
        businessNo: profileData.businessNo || '',
        companyPhone: profileData.companyPhone || '',
        companyEmail: profileData.companyEmail || '',
        email: profileData.email || '' // 개인 이메일 포함
      } : {
        name: profileData.name || '',
        profileScope: profileData.profileScope || 'PUBLIC',
        job: profileData.job || '',
        freelancerEmail: profileData.freelancerEmail || '',
        comment: profileData.comment || '',
        career: profileData.career || {}
      };

      console.log('Update Request Data:', updateData);

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
      console.error('프로필 수정 에러:', error);
      if (error?.data?.resultCode === '401-1') {
        alert('로그인이 필요한 서비스입니다.');
        navigate('/login');
      } else {
        alert('프로필 수정에 실패했습니다.');
      }
    }
  };

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

  if (isLoading) {
    return <div>로딩 중...</div>;
  }



  const companySizeOptions = [
    { label: '스타트업', value: 'STARTUP' },
    { label: '중소기업', value: 'SMALL' },
    { label: '중견기업', value: 'MEDIUM' },
    { label: '대기업', value: 'LARGE' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 프로필 */}
        <div className="bg-white shadow-lg rounded-lg p-6">
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
                  <div className="w-32 h-32 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                    {profileData.name.charAt(0)}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors shadow-lg border-2 border-indigo-100">
                  <i className="ri-camera-line text-gray-600"></i>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-3">프로필 사진을 업로드하세요</p>
              {profileData.createdAt && (
                <p className="text-xs text-gray-400 mt-1">등록일: {formatDate(profileData.createdAt)}</p>
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
                    value={profileData.companyName || ''}
                    onChange={handleInputChange}
                    className="rounded-xl"
                  />
                  <Select
                    label="회사 규모"
                    value={profileData.companySize || ''}
                    onChange={handleSelectChange('companySize')}
                    options={companySizeOptions}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">회사 소개</label>
                  <textarea
                    name="companyDescription"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    value={profileData.companyDescription || ''}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="연락처"
                    name="companyPhone"
                    value={profileData.companyPhone || ''}
                    onChange={handleInputChange}
                    className="rounded-xl"
                  />
                  <Input
                    label="회사 이메일"
                    type="email"
                    name="companyEmail"
                    placeholder="회사 업무용 이메일을 입력하세요"
                    value={profileData.companyEmail || ''}
                    onChange={handleInputChange}
                    className="rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="대표자명"
                    name="representative"
                    value={profileData.representative || ''}
                    onChange={handleInputChange}
                    className="rounded-xl"
                  />
                  <Input
                    label="사업자등록번호"
                    name="businessNo"
                    value={profileData.businessNo || ''}
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
                                <Badge variant={projectStatusVariant(p.status)} size="sm">{p.status}</Badge>
                              </div>
                              <div className="mt-1 text-sm text-gray-600 line-clamp-2">{p.summary}</div>
                              <div className="mt-1 text-sm text-gray-600">예산: {formatCurrency(p.price)} · 기간: {p.duration} · 마감: {p.deadline}</div>
                              <div className="mt-1 text-xs text-gray-500">
                                스킬: {p.skills?.map(s => s.name).join(', ') || '-'}
                              </div>
                              <div className="mt-0.5 text-xs text-gray-500">
                                관심사: {p.interests?.map(i => i.name).join(', ') || '-'}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 whitespace-nowrap">{formatDateTime(p.createDate)}</div>
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
                            setProjectsPage((p) => Math.max(1, p - 1));
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
                            setProjectsPage((p) => Math.min(total, p + 1));
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
                    value={profileData.job || ''}
                    onChange={handleInputChange}
                    placeholder="예: 백엔드 개발자"
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">기술 스택 및 경력</label>
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(profileData.career || {}).map(([skill, months]) => (
                      <div key={skill} className="flex items-center gap-4">
                        <Input
                          name={`skill-${skill}`}
                          value={skill}
                          onChange={(e) => {
                            const newCareer = { ...profileData.career };
                            delete newCareer[skill];
                            newCareer[e.target.value] = months;
                            setProfileData(prev => ({
                              ...prev,
                              career: newCareer
                            }));
                          }}
                          placeholder="기술명"
                          className="rounded-xl flex-1"
                        />
                        <Input
                          name={`months-${skill}`}
                          type="number"
                          value={String(months)}
                          onChange={(e) => {
                            if (profileData.role === 'FREELANCER') {
                              setProfileData(prev => ({
                                ...prev,
                                career: {
                                  ...(prev as FreelancerProfile).career,
                                  [skill]: parseInt(e.target.value) || 0
                                }
                              } as FreelancerProfile));
                            }
                          }}
                          placeholder="개월 수"
                          className="rounded-xl w-32"
                        />
                      </div>
                    ))}
                    <Button 
                      type="button"
                      onClick={() => {
                        if (profileData.role === 'FREELANCER') {
                          setProfileData(prev => ({
                            ...prev,
                            career: {
                              ...(prev as FreelancerProfile).career,
                              '': 0
                            }
                          } as FreelancerProfile));
                        }
                      }}
                      className="mt-2"
                    >
                      + 기술 추가
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">업무용 이메일</label>
                    <Input
                      name="freelancerEmail"
                      type="email"
                      value={profileData.freelancerEmail || ''}
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
                      value={profileData.comment || ''}
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
                                <Link to={`/projects/${app.projectId}`} className="text-base font-semibold text-gray-900 hover:underline">
                                  {app.projectTitle}
                                </Link>
                                <Badge variant={statusVariant(app.status)} size="sm">{app.status}</Badge>
                              </div>
                              <div className="mt-1 text-sm text-gray-600">예상 급여: {formatCurrency(app.estimatedPay)}</div>
                              <div className="mt-0.5 text-sm text-gray-600">예상 기간: {app.expectedDuration}</div>
                              <div className="mt-0.5 text-sm text-gray-600">근무 계획: {app.workPlan}</div>
                            </div>
                            <div className="text-xs text-gray-500 whitespace-nowrap">{formatDateTime(app.createDate)}</div>
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
                            setAppsPage((p) => Math.max(1, p - 1));
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
                            setAppsPage((p) => Math.min(total, p + 1));
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
      </div>
    </div>
  );
}
