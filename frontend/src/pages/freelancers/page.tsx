
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockFreelancers } from '../../mocks/users';
import Button from '../../components/base/Button';
import Select from '../../components/base/Select';

interface FreelancersProps {
  userType?: 'client' | 'freelancer';
}

export default function Freelancers({ userType = 'client' }: FreelancersProps) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: '', label: '전체 분야' },
    { value: '웹 개발', label: '웹 개발' },
    { value: '모바일 앱', label: '모바일 앱' },
    { value: '디자인', label: '디자인' },
    { value: '데이터 분석', label: '데이터 분석' },
    { value: '마케팅', label: '마케팅' }
  ];

  const experienceOptions = [
    { value: '', label: '전체 경력' },
    { value: '신입', label: '신입 (1년 미만)' },
    { value: '주니어', label: '주니어 (1-3년)' },
    { value: '미들', label: '미들 (3-7년)' },
    { value: '시니어', label: '시니어 (7년 이상)' }
  ];

  const ratingOptions = [
    { value: '', label: '전체 평점' },
    { value: '4.5+', label: '4.5점 이상' },
    { value: '4.0+', label: '4.0점 이상' },
    { value: '3.5+', label: '3.5점 이상' }
  ];

  const availableSkills = ['React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java', 'JavaScript', 'TypeScript', 'PHP', 'Laravel', 'Spring', 'Django', 'Flutter', 'Swift', 'Kotlin', 'Figma', 'Photoshop', 'Illustrator'];

  const sortOptions = [
    { value: 'latest', label: '최신순' },
    { value: 'rating', label: '평점순' },
    { value: 'experience', label: '경력순' },
    { value: 'popularity', label: '인기순' }
  ];

  const toggleFavorite = (freelancerId: number) => {
    setFavorites(prev => 
      prev.includes(freelancerId) 
        ? prev.filter(id => id !== freelancerId)
        : [...prev, freelancerId]
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
    setSelectedExperience('');
    setSelectedSkills([]);
    setSelectedRating('');
  };

  const filteredFreelancers = mockFreelancers.filter(freelancer => {
    const matchesKeyword = freelancer.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                          freelancer.introduction.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesCategory = !selectedCategory || freelancer.interests?.includes(selectedCategory);
    const matchesSkills = selectedSkills.length === 0 || selectedSkills.some(skill => freelancer.skills.includes(skill));
    
    return matchesKeyword && matchesCategory && matchesSkills;
  });

  const activeFiltersCount = (selectedCategory ? 1 : 0) + 
                           (selectedExperience ? 1 : 0) + 
                           (selectedRating ? 1 : 0) + 
                           selectedSkills.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
              <i className="ri-team-line text-white text-2xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">프리랜서 찾기</h1>
              <p className="text-gray-600">전문적인 프리랜서를 찾아보세요</p>
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
                placeholder="프리랜서 이름, 소개, 기술 스택으로 검색"
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="분야"
                  options={categories}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                />
                
                <Select
                  label="경력"
                  options={experienceOptions}
                  value={selectedExperience}
                  onChange={setSelectedExperience}
                />
                
                <Select
                  label="평점"
                  options={ratingOptions}
                  value={selectedRating}
                  onChange={setSelectedRating}
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
              총 <span className="font-semibold text-indigo-600">{filteredFreelancers.length}</span>명의 프리랜서
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

        {/* 프리랜서 리스트 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFreelancers.map((freelancer) => (
            <div key={freelancer.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {freelancer.name.charAt(0)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      <Link to={`/freelancers/${freelancer.id}`}>{freelancer.name}</Link>
                    </h3>
                    <button
                      onClick={() => toggleFavorite(freelancer.id)}
                      className="p-2 rounded-lg hover:bg-gray-100/50 transition-colors cursor-pointer"
                    >
                      <i className={`text-lg ${favorites.includes(freelancer.id) ? 'ri-heart-fill text-red-500' : 'ri-heart-line text-gray-400'}`}></i>
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2 font-medium">{freelancer.experience}</p>
                  
                  <div className="flex items-center mb-3">
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full mr-3">
                      <i className="ri-star-fill text-yellow-400 mr-1"></i>
                      <span className="text-sm font-semibold text-yellow-700">{freelancer.averageRating}</span>
                    </div>
                    <span className="text-sm text-gray-500">완료 프로젝트 {freelancer.completedProjects}개</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {freelancer.introduction}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {freelancer.skills.slice(0, 4).map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium border border-indigo-100">
                        {skill}
                      </span>
                    ))}
                    {freelancer.skills.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                        +{freelancer.skills.length - 4}개
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <span className="flex items-center">
                        <i className="ri-time-line mr-1"></i>
                        보통 1일 내 응답
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link to={`/freelancers/${freelancer.id}`}>
                        <Button variant="outline" size="sm" className="rounded-lg group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                          <i className="ri-user-line mr-1"></i>
                          프로필 보기
                        </Button>
                      </Link>
                      {userType === 'client' && (
                        <Link to={`/freelancers/${freelancer.id}/propose`}>
                          <Button size="sm" className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600">
                            <i className="ri-send-plane-line mr-1"></i>
                            제안
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

        {filteredFreelancers.length === 0 && (
          <div className="text-center py-16">
            <div className="p-6 bg-white/50 rounded-2xl inline-block">
              <i className="ri-team-line text-4xl text-gray-400 mb-4"></i>
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
        {filteredFreelancers.length > 0 && (
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
