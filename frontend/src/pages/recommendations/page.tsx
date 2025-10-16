import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "@/components/base/Button";
import { useApiClient } from "../../lib/backend/apiClient";

// ===== 프론트에서 사용할 타입(느슨한 형태로 안전 가드 포함) =====
type ProjectItem = {
    id: number;
    title?: string;
    summary?: string;
    duration?: string;
    price?: number;
    status?: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CLOSED" | string;
    preferred_condition?: string;
};

type FreelancerItem = {
    id: number;
    job?: string;
    one_liner?: string;
    tech_stack?: any[] | string; // 배열/문자열 모두 방어
    ratingAvg?: number;
};

export default function RecommendationsPage() {
    const navigate = useNavigate();
    const client = useApiClient();
    const { user, token, isLoggedIn } = useAuth();

    // 로그인 가드
    useEffect(() => {
        if (!isLoggedIn) {
            alert("로그인이 필요합니다.");
            navigate("/login");
        }
    }, [isLoggedIn, navigate]);

    const userType = useMemo<"freelancer" | "client" | "unknown">(() => {
        if (!user?.role) return "unknown";
        return user.role === "FREELANCER" ? "freelancer" : user.role === "CLIENT" ? "client" : "unknown";
    }, [user]);

    // 공통 페이지네이션
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // 데이터
    const [loading, setLoading] = useState(false);
    const [errorText, setErrorText] = useState<string | null>(null);

    const [filteredProjects, setFilteredProjects] = useState<ProjectItem[]>([]);
    const [filteredFreelancers, setFilteredFreelancers] = useState<FreelancerItem[]>([]);

    // ====== API 호출: 토큰을 Authorization 헤더로 첨부 ======
    const fetchRecommendations = async (pageNum = 0) => {
        try {
            setLoading(true);
            setErrorText(null);

            const qs = new URLSearchParams({ page: String(pageNum), size: String(size) }).toString();
            const { data, error } = await client.GET(
                `/api/v1/recommendations?${qs}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (error) throw error;

            const pageBody = data?.data;
            setTotalPages(pageBody?.totalPages ?? 0);
            setTotalElements(pageBody?.totalElements ?? 0);
            setPage(pageBody?.number ?? pageNum);

            const content = Array.isArray(pageBody?.content) ? pageBody.content : [];

            // 사용자 역할에 따라 들어오는 스키마가 다름:
            // - 프리랜서 로그인 => 프로젝트 추천 (ProjectScoreView 확장)
            // - 클라이언트 로그인 => 프리랜서 추천 (FreelancerScoreView 확장)
            if (userType === "freelancer") {
                // ProjectScoreView 확장 데이터 normalize
                const normalized: ProjectItem[] = content.map((raw: any) => ({
                    id: Number(raw.projectId ?? raw.id ?? 0),
                    title: raw.title,
                    summary: raw.summary,
                    duration: raw.duration,
                    price: typeof raw.price === "number" ? raw.price : Number(raw.price ?? 0),
                    status: raw.status,
                    preferred_condition: raw.preferred_condition ?? raw.preferredCondition,
                }));
                setFilteredProjects(normalized);
                setFilteredFreelancers([]);
            } else if (userType === "client") {
                // FreelancerScoreView 확장 데이터 normalize
                const normalized: FreelancerItem[] = content.map((raw: any) => ({
                    id: Number(raw.freelancerId ?? raw.id ?? 0),
                    job: raw.jobRole ?? raw.job,
                    one_liner: raw.one_liner ?? raw.comment,
                    tech_stack: raw.tech_stack,
                    ratingAvg: typeof raw.ratingAvg === "number" ? raw.ratingAvg : Number(raw.ratingAvg ?? 0),
                }));
                setFilteredFreelancers(normalized);
                setFilteredProjects([]);
            } else {
                setFilteredProjects([]);
                setFilteredFreelancers([]);
            }
        } catch (e: any) {
            console.error("[recommendations] fetch error", e);
            setErrorText("추천을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoggedIn && (userType === "freelancer" || userType === "client")) {
            fetchRecommendations(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn, userType]);

    // 페이지네이션 컴포넌트
    const Pagination = () => {
        if (totalPages <= 1) return null;
        const pages = Array.from({ length: totalPages }, (_, i) => i);
        return (
            <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                    onClick={() => fetchRecommendations(page - 1)}
                    disabled={page === 0}
                    className={`px-4 py-2 rounded-lg shadow-md ${
                        page === 0 ? "bg-gray-100 text-gray-400" : "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-lg transition-shadow"
                    }`}
                >
                    <i className="ri-arrow-left-s-line" />
                </button>

                {pages.map((p) => (
                    <button
                        key={p}
                        onClick={() => fetchRecommendations(p)}
                        className={`px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow ${
                            page === p ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                        {p + 1}
                    </button>
                ))}

                <button
                    onClick={() => fetchRecommendations(page + 1)}
                    disabled={page === totalPages - 1}
                    className={`px-4 py-2 rounded-lg shadow-md ${
                        page === totalPages - 1 ? "bg-gray-100 text-gray-400" : "bg-white text-gray-700 hover:bg-gray-50 hover:shadow-lg transition-shadow"
                    }`}
                >
                    <i className="ri-arrow-right-s-line" />
                </button>
            </div>
        );
    };

    // ===== 렌더 =====
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                            <i className="ri-magic-line text-white text-2xl"></i>
                        </div>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900">맞춤 추천</h1>
                            <p className="text-gray-600">
                                {userType === "freelancer" && "내 프로필(직무/경력/기술 스택)과 유사한 프로젝트를 추천해요"}
                                {userType === "client" && "최근/선택 프로젝트와 유사한 프리랜서를 추천해요"}
                                {userType === "unknown" && "로그인 후 이용 가능합니다"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 본문 */}
                {loading ? (
                    <p className="text-center text-gray-600 py-12">로딩 중...</p>
                ) : errorText ? (
                    <div className="text-center py-12">
                        <p className="text-red-500 mb-4">{errorText}</p>
                        <Button onClick={() => fetchRecommendations(page)} className="rounded-xl">
                            <i className="ri-refresh-line mr-2"></i>다시 불러오기
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <p className="text-gray-600">
                                총 <span className="font-semibold text-indigo-600">{totalElements}</span> 개의 추천 결과
                            </p>
                        </div>

                        {/* 프리랜서 로그인 => 프로젝트 리스트 */}
                        {userType === "freelancer" && (
                            <div className="space-y-6">
                                {filteredProjects.map((project: ProjectItem) => (
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
                                                                {project.title ?? `프로젝트 #${project.id}`}
                                                            </h3>
                                                            {project.status && (
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
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {project.summary && (
                                                    <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">{project.summary}</p>
                                                )}

                                                {/* 우대 조건 */}
                                                {project.preferred_condition && (
                                                    <div className="bg-green-50 rounded-lg p-4 mb-4">
                                                        <h4 className="font-medium text-green-900 mb-2">
                                                            <i className="ri-thumb-up-line mr-2"></i>
                                                            우대 조건
                                                        </h4>
                                                        <p className="text-green-800 text-sm whitespace-pre-line">{project.preferred_condition}</p>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between">
                                                    <div className="grid grid-cols-2 gap-6 text-sm">
                                                        <div className="flex items-center text-gray-600">
                                                            <i className="ri-wallet-3-line mr-2 text-green-500"></i>
                                                            <div>
                                                                <span className="block text-xs text-gray-500">예산</span>
                                                                <span className="font-semibold text-green-600">
                                  {(project.price ?? 0).toLocaleString()}원
                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <i className="ri-time-line mr-2 text-blue-500"></i>
                                                            <div>
                                                                <span className="block text-xs text-gray-500">기간</span>
                                                                <span className="font-semibold text-blue-600">{project.duration ?? "-"}</span>
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
                                                        {project.status === "OPEN" && (
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
                        )}

                        {/* 클라이언트 로그인 => 프리랜서 리스트 */}
                        {userType === "client" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredFreelancers.map((freelancer: FreelancerItem) => {
                                    // tech_stack 방어적 정규화 (문자열/배열 모두 수용)
                                    const raw = freelancer?.tech_stack ?? [];
                                    const list = Array.isArray(raw)
                                        ? raw
                                        : typeof raw === "string"
                                            ? raw.split(/[,\s/|]+/).filter(Boolean)
                                            : [];
                                    const techs = list
                                        .map((t: any) =>
                                            typeof t === "string" ? { key: t, label: t } : { key: t?.id ?? t?.name, label: t?.name ?? String(t) }
                                        )
                                        .filter((t) => t?.label)
                                        .slice(0, 4);
                                    const extraCount = Math.max(0, list.length - 4);

                                    return (
                                        <div
                                            key={freelancer.id}
                                            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 group"
                                        >
                                            <div className="flex items-start space-x-4">
                                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                                                    {(freelancer.job?.charAt(0) || "F")}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                            <Link to={`/freelancers/${freelancer.id}`}>{freelancer.job || "직무 미입력"}</Link>
                                                        </h3>
                                                    </div>

                                                    {freelancer.one_liner && (
                                                        <p className="text-sm text-gray-600 mb-2 font-medium">{freelancer.one_liner}</p>
                                                    )}

                                                    <div className="flex items-center mb-3">
                                                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full mr-3">
                                                            <i className="ri-star-fill text-yellow-400 mr-1"></i>
                                                            <span className="text-sm font-semibold text-yellow-700">
                                {(typeof freelancer.ratingAvg === "number" ? freelancer.ratingAvg : 0).toFixed(1)}
                              </span>
                                                        </div>
                                                        <span className="text-sm text-gray-500">평점</span>
                                                    </div>

                                                    <div className="flex flex-wrap gap-1 mb-4">
                                                        {techs.map((t) => (
                                                            <span
                                                                key={`${freelancer.id}-${t.key}`}
                                                                className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium border border-indigo-100"
                                                            >
                                {t.label}
                              </span>
                                                        ))}
                                                        {extraCount > 0 && (
                                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">+{extraCount}개</span>
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
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="rounded-lg group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all"
                                                                >
                                                                    <i className="ri-user-line mr-1"></i>
                                                                    프로필 보기
                                                                </Button>
                                                            </Link>
                                                            <Link to={`/freelancers/${freelancer.id}/propose`}>
                                                                <Button size="sm" className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600">
                                                                    <i className="ri-send-plane-line mr-1"></i>
                                                                    제안
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* 비어있을 때 */}
                        {(userType === "freelancer" ? filteredProjects.length : filteredFreelancers.length) === 0 && !loading && (
                            <div className="text-center py-16">
                                <div className="p-6 bg-white/50 rounded-2xl inline-block">
                                    <i className="ri-search-line text-4xl text-gray-400 mb-4"></i>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">추천이 비어있습니다</h3>
                                    <p className="text-gray-500 mb-4">
                                        프리랜서는 프로필, 클라이언트는 최근/선택 프로젝트를 업데이트하면 더 정확해져요
                                    </p>
                                    <Button onClick={() => fetchRecommendations(page)} className="rounded-xl">
                                        <i className="ri-refresh-line mr-2"></i>다시 불러오기
                                    </Button>
                                </div>
                            </div>
                        )}

                        <Pagination />
                    </>
                )}
            </div>
        </div>
    );
}