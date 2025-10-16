import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/base/Button";
import Input from "../../components/base/Input";
import Select from "../../components/base/Select";
import { useApiClient } from "../../lib/backend/apiClient";

export default function Projects() {
  const client = useApiClient();
  const { user, token, isLoggedIn } = useAuth();
  const [keyword, setKeyword] = useState("");
  const [keywordType, setKeywordType] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);

  // 필터 관련 상태
  const [skills, setSkills] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [status, setStatus] = useState<
    "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CLOSED" | ""
  >("");

  // 페이징 관련 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const keywordTypeOptions = [
    { value: "all", label: "검색 필터" },
    { value: "title", label: "제목" },
    { value: "summary", label: "요약" },
    { value: "description", label: "설명" },
  ];

  const sortOptions = [
    { value: "latest", label: "최신순" },
    { value: "deadline", label: "마감일순" },
    { value: "budget", label: "예산순" },
  ];

  const statusOptions = [
    { value: "", label: "전체" },
    { value: "OPEN", label: "모집중" },
    { value: "IN_PROGRESS", label: "진행중" },
    { value: "COMPLETED", label: "완료" },
  ];

  // -------------------------------------

  // 필터 데이터 불러오기 (skills, interests)
  useEffect(() => {
    client
      .GET("/api/v1/skills")
      .then(({ data }) => setSkills(data?.data ?? []));
    client
      .GET("/api/v1/interests")
      .then(({ data }) => setInterests(data?.data ?? []));
  }, []);

  // 프로젝트 목록 가져오기
  const fetchProjects = async (page = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      // URL 쿼리 파라미터로 변환
      const searchParams = new URLSearchParams();

      // 검색 조건
      if (keyword) searchParams.append("keyword", keyword);
      if (keywordType) searchParams.append("keywordType", keywordType);
      if (status) searchParams.append("status", status);

      // 필터 조건
      selectedSkills.forEach((id) =>
        searchParams.append("skillIds", id.toString())
      );
      selectedInterests.forEach((id) =>
        searchParams.append("interestIds", id.toString())
      );

      // 페이징 & 정렬
      searchParams.append("page", page.toString());
      searchParams.append("size", "10");
      searchParams.append(
        "sort",
        sortBy === "latest"
          ? "createDate,DESC"
          : sortBy === "deadline"
          ? "deadline,ASC"
          : sortBy === "budget"
          ? "price,DESC"
          : "createDate,DESC"
      );

      const { data, error } = await client.GET(
        `/api/v1/projects?${searchParams.toString()}`
      );

      if (error) throw error;
      setFilteredProjects(data?.data?.content ?? []);
      setTotalPages(data?.data?.totalPages ?? 0);
      setTotalElements(data?.data?.totalElements ?? 0);
      setCurrentPage(data?.data?.number ?? 0);
    } catch (err: any) {
      console.error("프로젝트 조회 실패:", err);
      setError("프로젝트 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 필터 체크박스 핸들러
  const handleSkillChange = (id: number) => {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };
  const handleInterestChange = (id: number) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleSearch = () => {
    setCurrentPage(0); // 검색 시 첫 페이지로 리셋
    fetchProjects(0);
  };

  const handleFavorite = async (projectId: number) => {
    try {
      const response = await client.POST(
        "/api/v1/members/me/favorites/projects",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: {
            projectId: projectId, // ✅ 매개변수 그대로 사용
          },
        }
      );

      if (response.error) throw response.error;

      alert("프로젝트가 즐겨찾기에 추가되었습니다.");
      // 예: 로컬 상태 업데이트 (선택)
      setFavorites((prev) => [...prev, projectId]);
    } catch (err) {
      console.error("즐겨찾기 추가 실패:", err);
      alert(err.msg);
    }
  };

  const Pagination = () => {
    const pages = Array.from({ length: totalPages }, (_, i) => i);

    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        <button
          onClick={() => fetchProjects(currentPage - 1)}
          disabled={currentPage === 0}
          className={`px-4 py-2 rounded-lg shadow-md ${
            currentPage === 0
              ? "bg-gray-100 text-gray-400"
              : "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-lg transition-shadow"
          }`}
        >
          <i className="ri-arrow-left-s-line"></i>
        </button>

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => fetchProjects(page)}
            className={`px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow ${
              currentPage === page
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {page + 1}
          </button>
        ))}

        <button
          onClick={() => fetchProjects(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className={`px-4 py-2 rounded-lg shadow-md ${
            currentPage === totalPages - 1
              ? "bg-gray-100 text-gray-400"
              : "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-lg transition-shadow"
          }`}
        >
          <i className="ri-arrow-right-s-line"></i>
        </button>
      </div>
    );
  };

  useEffect(() => {
    fetchProjects(0); // 페이지 진입 시 첫 페이지 로드
  }, []);

  // -------------------------------------
  // UI
  // -------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
              <i className="ri-search-line text-white text-2xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                프로젝트 찾기
              </h1>
              <p className="text-gray-600">원하는 프로젝트를 찾아보세요</p>
            </div>
          </div>
        </div>

        {/* 검색 바 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex space-x-4 mb-4">
            <div className="flex-1 relative">
              <i className="ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"></i>
              <Input
                type="text"
                placeholder="검색어 입력"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Select
                options={keywordTypeOptions}
                value={keywordType}
                onChange={setKeywordType}
                className="min-w-[120px]"
              />
              <Select
                options={sortOptions}
                value={sortBy}
                onChange={setSortBy}
                className="min-w-[120px]"
              />
              <Button onClick={handleSearch} className="rounded-xl px-6">
                <i className="ri-search-line mr-2"></i> 검색
              </Button>
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant={showFilters ? "primary" : "outline"}
                className="rounded-xl px-6 relative"
              >
                <i className="ri-filter-3-line mr-2"></i> 필터
              </Button>
            </div>
          </div>
          {/* 필터 영역 */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 스킬 */}
              <div>
                <div className="font-semibold mb-2">기술 스택</div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <label
                      key={skill.id}
                      className="flex items-center space-x-1"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill.id)}
                        onChange={() => handleSkillChange(skill.id)}
                      />
                      <span>{skill.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* 관심 분야 */}
              <div>
                <div className="font-semibold mb-2">관심 분야</div>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest) => (
                    <label
                      key={interest.id}
                      className="flex items-center space-x-1"
                    >
                      <input
                        type="checkbox"
                        checked={selectedInterests.includes(interest.id)}
                        onChange={() => handleInterestChange(interest.id)}
                      />
                      <span>{interest.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* 상태 */}
              <div>
                <div className="font-semibold mb-2">상태</div>
                <Select
                  options={statusOptions}
                  value={status}
                  onChange={(value) => setStatus(value as typeof status)}
                  className="min-w-[120px]"
                />
              </div>
            </div>
          )}
        </div>

        {/* 로딩 / 에러 / 결과 */}
        {loading ? (
          <p className="text-center text-gray-600 py-8">로딩 중...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-8">{error}</p>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                총{" "}
                <span className="font-semibold text-indigo-600">
                  {totalElements}
                </span>{" "}
                개의 프로젝트
                {keyword && (
                  <span>
                    {" "}
                    • '<span className="font-medium">{keyword}</span>' 검색 결과
                  </span>
                )}
              </p>
            </div>

            {/* 프로젝트 리스트 */}
            <div className="space-y-6">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                              {project.title}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                project.status === "OPEN"
                                  ? "bg-green-100 text-green-700 border border-green-200"
                                  : project.status === "IN_PROGRESS"
                                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                                  : project.status === "COMPLETED"
                                  ? "bg-gray-100 text-gray-700 border border-gray-200"
                                  : "bg-gray-200 text-gray-600 border border-gray-300"
                              }`}
                            >
                              {project.status === "OPEN"
                                ? "모집중"
                                : project.status === "IN_PROGRESS"
                                ? "진행중"
                                : project.status === "COMPLETED"
                                ? "완료"
                                : "종료"}
                            </span>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            <span className="flex items-center">
                              <i className="ri-building-line mr-1"></i>
                              {project.ownerName}
                            </span>
                            <span className="flex items-center">
                              <i className="ri-calendar-line mr-1"></i>
                              {new Date(
                                project.createDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {project.summary}
                      </p>

                      {project.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.skills.map((skill: any) => (
                            <span
                              key={skill.id}
                              className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-100"
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="grid grid-cols-3 gap-6 text-sm">
                          <div className="flex items-center text-gray-600">
                            <i className="ri-wallet-3-line mr-2 text-green-500"></i>
                            <div>
                              <span className="block text-xs text-gray-500">
                                예산
                              </span>
                              <span className="font-semibold text-green-600">
                                {project.price.toLocaleString()}원
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <i className="ri-time-line mr-2 text-blue-500"></i>
                            <div>
                              <span className="block text-xs text-gray-500">
                                기간
                              </span>
                              <span className="font-semibold text-blue-600">
                                {project.duration}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <i className="ri-calendar-deadline-line mr-2 text-red-500"></i>
                            <div>
                              <span className="block text-xs text-gray-500">
                                마감
                              </span>
                              <span className="font-semibold text-red-600">
                                {new Date(
                                  project.deadline
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          {isLoggedIn && user?.role === "FREELANCER" && (
                            <Button
                              onClick={() => handleFavorite(project.id)}
                              className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600"
                            >
                              <i className="ri-heart-line mr-2"></i>
                              즐겨찾기
                            </Button>
                          )}
                          <Link to={`/projects/${project.id}`}>
                            <Button variant="outline" className="rounded-xl">
                              <i className="ri-eye-line mr-2"></i>
                              자세히 보기
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProjects.length > 0 && <Pagination />}

            {filteredProjects.length === 0 && (
              <div className="text-center py-16">
                <div className="p-6 bg-white/50 rounded-2xl inline-block">
                  <i className="ri-search-line text-4xl text-gray-400 mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    검색 결과가 없습니다
                  </h3>
                  <p className="text-gray-500 mb-4">
                    다른 검색 조건을 시도해보세요
                  </p>
                  <Button onClick={fetchProjects} className="rounded-xl">
                    <i className="ri-refresh-line mr-2"></i> 전체 다시 보기
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {isLoggedIn && user?.role === "CLIENT" && (
          <div className="pt-6 flex justify-end">
            <Link
              to="/projects/create"
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:scale-105 transform transition"
            >
              프로젝트 등록
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
