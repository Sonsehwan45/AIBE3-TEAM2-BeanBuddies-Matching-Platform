
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  mockUsers,
  mockProjects,
  mockFreelancers,
  mockFeedback,
  mockFreelancerApplications,
} from '../../mocks/users';
import Button from '../../components/base/Button';
import Input from '../../components/base/Input';
import Select from '../../components/base/Select';

interface MyPageProps {
  userType?: 'client' | 'freelancer';
}

export default function MyPage({ userType = 'client' }: MyPageProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'bookmarks' | 'feedback'>(
    'profile',
  );
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [projectStatusFilter, setProjectStatusFilter] = useState<
    'all' | '모집중' | '진행중' | '완료'
  >('all');
  const [applicationStatusFilter, setApplicationStatusFilter] = useState<
    'all' | '대기중' | '거절' | '진행중' | '완료'
  >('all');
  const [profileData, setProfileData] = useState(
    userType === 'client' ? mockUsers.client : mockUsers.freelancer,
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    alert('프로필이 성공적으로 업데이트되었습니다!');
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

  const myProjects = mockProjects.filter((p) => p.clientId === 1);
  const completedProjects = myProjects.filter((p) => p.status === '완료');

  // 프로젝트 상태별 필터링
  const filteredProjects =
    projectStatusFilter === 'all' ? myProjects : myProjects.filter((p) => p.status === projectStatusFilter);

  // 프리랜서의 지원 현황 필터링
  const filteredApplications =
    applicationStatusFilter === 'all'
      ? mockFreelancerApplications
      : mockFreelancerApplications.filter((app) => app.status === applicationStatusFilter);

  // 프로젝트 상태 변경
  const updateProjectStatus = (projectId: number, newStatus: string) => {
    console.log(`프로젝트 ${projectId} 상태를 ${newStatus}로 변경`);
    alert(`프로젝트 상태가 ${newStatus}로 변경되었습니다.`);
  };

  // 북마크된 프리랜서/프로젝트 (임시 데이터)
  const bookmarkedFreelancers = mockFreelancers.slice(0, 3);
  const bookmarkedProjects = mockProjects.slice(0, 3);

  const removeBookmark = (id: number, type: 'freelancer' | 'project') => {
    console.log(`${type} ${id} 북마크 해제`);
    alert('북마크가 해제되었습니다.');
  };

  const updateApplicantStatus = (applicantId: number, status: 'approved' | 'rejected') => {
    console.log(`지원자 ${applicantId} 상태를 ${status}로 변경`);
    alert(`지원자 상태가 ${status === 'approved' ? '승인' : '거절'}으로 변경되었습니다.`);
  };

  // 프로젝트 통계
  const projectStats = {
    total: myProjects.length,
    recruiting: myProjects.filter((p) => p.status === '모집중').length,
    inProgress: myProjects.filter((p) => p.status === '진행중').length,
    completed: myProjects.filter((p) => p.status === '완료').length,
  };

  // 지원 현황 통계 (프리랜서용)
  const applicationStats = {
    total: mockFreelancerApplications.length,
    waiting: mockFreelancerApplications.filter((app) => app.status === '대기중').length,
    rejected: mockFreelancerApplications.filter((app) => app.status === '거절').length,
    inProgress: mockFreelancerApplications.filter((app) => app.status === '진행중').length,
    completed: mockFreelancerApplications.filter((app) => app.status === '완료').length,
  };

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
                  <span className="font-bold text-lg text-gray-900">{profileData.averageRating}</span>
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
                  {/* 기존 코드 삽입 시작 */}
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
                      </div>

                      {/* 나머지 프로필 폼 내용은 동일 */}
                      {userType === 'client' ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                              label="회사명"
                              value={profileData.companyName || ''}
                              onChange={(e) => setProfileData((prev) => ({ ...prev, companyName: e.target.value }))}
                              className="rounded-xl"
                            />
                            <Select
                              label="회사 규모"
                              options={[
                                { value: '스타트업', label: '스타트업 (1-10명)' },
                                { value: '중소기업', label: '중소기업 (11-50명)' },
                                { value: '중견기업', label: '중견기업 (51-300명)' },
                                { value: '대기업', label: '대기업 (300명 이상)' },
                              ]}
                              value={profileData.companySize || ''}
                              onChange={(value) => setProfileData((prev) => ({ ...prev, companySize: value }))}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">회사 소개</label>
                            <textarea
                              rows={4}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                              value={profileData.companyDescription || ''}
                              onChange={(e) =>
                                setProfileData((prev) => ({ ...prev, companyDescription: e.target.value }))
                              }
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                              label="연락처"
                              value={profileData.contact || ''}
                              onChange={(e) => setProfileData((prev) => ({ ...prev, contact: e.target.value }))}
                              className="rounded-xl"
                            />
                            <Input
                              label="이메일"
                              type="email"
                              value={profileData.email}
                              onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                              className="rounded-xl"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                              label="대표자명"
                              value={profileData.representative || ''}
                              onChange={(e) => setProfileData((prev) => ({ ...prev, representative: e.target.value }))}
                              className="rounded-xl"
                            />
                            <Input
                              label="사업자등록번호"
                              value={profileData.businessNumber || ''}
                              onChange={(e) => setProfileData((prev) => ({ ...prev, businessNumber: e.target.value }))}
                              className="rounded-xl"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                              label="이름"
                              value={profileData.name}
                              onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                              className="rounded-xl"
                            />
                            <Input
                              label="이메일"
                              type="email"
                              value={profileData.email}
                              onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                              className="rounded-xl"
                            />
                          </div>

                          <Input
                            label="경력"
                            value={profileData.experience || ''}
                            onChange={(e) => setProfileData((prev) => ({ ...prev, experience: e.target.value }))}
                            className="rounded-xl"
                          />

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">기술 스택</label>
                            <div className="flex flex-wrap gap-2 p-4 border border-gray-200 rounded-xl bg-gray-50">
                              {(profileData.skills || []).map((skill: string, index: number) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-white text-indigo-700 rounded-full text-sm border border-indigo-200 shadow-sm flex items-center"
                                >
                                  {skill}
                                  <button className="ml-2 text-indigo-400 hover:text-indigo-600 cursor-pointer">×</button>
                                </span>
                              ))}
                              <input
                                type="text"
                                placeholder="새 기술 스택 추가..."
                                className="border-none outline-none text-sm bg-transparent"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">관심 분야</label>
                            <div className="flex flex-wrap gap-2 p-4 border border-gray-200 rounded-xl bg-gray-50">
                              {(profileData.interests || []).map((interest: string, index: number) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm border border-gray-200 shadow-sm flex items-center"
                                >
                                  {interest}
                                  <button className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer">×</button>
                                </span>
                              ))}
                              <input
                                type="text"
                                placeholder="새 관심 분야 추가..."
                                className="border-none outline-none text-sm bg-transparent"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">자기소개</label>
                            <textarea
                              rows={4}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                              value={profileData.introduction || ''}
                              onChange={(e) => setProfileData((prev) => ({ ...prev, introduction: e.target.value }))}
                            />
                          </div>

                          {/* 파일 업로드 섹션 */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">문서 관리</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="border-2 border-dashed border-indigo-200 rounded-xl p-6 text-center bg-indigo-50/50">
                                <i className="ri-file-text-line text-3xl text-indigo-400 mb-3"></i>
                                <p className="text-sm text-gray-700 mb-3 font-medium">이력서</p>
                                <Button variant="outline" size="sm" className="rounded-xl">
                                  업로드
                                </Button>
                                <div className="mt-3">
                                  <label className="flex items-center justify-center text-xs text-gray-500">
                                    <input type="checkbox" className="mr-1" />
                                    비공개
                                  </label>
                                </div>
                              </div>

                              <div className="border-2 border-dashed border-green-200 rounded-xl p-6 text-center bg-green-50/50">
                                <i className="ri-article-line text-3xl text-green-400 mb-3"></i>
                                <p className="text-sm text-gray-700 mb-3 font-medium">자기소개서</p>
                                <Button variant="outline" size="sm" className="rounded-xl">
                                  업로드
                                </Button>
                                <div className="mt-3">
                                  <label className="flex items-center justify-center text-xs text-gray-500">
                                    <input type="checkbox" className="mr-1" />
                                    공개
                                  </label>
                                </div>
                              </div>

                              <div className="border-2 border-dashed border-purple-200 rounded-xl p-6 text-center bg-purple-50/50">
                                <i className="ri-folder-line text-3xl text-purple-400 mb-3"></i>
                                <p className="text-sm text-gray-700 mb-3 font-medium">포트폴리오</p>
                                <Button variant="outline" size="sm" className="rounded-xl">
                                  업로드
                                </Button>
                                <div className="mt-3">
                                  <label className="flex items-center justify-center text-xs text-gray-500">
                                    <input type="checkbox" className="mr-1" />
                                    공개
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="flex justify-end space-x-4 pt-8">
                        <Button variant="outline" className="rounded-xl">
                          취소
                        </Button>
                        <Button type="submit" className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600">
                          저장
                        </Button>
                      </div>
                    </form>
                  </div>
                  {/* 기존 코드 삽입 끝 */}

                  {/* 추가된 새 프로필 관리 UI */}
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
                      </div>

                      {/* 나머지 프로필 폼 내용은 동일 */}
                      {userType === 'client' ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                              label="회사명"
                              value={profileData.companyName || ''}
                              onChange={(e) => setProfileData((prev) => ({ ...prev, companyName: e.target.value }))}
                              className="rounded-xl"
                            />
                            <Select
                              label="회사 규모"
                              options={[
                                { value: '스타트업', label: '스타트업 (1-10명)' },
                                { value: '중소기업', label: '중소기업 (11-50명)' },
                                { value: '중견기업', label: '중견기업 (51-300명)' },
                                { value: '대기업', label: '대기업 (300명 이상)' },
                              ]}
                              value={profileData.companySize || ''}
                              onChange={(value) => setProfileData((prev) => ({ ...prev, companySize: value }))}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">회사 소개</label>
                            <textarea
                              rows={4}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                              value={profileData.companyDescription || ''}
                              onChange={(e) =>
                                setProfileData((prev) => ({ ...prev, companyDescription: e.target.value }))
                              }
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                              label="연락처"
                              value={profileData.contact || ''}
                              onChange={(e) => setProfileData((prev) => ({ ...prev, contact: e.target.value }))}
                              className="rounded-xl"
                            />
                            <Input
                              label="이메일"
                              type="email"
                              value={profileData.email}
                              onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                              className="rounded-xl"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                              label="대표자명"
                              value={profileData.representative || ''}
                              onChange={(e) => setProfileData((prev) => ({ ...prev, representative: e.target.value }))}
                              className="rounded-xl"
                            />
                            <Input
                              label="사업자등록번호"
                              value={profileData.businessNumber || ''}
                              onChange={(e) => setProfileData((prev) => ({ ...prev, businessNumber: e.target.value }))}
                              className="rounded-xl"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                              label="이름"
                              value={profileData.name}
                              onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                              className="rounded-xl"
                            />
                            <Input
                              label="이메일"
                              type="email"
                              value={profileData.email}
                              onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                              className="rounded-xl"
                            />
                          </div>

                          <Input
                            label="경력"
                            value={profileData.experience || ''}
                            onChange={(e) => setProfileData((prev) => ({ ...prev, experience: e.target.value }))}
                            className="rounded-xl"
                          />

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">기술 스택</label>
                            <div className="flex flex-wrap gap-2 p-4 border border-gray-200 rounded-xl bg-gray-50">
                              {(profileData.skills || []).map((skill: string, index: number) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-white text-indigo-700 rounded-full text-sm border border-indigo-200 shadow-sm flex items-center"
                                >
                                  {skill}
                                  <button className="ml-2 text-indigo-400 hover:text-indigo-600 cursor-pointer">×</button>
                                </span>
                              ))}
                              <input
                                type="text"
                                placeholder="새 기술 스택 추가..."
                                className="border-none outline-none text-sm bg-transparent"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">관심 분야</label>
                            <div className="flex flex-wrap gap-2 p-4 border border-gray-200 rounded-xl bg-gray-50">
                              {(profileData.interests || []).map((interest: string, index: number) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm border border-gray-200 shadow-sm flex items-center"
                                >
                                  {interest}
                                  <button className="ml-2 text-gray-400 hover:text-gray-600 cursor-pointer">×</button>
                                </span>
                              ))}
                              <input
                                type="text"
                                placeholder="새 관심 분야 추가..."
                                className="border-none outline-none text-sm bg-transparent"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">자기소개</label>
                            <textarea
                              rows={4}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                              value={profileData.introduction || ''}
                              onChange={(e) => setProfileData((prev) => ({ ...prev, introduction: e.target.value }))}
                            />
                          </div>

                          {/* 파일 업로드 섹션 */}
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900">문서 관리</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="border-2 border-dashed border-indigo-200 rounded-xl p-6 text-center bg-indigo-50/50">
                                <i className="ri-file-text-line text-3xl text-indigo-400 mb-3"></i>
                                <p className="text-sm text-gray-700 mb-3 font-medium">이력서</p>
                                <Button variant="outline" size="sm" className="rounded-xl">
                                  업로드
                                </Button>
                                <div className="mt-3">
                                  <label className="flex items-center justify-center text-xs text-gray-500">
                                    <input type="checkbox" className="mr-1" />
                                    비공개
                                  </label>
                                </div>
                              </div>

                              <div className="border-2 border-dashed border-green-200 rounded-xl p-6 text-center bg-green-50/50">
                                <i className="ri-article-line text-3xl text-green-400 mb-3"></i>
                                <p className="text-sm text-gray-700 mb-3 font-medium">자기소개서</p>
                                <Button variant="outline" size="sm" className="rounded-xl">
                                  업로드
                                </Button>
                                <div className="mt-3">
                                  <label className="flex items-center justify-center text-xs text-gray-500">
                                    <input type="checkbox" className="mr-1" />
                                    공개
                                  </label>
                                </div>
                              </div>

                              <div className="border-2 border-dashed border-purple-200 rounded-xl p-6 text-center bg-purple-50/50">
                                <i className="ri-folder-line text-3xl text-purple-400 mb-3"></i>
                                <p className="text-sm text-gray-700 mb-3 font-medium">포트폴리오</p>
                                <Button variant="outline" size="sm" className="rounded-xl">
                                  업로드
                                </Button>
                                <div className="mt-3">
                                  <label className="flex items-center justify-center text-xs text-gray-500">
                                    <input type="checkbox" className="mr-1" />
                                    공개
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="flex justify-end space-x-4 pt-8">
                        <Button variant="outline" className="rounded-xl">
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
                <div className="h-full">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                          <i className="ri-briefcase-4-line text-white text-xl"></i>
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold text-gray-900">
                            {userType === 'client' ? '프로젝트 관리' : '지원 현황'}
                          </h2>
                          <p className="text-gray-600">
                            {userType === 'client'
                              ? '프로젝트 현황을 한눈에 확인하고 관리하세요'
                              : '지원한 프로젝트 현황을 확인하세요'}
                          </p>
                        </div>
                      </div>
                      {userType === 'client' && (
                        <Button className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3">
                          <i className="ri-add-line mr-2"></i>
                          새 프로젝트 등록
                        </Button>
                      )}
                    </div>

                    {userType === 'client' ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-blue-100 text-sm font-medium">전체 프로젝트</p>
                                <p className="text-3xl font-bold">{projectStats.total}</p>
                              </div>
                              <i className="ri-briefcase-4-line text-3xl text-blue-200"></i>
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-green-100 text-sm font-medium">모집중</p>
                                <p className="text-3xl font-bold">{projectStats.recruiting}</p>
                              </div>
                              <i className="ri-user-add-line text-3xl text-green-200"></i>
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-yellow-100 text-sm font-medium">진행중</p>
                                <p className="text-3xl font-bold">{projectStats.inProgress}</p>
                              </div>
                              <i className="ri-play-circle-line text-3xl text-yellow-200"></i>
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-purple-100 text-sm font-medium">완료</p>
                                <p className="text-3xl font-bold">{projectStats.completed}</p>
                              </div>
                              <i className="ri-check-double-line text-3xl text-purple-200"></i>
                            </div>
                          </div>
                        </div>

                        {/* 상태 필터 */}
                        <div className="flex space-x-2">
                          {['all', '모집중', '진행중', '완료'].map((status) => (
                            <button
                              key={status}
                              onClick={() => setProjectStatusFilter(status as any)}
                              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                                projectStatusFilter === status
                                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {status === 'all' ? '전체' : status}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-blue-100 text-sm font-medium">전체</p>
                                <p className="text-3xl font-bold">{applicationStats.total}</p>
                              </div>
                              <i className="ri-briefcase-4-line text-3xl text-blue-200"></i>
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-yellow-100 text-sm font-medium">대기중</p>
                                <p className="text-3xl font-bold">{applicationStats.waiting}</p>
                              </div>
                              <i className="ri-time-line text-3xl text-yellow-200"></i>
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-red-100 text-sm font-medium">거절</p>
                                <p className="text-3xl font-bold">{applicationStats.rejected}</p>
                              </div>
                              <i className="ri-close-circle-line text-3xl text-red-200"></i>
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-green-100 text-sm font-medium">진행중</p>
                                <p className="text-3xl font-bold">{applicationStats.inProgress}</p>
                              </div>
                              <i className="ri-play-circle-line text-3xl text-green-200"></i>
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-purple-100 text-sm font-medium">완료</p>
                                <p className="text-3xl font-bold">{applicationStats.completed}</p>
                              </div>
                              <i className="ri-check-double-line text-3xl text-purple-200"></i>
                            </div>
                          </div>
                        </div>

                        {/* 상태 필터 */}
                        <div className="flex space-x-2">
                          {['all', '대기중', '거절', '진행중', '완료'].map((status) => (
                            <button
                              key={status}
                              onClick={() => setApplicationStatusFilter(status as any)}
                              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                                applicationStatusFilter === status
                                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {status === 'all' ? '전체' : status}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {userType === 'client' ? (
                    <div className="flex h-full">
                      {/* 왼쪽: 프로젝트 목록 */}
                      <div className="w-1/2 p-6 border-r border-gray-200">
                        <div className="space-y-4 max-h-[700px] overflow-y-auto">
                          {filteredProjects.map((project) => (
                            <div
                              key={project.id}
                              onClick={() => setSelectedProject(project.id)}
                              className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                                selectedProject === project.id
                                  ? 'border-indigo-300 bg-indigo-50 shadow-lg'
                                  : 'border-gray-200 hover:border-indigo-200'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                  <h4 className="font-bold text-lg text-gray-900 mb-2">{project.title}</h4>
                                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                                </div>
                                <div className="ml-4 flex flex-col items-end space-y-2">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                                      project.status === '모집중'
                                        ? 'bg-green-100 text-green-700'
                                        : project.status === '진행중'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    {project.status}
                                  </span>
                                  <select
                                    value={project.status}
                                    onChange={(e) => updateProjectStatus(project.id, e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-xs border border-gray-300 rounded-lg px-2 py-1 bg-white cursor-pointer"
                                  >
                                    <option value="모집중">모집중</option>
                                    <option value="진행중">진행중</option>
                                    <option value="완료">완료</option>
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                <div className="flex items-center">
                                  <i className="ri-wallet-3-line text-green-500 mr-2"></i>
                                  <span className="text-gray-600">예산:</span>
                                  <span className="ml-1 font-semibold text-green-600">{project.budget}</span>
                                </div>
                                <div className="flex items-center">
                                  <i className="ri-time-line text-blue-500 mr-2"></i>
                                  <span className="text-gray-600">기간:</span>
                                  <span className="ml-1 font-semibold text-blue-600">{project.duration}</span>
                                </div>
                              </div>

                              <div className="flex justify-between items-center">
                                <div className="flex space-x-4 text-sm">
                                  <span className="flex items-center">
                                    <i className="ri-user-line mr-1 text-gray-400"></i>
                                    <span className="font-medium">{project.applicants?.length || 0}</span>
                                    <span className="text-gray-500 ml-1">지원자</span>
                                  </span>
                                  <span className="flex items-center">
                                    <i className="ri-send-plane-line mr-1 text-gray-400"></i>
                                    <span className="font-medium">2</span>
                                    <span className="text-gray-500 ml-1">제안</span>
                                  </span>
                                </div>
                                <div className="flex space-x-1">
                                  <Link to={`/projects/${project.id}`} onClick={(e) => e.stopPropagation()}>
                                    <Button size="sm" variant="outline" className="text-xs rounded-lg px-3">
                                      <i className="ri-eye-line mr-1"></i>
                                      상세
                                    </Button>
                                  </Link>
                                  {project.status === '완료' && (
                                    <Link
                                      to={`/evaluation/freelancer/${project.id}`}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Button size="sm" className="text-xs rounded-lg px-3">
                                        <i className="ri-star-line mr-1"></i>
                                        평가
                                      </Button>
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 오른쪽: 선택된 프로젝트의 지원자 현황 */}
                      <div className="w-1/2 p-6">
                        {selectedProject ? (
                          (() => {
                            const project = myProjects.find((p) => p.id === selectedProject);
                            const canViewApplicants =
                              project?.status === '모집중' ||
                              (project?.selectedFreelancer && (project?.status === '진행중' || project?.status === '완료'));

                            return (
                              <div>
                                <div className="mb-6">
                                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{project?.title}</h3>
                                  <p className="text-gray-600">
                                    {project?.status === '모집중'
                                      ? '지원자 현황을 관리하세요'
                                      : canViewApplicants
                                      ? '참여자 정보를 확인하세요'
                                      : '프로젝트 정보만 확인할 수 있습니다'}
                                  </p>
                                </div>

                                {canViewApplicants ? (
                                  <div className="space-y-6">
                                    {/* 지원자 목록 */}
                                    <div>
                                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                        <i className="ri-user-line mr-2 text-indigo-600"></i>
                                        {project?.status === '모집중' ? '지원자' : '참여자'} (
                                        {project?.applicants?.length || 0}명)
                                      </h4>
                                      <div className="space-y-3 max-h-[250px] overflow-y-auto">
                                        {project?.applicants?.map((applicant) => (
                                          <div
                                            key={applicant.id}
                                            className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm"
                                          >
                                            <div className="flex justify-between items-start mb-3">
                                              <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-5">
                                                  <span className="text-white font-bold">
                                                    {applicant.name?.charAt(0) || 'A'}
                                                  </span>
                                                </div>
                                                <div>
                                                  <h5 className="font-bold text-gray-900">{applicant.name}</h5>
                                                  <p className="text-sm text-gray-600">
                                                    {applicant.skills?.join(', ')}
                                                  </p>
                                                </div>
                                              </div>
                                              <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                  applicant.status === '대기중'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : applicant.status === '승인'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}
                                              >
                                                {applicant.status}
                                              </span>
                                            </div>
                                            {project?.status === '모집중' && applicant.status === '대기중' && (
                                              <div className="flex space-x-2">
                                                <Button
                                                  size="sm"
                                                  className="text-xs rounded-lg flex-1"
                                                  onClick={() => updateApplicantStatus(applicant.id, 'approved')}
                                                >
                                                  <i className="ri-check-line mr-1"></i>
                                                  승인
                                                </Button>
                                                <Button
                                                  variant="danger"
                                                  size="sm"
                                                  className="text-xs rounded-lg flex-1"
                                                  onClick={() => updateApplicantStatus(applicant.id, 'rejected')}
                                                >
                                                  <i className="ri-close-line mr-1"></i>
                                                  거절
                                                </Button>
                                              </div>
                                            )}
                                          </div>
                                        )) || (
                                          <div className="text-center py-8 text-gray-500">
                                            <i className="ri-inbox-line text-3xl mb-2"></i>
                                            <p className="font-medium">아직 지원자가 없습니다</p>
                                            <p className="text-sm">
                                              프로젝트가 더 많은 프리랜서에게 노출되도록 홍보해보세요
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* 제안한 프리랜서 목록 */}
                                    <div>
                                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                        <i className="ri-send-plane-line mr-2 text-green-600"></i>
                                        제안한 프리랜서 (2명)
                                      </h4>
                                      <div className="space-y-3 max-h-[250px] overflow-y-auto">
                                        <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                                          <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center space-x-3">
                                              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                김
                                              </div>
                                              <div>
                                                <h5 className="font-bold text-gray-900">김개발</h5>
                                                <p className="text-sm text-gray-600">React, Node.js</p>
                                              </div>
                                            </div>
                                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                                              대기중
                                            </span>
                                          </div>

                                          <div className="flex space-x-2">
                                            <Button variant="outline" size="sm" className="text-xs rounded-lg flex-1">
                                              <i className="ri-user-line mr-1"></i>
                                              프로필
                                            </Button>
                                            <Button variant="danger" size="sm" className="text-xs rounded-lg flex-1">
                                              <i className="ri-close-line mr-1"></i>
                                              취소
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center py-16 text-gray-500">
                                    <i className="ri-lock-line text-5xl mb-4"></i>
                                    <h3 className="text-xl font-bold mb-2">접근 제한</h3>
                                    <p>진행중이거나 완료된 프로젝트의 지원 현황은</p>
                                    <p>참여자만 확인할 수 있습니다</p>
                                  </div>
                                )}
                              </div>
                            );
                          })()
                        ) : (
                          <div className="text-center py-16 text-gray-500">
                            <i className="ri-cursor-line text-5xl mb-4"></i>
                            <h3 className="text-xl font-bold mb-2">프로젝트를 선택해주세요</h3>
                            <p>왼쪽에서 프로젝트를 클릭하면 지원자 현황을 확인할 수 있습니다</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // 프리랜서 프로젝트 관리
                    <div className="p-6">
                      <div className="space-y-6">
                        {filteredApplications.map((application) => (
                          <div
                            key={application.id}
                            className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex-1">
                                <h4 className="text-lg font-bold text-gray-900 mb-2">{application.projectTitle}</h4>
                                <p className="text-gray-600 mb-2">{application.clientName}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span>지원일: {application.appliedAt}</span>
                                  {application.approvedAt && (
                                    <span className="text-green-600">승인일: {application.approvedAt}</span>
                                  )}
                                  {application.rejectedAt && (
                                    <span className="text-red-600">거절일: {application.rejectedAt}</span>
                                  )}
                                  {application.completedAt && (
                                    <span className="text-purple-600">완료일: {application.completedAt}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                {application.progress && (
                                  <div className="text-right">
                                    <div className="text-sm text-gray-600 mb-1">진행률</div>
                                    <div className="text-lg font-bold text-blue-600">{application.progress}%</div>
                                  </div>
                                )}
                                <span
                                  className={`px-4 py-2 rounded-full text-sm font-bold ${
                                    application.status === '대기중'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : application.status === '거절'
                                      ? 'bg-red-100 text-red-700'
                                      : application.status === '진행중'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-purple-100 text-purple-700'
                                  }`}
                                >
                                  {application.status}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                              <div>
                                <span className="text-gray-500">예산:</span>
                                <span className="ml-2 font-semibold text-green-600">{application.budget}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">기간:</span>
                                <span className="ml-2 font-semibold text-blue-600">{application.duration}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">제안 견적:</span>
                                <span className="ml-2 font-semibold text-indigo-600">{application.expectedPrice}</span>
                              </div>
                            </div>

                            {application.rejectionReason && (
                              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700">
                                  <i className="ri-error-warning-line mr-2"></i>
                                  거절 사유: {application.rejectionReason}
                                </p>
                              </div>
                            )}

                            {application.finalPayment && (
                              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-700">
                                  <i className="ri-money-dollar-circle-line mr-2"></i>
                                  최종 지급액:{' '}
                                  <span className="font-bold">{application.finalPayment}</span>
                                </p>
                              </div>
                            )}

                            <div className="flex justify-end space-x-2">
                              <Link to={`/projects/${application.projectId}`}>
                                <Button variant="outline" size="sm" className="rounded-xl">
                                  <i className="ri-eye-line mr-2"></i>
                                  상세보기
                                </Button>
                              </Link>
                              {application.status === '완료' && !application.isEvaluated && (
                                <Link to={`/evaluation/client/${application.projectId}`}>
                                  <Button size="sm" className="rounded-xl">
                                    <i className="ri-star-line mr-2"></i>
                                    평가하기
                                  </Button>
                                </Link>
                              )}
                              {application.status === '완료' && application.isEvaluated && (
                                <Button size="sm" className="rounded-xl bg-gray-400 cursor-not-allowed" disabled>
                                  <i className="ri-check-line mr-2"></i>
                                  평가완료
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}

                        {filteredApplications.length === 0 && (
                          <div className="text-center py-16 text-gray-500">
                            <i className="ri-inbox-line text-5xl mb-4"></i>
                            <h3 className="text-xl font-bold mb-2">
                              {applicationStatusFilter === 'all'
                                ? '지원한 프로젝트가 없습니다'
                                : `${applicationStatusFilter} 상태의 프로젝트가 없습니다`}
                            </h3>
                            <p>새로운 프로젝트에 지원해보세요</p>
                            <Link to="/projects">
                              <Button className="mt-4 rounded-xl">
                                <i className="ri-search-line mr-2"></i>
                                프로젝트 찾아보기
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
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
                          평균 평점: {profileData.averageRating}
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
