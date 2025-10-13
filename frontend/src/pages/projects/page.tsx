
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockProjects } from '../../mocks/users';
import Button from '../../components/base/Button';
import Input from '../../components/base/Input';
import Select from '../../components/base/Select';

interface ProjectsProps {
  userType?: 'client' | 'freelancer';
}

export default function Projects({ userType = 'freelancer' }: ProjectsProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedBudgetRange, setSelectedBudgetRange] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('latest');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: '', label: '전체 카테고리' },
    { value: '웹 개발', label: '웹 개발' },
    { value: '모바일 앱', label: '모바일 앱' },
    { value: '디자인', label: '디자인' },
    { value: '데이터 분석', label: '데이터 분석' },
    { value: '마케팅', label: '마케팅' }
  ];

  const statusOptions = [
    { value: '', label: '전체 상태' },
    { value: '모집중', label: '모집중' },
    { value: '진행중', label: '진행중' },
    { value: '완료', label: '완료' }
  ];

  const budgetRanges = [
    { value: '', label: '전체 예산' },
    { value: '0-500', label: '500만원 이하' },
    { value: '500-1000', label: '500만원 - 1000만원' },
    { value: '1000-3000', label: '1000만원 - 3000만원' },
    { value: '3000+', label: '3000만원 이상' }
  ];

  const durationOptions = [
    { value: '', label: '전체 기간' },
    { value: '1주일 이하', label: '1주일 이하' },
    { value: '1주일 - 1개월', label: '1주일 - 1개월' },
    { value: '1개월 - 3개월', label: '1개월 - 3개월' },
    { value: '3개월 이상', label: '3개월 이상' }
  ];

  const availableSkills = ['React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java', 'JavaScript', 'TypeScript', 'PHP', 'Laravel', 'Spring', 'Django', 'Flutter', 'Swift', 'Kotlin', 'Figma', 'Photoshop', 'Illustrator'];

  const sortOptions = [
    { value: 'latest', label: '최신순' },
    { value: 'deadline', label: '마감일순' },
    { value: 'budget', label: '예산순' },
    { value: 'popularity', label: '인기순' }
  ];

  const toggleFavorite = (projectId: number) => {
    setFavorites(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const addSkillFilter = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills(prev => [...prev, skill]);
    }
  };

  const removeSkillFilter = (skill: string) => {
    setSelectedSkills(prev => prev.filter(s => s !== skill));
  };

  const clearAllFilters = () => {
    setSearchKeyword('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedBudgetRange('');
    setSelectedDuration('');
    setSelectedSkills([]);
  };

  const filteredProjects = mockProjects.filter(project => {
    const matchesKeyword = project.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesCategory = !selectedCategory || project.category === selectedCategory;
    const matchesStatus = !selectedStatus || project.status === selectedStatus;
    const matchesSkills = selectedSkills.length === 0 || selectedSkills.some(skill => project.skills.includes(skill));
    
    return matchesKeyword && matchesCategory && matchesStatus && matchesSkills;
  });

  const activeFiltersCount = (selectedCategory ? 1 : 0) + 
                           (selectedStatus ? 1 : 0) + 
                           (selectedBudgetRange ? 1 : 0) + 
                           (selectedDuration ? 1 : 0) + 
                           selectedSkills.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
              <i className="ri-search-line text-white text-2xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">프로젝트 찾기</h1>
              <p className="text-gray-600">원하는 프로젝트를 찾아보세요</p>
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          {/* 검색바와 정렬 */}
          <div className="flex space-x-4 mb-4">
            <div className="flex-1 relative">
              <i className="ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"></i>
              <input
                type="text"
                placeholder="프로젝트 제목, 설명, 기술 스택으로 검색"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Select
                label=""
                options={sortOptions}
                value={sortBy}
                onChange={setSortBy}
                className="min-w-[120px]"
              />
              <Button 
                onClick={() => setShowFilters(!showFilters)}
                variant={showFilters ? "primary" : "outline"}
                className="rounded-xl px-6 relative"
              >
                <i className="ri-filter-3-line mr-2"></i>
                필터
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* 고급 필터 */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Select
                  label="카테고리"
                  options={categories}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                />
                
                <Select
                  label="모집 상태"
                  options={statusOptions}
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                />
                
                <Select
                  label="예산 범위"
                  options={budgetRanges}
                  value={selectedBudgetRange}
                  onChange={setSelectedBudgetRange}
                />
                
                <Select
                  label="예상 기간"
                  options={durationOptions}
                  value={selectedDuration}
                  onChange={setSelectedDuration}
                />
              </div>

              {/* 기술 스택 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">기술 스택</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedSkills.map((skill) => (
                    <span 
                      key={skill} 
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center"
                    >
                      {skill}
                      <button 
                        onClick={() => removeSkillFilter(skill)}
                        className="ml-2 text-indigo-500 hover:text-indigo-700 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSkills.filter(skill => !selectedSkills.includes(skill)).slice(0, 10).map((skill) => (
                    <button
                      key={skill}
                      onClick={() => addSkillFilter(skill)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-indigo-100 hover:text-indigo-700 transition-colors cursor-pointer"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={clearAllFilters} className="rounded-xl">
                    <i className="ri-refresh-line mr-2"></i>
                    필터 초기화
                  </Button>
                  <Button onClick={() => setShowFilters(false)} className="rounded-xl">
                    필터 적용
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 검색 결과 요약 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              총 <span className="font-semibold text-indigo-600">{filteredProjects.length}</span>개의 프로젝트
              {searchKeyword && (
                <span> • '<span className="font-medium">{searchKeyword}</span>' 검색 결과</span>
              )}
            </p>
            {activeFiltersCount > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">활성 필터: {activeFiltersCount}개</span>
                <Button variant="outline" size="sm" onClick={clearAllFilters} className="rounded-lg">
                  전체 해제
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 프로젝트 리스트 */}
        <div className="space-y-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          <Link to={`/projects/${project.id}`}>{project.title}</Link>
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          project.status === '모집중' 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : project.status === '진행중'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center">
                          <i className="ri-building-line mr-1"></i>
                          {project.clientName}
                        </span>
                        <span className="flex items-center">
                          <i className="ri-calendar-line mr-1"></i>
                          {project.createdAt}
                        </span>
                        <span className="flex items-center">
                          <i className="ri-eye-line mr-1"></i>
                          124
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleFavorite(project.id)}
                      className="ml-4 p-3 rounded-xl hover:bg-gray-100/50 transition-colors cursor-pointer"
                    >
                      <i className={`text-xl ${favorites.includes(project.id) ? 'ri-heart-fill text-red-500' : 'ri-heart-line text-gray-400'}`}></i>
                    </button>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.skills.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="grid grid-cols-3 gap-6 text-sm">
                      <div className="flex items-center text-gray-600">
                        <i className="ri-wallet-3-line mr-2 text-green-500"></i>
                        <div>
                          <span className="block text-xs text-gray-500">예산</span>
                          <span className="font-semibold text-green-600">{project.budget}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <i className="ri-time-line mr-2 text-blue-500"></i>
                        <div>
                          <span className="block text-xs text-gray-500">기간</span>
                          <span className="font-semibold text-blue-600">{project.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <i className="ri-calendar-deadline-line mr-2 text-red-500"></i>
                        <div>
                          <span className="block text-xs text-gray-500">마감</span>
                          <span className="font-semibold text-red-600">{project.deadline}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Link to={`/projects/${project.id}`}>
                        <Button variant="outline" className="rounded-xl">
                          <i className="ri-eye-line mr-2"></i>
                          자세히 보기
                        </Button>
                      </Link>
                      {project.status === '모집중' && userType === 'freelancer' && (
                        <Link to={`/projects/${project.id}/apply`}>
                          <Button className="rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600">
                            <i className="ri-send-plane-line mr-2"></i>
                            지원하기
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <div className="p-6 bg-white/50 rounded-2xl inline-block">
              <i className="ri-search-line text-4xl text-gray-400 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
              <p className="text-gray-500 mb-4">다른 검색 조건을 시도해보세요</p>
              <Button onClick={clearAllFilters} className="rounded-xl">
                <i className="ri-refresh-line mr-2"></i>
                필터 초기화
              </Button>
            </div>
          </div>
        )}

        {/* 페이지네이션 */}
        {filteredProjects.length > 0 && (
          <div className="flex justify-center mt-12">
            <div className="flex space-x-2 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
              <button className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <i className="ri-arrow-left-line"></i>
              </button>
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  className={`px-4 py-2 rounded-xl cursor-pointer transition-all ${
                    page === 1 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                      : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <i className="ri-arrow-right-line"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
