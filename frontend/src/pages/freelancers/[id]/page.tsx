import { useApiClient } from "@/lib/backend/apiClient";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "../../../components/base/Button";
import { useAuth } from "../../../context/AuthContext";

interface FreelancerDetailProps {
  userType?: "client" | "freelancer";
}

// 타입 정의
type SkillDto = {
  id?: number;
  name?: string;
};

type InterestDto = {
  id?: number;
  name?: string;
};

type ProjectSummaryDto = {
  id?: number;
  title?: string;
  summary?: string;
  status?: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CLOSED";
  ownerName?: string;
  duration?: string;
  price?: number;
  deadline?: string;
  createDate?: string;
  skills?: SkillDto[];
  interests?: InterestDto[];
};

type FreelancerProfile = {
  id?: number;
  name?: string;
  username?: string;
  email?: string;
  profileImgUrl?: string;
  role?: string;
  status?: string;
  introduction?: string;
  careerLevel?: string;
  ratingAvg?: number;
  skills?: string[]; // 문자열 배열로 수정
  interests?: string[]; // 문자열 배열로 수정
  // 추가 필드들
  job?: string;
  career?: { [key: string]: number };
  freelancerEmail?: string;
  comment?: string;
  createdAt?: string;
};

type Evaluation = {
  evaluationId?: number;
  projectId?: number;
  evaluatorId?: number;
  evaluateeId?: number;
  comment?: string;
  ratingSatisfaction?: number;
  ratingProfessionalism?: number;
  ratingScheduleAdherence?: number;
  ratingCommunication?: number;
  ratingProactiveness?: number;
  createdAt?: string;
};

export default function FreelancerDetail({
  userType = "client",
}: FreelancerDetailProps) {
  const client = useApiClient();
  const { id } = useParams();
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "profile" | "projects" | "reviews"
  >("profile");
  const [freelancer, setFreelancer] = useState<FreelancerProfile | null>(null);
  const [participatedProjects, setParticipatedProjects] = useState<
    ProjectSummaryDto[]
  >([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [evaluationCount, setEvaluationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [evaluationsLoading, setEvaluationsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // 경력 레벨 계산 함수
  const getCareerLevelFromCareer = (career?: { [key: string]: number }) => {
    if (!career || Object.keys(career).length === 0) return "경력 미입력";
    const maxMonths = Math.max(...Object.values(career));
    const years = Math.floor(maxMonths / 12);

    if (years < 1) return "신입";
    if (years < 3) return "주니어 (1-3년)";
    if (years < 7) return "미드레벨 (3-7년)";
    return "시니어 (7년 이상)";
  };

  // 프리랜서 프로필 및 프로젝트 정보 가져오기
  useEffect(() => {
    console.log("🔍 컴포넌트 마운트:", {
      id,
      token: token ? "토큰 있음" : "토큰 없음",
      userType,
    });

    const fetchFreelancerData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // 프리랜서 프로필 조회
        const { data: profileResponse } = await client.GET(
          "/api/v1/members/{userId}/profile",
          {
            params: {
              path: {
                userId: Number(id),
              },
            },
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {},
          }
        );

        if (profileResponse?.data) {
          const profile = profileResponse.data as FreelancerProfile;
          // URL의 id를 프로필에 추가
          profile.id = Number(id);
          setFreelancer(profile);
          console.log("✅ 프리랜서 프로필 로드 완료:", {
            id: profile.id,
            name: profile.name,
            hasId: !!profile.id,
          });
        }

        // 관심 프리랜서 목록 조회하여 현재 프리랜서가 포함되어 있는지 확인
        if (token) {
          try {
            const { data: favoritesResponse } = await client.GET(
              "/api/v1/members/me/favorites/freelancers",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (favoritesResponse?.data) {
              const favoriteIds = (favoritesResponse.data as any[]).map(
                (fav: any) => fav.id
              );
              setIsFavorite(favoriteIds.includes(Number(id)));
            }
          } catch (error) {
            console.log("관심 프리랜서 목록 조회 실패 (로그인 필요):", error);
          }
        }

        // 참여한 프로젝트 목록 조회 (프리랜서인 경우에만)
        if (profileResponse?.data?.role === "FREELANCER") {
          // 참여한 프로젝트는 해당 프리랜서로 로그인했을 때만 조회 가능
          // 다른 사용자가 볼 때는 빈 배열로 처리
          setParticipatedProjects([]);
        }
      } catch (error) {
        console.error("프리랜서 정보 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancerData();
  }, [id, token]);

  // 평가 목록 가져오기 (리뷰 탭 활성화 시)
  useEffect(() => {
    const fetchEvaluations = async () => {
      if (!id || activeTab !== "reviews") return;

      try {
        setEvaluationsLoading(true);
        console.log("📊 평가 목록 조회 시작:", { userId: Number(id) });

        const { data: evaluationsResponse } = await client.GET(
          "/api/v1/evaluations/{id}",
          {
            params: {
              path: {
                id: Number(id),
              },
            },
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {},
          }
        );

        console.log("📊 평가 목록 응답:", evaluationsResponse);

        if (evaluationsResponse?.data) {
          setEvaluations(evaluationsResponse.data.evaluations || []);
          setEvaluationCount(evaluationsResponse.data.count || 0);
          console.log("✅ 평가 목록 로드 완료:", {
            count: evaluationsResponse.data.count,
            evaluations: evaluationsResponse.data.evaluations?.length,
          });
        }
      } catch (error) {
        console.error("❌ 평가 목록 조회 실패:", error);
      } finally {
        setEvaluationsLoading(false);
      }
    };

    fetchEvaluations();
  }, [id, activeTab, token]);

  // 관심 프리랜서 등록/삭제
  const handleToggleFavorite = async () => {
    console.log("🔔 버튼 클릭됨!", {
      token: token ? "토큰 있음" : "토큰 없음",
      urlId: id,
      freelancerId: freelancer?.id,
      isFavorite,
    });

    if (!token) {
      alert("⚠️ 로그인이 필요합니다.");
      return;
    }

    if (!id) {
      console.error("❌ URL 파라미터 ID가 없습니다");
      return;
    }

    const targetId = Number(id);
    console.log("관심 프리랜서 처리 시작:", {
      targetId,
      currentState: isFavorite ? "삭제" : "등록",
    });

    try {
      setFavoriteLoading(true);

      if (isFavorite) {
        // 관심 프리랜서 삭제
        console.log("📤 DELETE 요청 전송 중...", { userId: targetId });
        const response = await client.DELETE(
          "/api/v1/members/me/favorites/freelancers/{userId}",
          {
            params: {
              path: {
                userId: targetId,
              },
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("📥 DELETE 응답:", response);
        setIsFavorite(false);
        console.log("✅ 관심 프리랜서 삭제 완료");
        alert("❌ 관심 프리랜서에서 삭제되었습니다.");
      } else {
        // 관심 프리랜서 등록
        console.log("📤 POST 요청 전송 중...", { userId: targetId });
        const response = await client.POST(
          "/api/v1/members/me/favorites/freelancers",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: {
              userId: targetId,
            },
          }
        );
        console.log("📥 POST 응답:", response);
        setIsFavorite(true);
        console.log("✅ 관심 프리랜서 등록 완료");
        alert("❤️ 관심 프리랜서로 등록되었습니다!");
      }
    } catch (error) {
      console.error("❌ 관심 프리랜서 처리 실패:", error);
      alert("⚠️ 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setFavoriteLoading(false);
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            프리랜서를 찾을 수 없습니다
          </h2>
          <Link to="/freelancers">
            <Button>프리랜서 목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "프로필", icon: "ri-user-line" },
    { id: "projects", label: "참여 프로젝트", icon: "ri-briefcase-line" },
    { id: "reviews", label: "리뷰", icon: "ri-star-line" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 뒤로가기 */}
        <div className="mb-6">
          <Link
            to="/freelancers"
            className="flex items-center text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            프리랜서 목록으로 돌아가기
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 사이드바 - 프리랜서 기본 정보 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  {freelancer.name?.charAt(0) || "F"}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {freelancer.name || "프리랜서"}
                </h2>
                <p className="text-gray-600 mb-3">{freelancer.email || ""}</p>
                <div className="flex items-center justify-center mb-4">
                  <i className="ri-star-fill text-yellow-400 mr-1"></i>
                  <span className="font-semibold mr-2">
                    {freelancer.ratingAvg?.toFixed(1) || "0.0"}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({getCareerLevelFromCareer(freelancer.career)})
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <span className="text-sm text-gray-600">경력</span>
                  <p className="font-semibold text-gray-900">
                    {getCareerLevelFromCareer(freelancer.career)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">주요 기술</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {freelancer.skills && freelancer.skills.length > 0 ? (
                      freelancer.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">
                        등록된 기술이 없습니다
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">관심 분야</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {freelancer.interests && freelancer.interests.length > 0 ? (
                      freelancer.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {interest}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400">
                        등록된 관심 분야가 없습니다
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {userType === "client" &&
                (() => {
                  console.log("🎨 버튼 렌더링:", {
                    userType,
                    isFavorite,
                    favoriteLoading,
                  });
                  return (
                    <div className="space-y-3">
                      <Link to={`/freelancers/${freelancer.id}/propose`}>
                        <Button className="w-full" size="lg">
                          <i className="ri-send-plane-line mr-2"></i>
                          프로젝트 제안
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className={`w-full transition-all duration-300 ${
                          isFavorite
                            ? "border-red-500 text-red-600 hover:bg-red-50 bg-red-50"
                            : "hover:border-red-300"
                        } ${favoriteLoading ? "opacity-50" : ""}`}
                        onClick={() => {
                          console.log("🖱️ 버튼 클릭 이벤트 발생!");
                          handleToggleFavorite();
                        }}
                        disabled={favoriteLoading}
                      >
                        <i
                          className={`${
                            isFavorite
                              ? "ri-heart-fill text-red-500"
                              : "ri-heart-line"
                          } mr-2 transition-all duration-300 ${
                            favoriteLoading ? "animate-pulse" : ""
                          }`}
                        ></i>
                        {favoriteLoading
                          ? "처리 중..."
                          : isFavorite
                          ? "관심 프리랜서 해제"
                          : "관심 프리랜서 등록"}
                      </Button>
                    </div>
                  );
                })()}
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* 탭 메뉴 */}
              <div className="border-b border-gray-200">
                <div className="flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <i className={`${tab.icon} mr-2`}></i>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 탭 콘텐츠 */}
              <div className="p-6">
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        자기소개
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {freelancer.comment ||
                          freelancer.introduction ||
                          "등록된 자기소개가 없습니다."}
                      </p>
                    </div>

                    {/* 직무 및 경력 정보 */}
                    {freelancer.job && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          직무
                        </h3>
                        <p className="text-gray-700">{freelancer.job}</p>
                      </div>
                    )}

                    {freelancer.career &&
                      Object.keys(freelancer.career).length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            기술 경력
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            {Object.entries(freelancer.career).map(
                              ([tech, months]) => (
                                <div
                                  key={tech}
                                  className="p-3 bg-gray-50 rounded-lg"
                                >
                                  <p className="font-medium text-gray-900">
                                    {tech}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {months}개월
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        활동 이력
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            진행 중인 프로젝트
                          </h4>
                          <div className="space-y-2">
                            {participatedProjects.filter(
                              (p) => p.status === "IN_PROGRESS"
                            ).length > 0 ? (
                              participatedProjects
                                .filter((p) => p.status === "IN_PROGRESS")
                                .map((project) => (
                                  <div
                                    key={project.id}
                                    className="p-3 bg-blue-50 rounded-lg"
                                  >
                                    <p className="text-sm font-medium text-blue-900">
                                      {project.title}
                                    </p>
                                    <p className="text-xs text-blue-600 mt-1">
                                      {project.summary}
                                    </p>
                                    <span className="text-xs text-blue-600">
                                      진행중
                                    </span>
                                  </div>
                                ))
                            ) : (
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500">
                                  진행 중인 프로젝트가 없습니다
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            완료한 프로젝트
                          </h4>
                          <div className="space-y-2">
                            {participatedProjects.filter(
                              (p) => p.status === "COMPLETED"
                            ).length > 0 ? (
                              participatedProjects
                                .filter((p) => p.status === "COMPLETED")
                                .slice(0, 3)
                                .map((project) => (
                                  <div
                                    key={project.id}
                                    className="p-3 bg-green-50 rounded-lg"
                                  >
                                    <p className="text-sm font-medium text-green-900">
                                      {project.title}
                                    </p>
                                    <p className="text-xs text-green-600 mt-1">
                                      {project.summary}
                                    </p>
                                    <span className="text-xs text-green-600">
                                      완료
                                    </span>
                                  </div>
                                ))
                            ) : (
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500">
                                  완료한 프로젝트가 없습니다
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "projects" && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      참여 프로젝트
                    </h3>

                    {participatedProjects.length > 0 ? (
                      <div className="space-y-4">
                        {participatedProjects.map((project) => (
                          <Link
                            key={project.id}
                            to={`/projects/${project.id}`}
                            className="block p-5 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
                                  {project.title}
                                </h4>
                                <p className="text-gray-600 text-sm mb-3">
                                  {project.summary}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ml-4 ${
                                  project.status === "COMPLETED"
                                    ? "bg-green-100 text-green-700"
                                    : project.status === "IN_PROGRESS"
                                    ? "bg-blue-100 text-blue-700"
                                    : project.status === "OPEN"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {project.status === "COMPLETED"
                                  ? "완료"
                                  : project.status === "IN_PROGRESS"
                                  ? "진행중"
                                  : project.status === "OPEN"
                                  ? "모집중"
                                  : "종료"}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                              <div className="flex items-center">
                                <i className="ri-user-line mr-1"></i>
                                {project.ownerName || "클라이언트"}
                              </div>
                              <div className="flex items-center">
                                <i className="ri-time-line mr-1"></i>
                                {project.duration || "기간 미정"}
                              </div>
                              {project.price && (
                                <div className="flex items-center">
                                  <i className="ri-money-dollar-circle-line mr-1"></i>
                                  {project.price.toLocaleString()}원
                                </div>
                              )}
                            </div>

                            {project.skills && project.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {project.skills.map((skill, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs"
                                  >
                                    {typeof skill === "string"
                                      ? skill
                                      : skill.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <i className="ri-briefcase-line text-4xl text-gray-400 mb-4"></i>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          참여 프로젝트 없음
                        </h4>
                        <p className="text-gray-500">
                          아직 참여한 프로젝트가 없습니다.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        받은 리뷰
                      </h3>
                      <div className="flex items-center">
                        <i className="ri-star-fill text-yellow-400 mr-1"></i>
                        <span className="font-semibold mr-2">
                          {freelancer.ratingAvg?.toFixed(1) || "0.0"}
                        </span>
                        <span className="text-sm text-gray-500">
                          (총 {evaluationCount}개)
                        </span>
                      </div>
                    </div>

                    {evaluationsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">리뷰를 불러오는 중...</p>
                      </div>
                    ) : evaluations.length > 0 ? (
                      <div className="space-y-4">
                        {evaluations.map((evaluation) => {
                          const avgRating = Math.round(
                            ((evaluation.ratingSatisfaction || 0) +
                              (evaluation.ratingProfessionalism || 0) +
                              (evaluation.ratingScheduleAdherence || 0) +
                              (evaluation.ratingCommunication || 0) +
                              (evaluation.ratingProactiveness || 0)) /
                              5
                          );

                          return (
                            <div
                              key={evaluation.evaluationId}
                              className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <i
                                        key={i}
                                        className={`${
                                          i < avgRating
                                            ? "ri-star-fill text-yellow-400"
                                            : "ri-star-line text-gray-300"
                                        }`}
                                      ></i>
                                    ))}
                                  </div>
                                  <span className="ml-2 font-semibold text-gray-900">
                                    {avgRating}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {evaluation.createdAt
                                    ? new Date(
                                        evaluation.createdAt
                                      ).toLocaleDateString("ko-KR")
                                    : ""}
                                </span>
                              </div>

                              {evaluation.comment && (
                                <p className="text-gray-700 mb-3 leading-relaxed">
                                  {evaluation.comment}
                                </p>
                              )}

                              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                <div className="text-center p-2 bg-white rounded">
                                  <p className="text-xs text-gray-600 mb-1">
                                    만족도
                                  </p>
                                  <p className="font-semibold text-gray-900">
                                    {evaluation.ratingSatisfaction || 0}
                                  </p>
                                </div>
                                <div className="text-center p-2 bg-white rounded">
                                  <p className="text-xs text-gray-600 mb-1">
                                    전문성
                                  </p>
                                  <p className="font-semibold text-gray-900">
                                    {evaluation.ratingProfessionalism || 0}
                                  </p>
                                </div>
                                <div className="text-center p-2 bg-white rounded">
                                  <p className="text-xs text-gray-600 mb-1">
                                    일정준수
                                  </p>
                                  <p className="font-semibold text-gray-900">
                                    {evaluation.ratingScheduleAdherence || 0}
                                  </p>
                                </div>
                                <div className="text-center p-2 bg-white rounded">
                                  <p className="text-xs text-gray-600 mb-1">
                                    소통능력
                                  </p>
                                  <p className="font-semibold text-gray-900">
                                    {evaluation.ratingCommunication || 0}
                                  </p>
                                </div>
                                <div className="text-center p-2 bg-white rounded">
                                  <p className="text-xs text-gray-600 mb-1">
                                    적극성
                                  </p>
                                  <p className="font-semibold text-gray-900">
                                    {evaluation.ratingProactiveness || 0}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <i className="ri-star-line text-4xl text-gray-400 mb-4"></i>
                        <p className="text-gray-500">
                          아직 등록된 리뷰가 없습니다.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
