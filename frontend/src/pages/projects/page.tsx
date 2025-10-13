import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/base/Button";
import Input from "../../components/base/Input";
import Select from "../../components/base/Select";
import client from "../../global/backend/client";

interface ProjectsProps {
  userType?: "client" | "freelancer";
}

export default function Projects({ userType = "freelancer" }: ProjectsProps) {
  const [keyword, setKeyword] = useState("");
  const [keywordType, setKeywordType] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [showFilters, setShowFilters] = useState(false);
  const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [favorites, setFavorites] = useState<number[]>([]);

  const keywordTypeOptions = [
    { value: "", label: "검색 필터" },
    { value: "title", label: "제목" },
    { value: "summary", label: "요약" },
    { value: "description", label: "설명" },
  ];

  const sortOptions = [
    { value: "latest", label: "최신순" },
    { value: "deadline", label: "마감일순" },
    { value: "budget", label: "예산순" },
    { value: "popularity", label: "인기순" },
  ];

  // -------------------------------------
  // 프로젝트 목록 가져오기
  // -------------------------------------
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await client.GET("/api/v1/projects", {
        params: {
          query: {
            keyword: keyword || "",
            keywordType: keywordType || "",
            sortBy: sortBy || undefined,
          },
        },
      });

      if (error) throw error;
      setFilteredProjects(data?.data?.content ?? []);
    } catch (err: any) {
      console.error("프로젝트 조회 실패:", err);
      setError("프로젝트 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchProjects();
  };

  const toggleFavorite = (projectId: number) => {
    setFavorites((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  useEffect(() => {
    fetchProjects(); // 페이지 진입 시 기본 목록 로드
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
                  {filteredProjects.length}
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

                        <button
                          onClick={() => toggleFavorite(project.id)}
                          className="ml-4 p-3 rounded-xl hover:bg-gray-100/50 transition-colors cursor-pointer"
                        >
                          <i
                            className={`text-xl ${
                              favorites.includes(project.id)
                                ? "ri-heart-fill text-red-500"
                                : "ri-heart-line text-gray-400"
                            }`}
                          ></i>
                        </button>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {project.summary}
                      </p>

                      {project.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.skills.map((skill) => (
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
                          <Link to={`/projects/${project.id}`}>
                            <Button variant="outline" className="rounded-xl">
                              <i className="ri-eye-line mr-2"></i>
                              자세히 보기
                            </Button>
                          </Link>
                          {project.status === "모집중" &&
                            userType === "freelancer" && (
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
      </div>
    </div>
  );
}
