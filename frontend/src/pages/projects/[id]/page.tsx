import { useAuth } from "@/context/AuthContext";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../../../components/base/Button";
import client from "../../../global/backend/client";

interface Project {
  id: number;
  title: string;
  summary: string;
  duration: string;
  price: number;
  preferredCondition: string;
  payCondition: string;
  workingCondition: string;
  description: string;
  deadline: string;
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CLOSED";
  createDate: string;
  modifyDate: string;
  ownerName: string;
  ownerId: number;
  skills: Array<{
    id: number;
    name: string;
  }>;
  interests: Array<{
    id: number;
    name: string;
  }>;
}

interface Application {
  id: number;
  estimatedPay: number;
  expectedDuration: string;
  workPlan: string;
  status: "WAIT" | "ACCEPT" | "DENIED";
  freelancerName: string;
  freelancerId: number;
  projectTitle: string;
  projectId: number;
  createDate: string;
}

interface PageInfo {
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

export default function ProjectDetail() {
  const { user, token, isLoggedIn } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  // 모든 상태값들을 최상단에 선언
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [page, setPage] = useState(0);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [loadingApplications, setLoadingApplications] = useState(false);

  // 프로젝트 정보 가져오기
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          setError("프로젝트 ID가 없습니다.");
          return;
        }

        const response = await client.GET("/api/v1/projects/{id}", {
          params: { path: { id: parseInt(id) } },
        });

        if (!response || !response.data) {
          throw new Error("프로젝트 데이터가 없습니다.");
        }

        setProject(response.data);
      } catch (err: any) {
        console.error("프로젝트 조회 실패:", err);
        setError(
          err.message || "프로젝트 정보를 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // 지원서 목록 가져오기
  useEffect(() => {
    const fetchApplications = async () => {
      if (!id) return;

      try {
        setLoadingApplications(true);
        const response = await client.GET(
          "/api/v1/projects/{projectId}/applications",
          {
            params: {
              path: { projectId: parseInt(id) },
              query: {
                page: page,
                size: 5,
                sort: "createDate,desc",
              },
            },
          }
        );

        if (response.data?.data) {
          setApplications(response.data.data.content);
          setPageInfo({
            pageNumber: response.data.data.number,
            pageSize: response.data.data.size,
            totalElements: response.data.data.totalElements,
            totalPages: response.data.data.totalPages,
            last: response.data.data.last,
            first: response.data.data.first,
          });
        }
      } catch (err) {
        console.error("지원서 목록 조회 실패:", err);
      } finally {
        setLoadingApplications(false);
      }
    };

    fetchApplications();
  }, [id, page]);

  // 삭제 핸들러를 useCallback으로 메모이제이션
  const handleDelete = useCallback(async () => {
    if (!project || !window.confirm("정말로 이 프로젝트를 삭제하시겠습니까?"))
      return;

    try {
      const response = await client.DELETE("/api/v1/projects/{id}", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { path: { id: project.id } },
      });
      if (response.error) throw response.error;

      alert("프로젝트가 삭제되었습니다.");
      navigate("/projects");
    } catch (err) {
      console.error("프로젝트 삭제 실패:", err);
      alert("프로젝트 삭제에 실패했습니다.");
    }
  }, [project, navigate]);

  // 프로젝트 상태에 따른 배지 스타일
  const getStatusStyle = (status: Project["status"]) => {
    switch (status) {
      case "OPEN":
        return "bg-gradient-to-r from-green-400 to-green-600 text-white";
      case "IN_PROGRESS":
        return "bg-gradient-to-r from-blue-400 to-blue-600 text-white";
      case "COMPLETED":
        return "bg-gradient-to-r from-gray-400 to-gray-600 text-white";
      case "CLOSED":
        return "bg-gradient-to-r from-red-400 to-red-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-600 text-white";
    }
  };

  // 상태 텍스트 변환
  const getStatusText = (status: Project["status"]) => {
    switch (status) {
      case "OPEN":
        return "모집중";
      case "IN_PROGRESS":
        return "진행중";
      case "COMPLETED":
        return "완료";
      case "CLOSED":
        return "마감";
      default:
        return status;
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 금액 포맷팅
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(price);
  };

  // 상태에 따른 스타일
  const getApplicationStatusStyle = (status: Application["status"]) => {
    switch (status) {
      case "WAIT":
        return "bg-yellow-100 text-yellow-800";
      case "ACCEPT":
        return "bg-green-100 text-green-800";
      case "DENIED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 상태 텍스트 변환
  const getApplicationStatusText = (status: Application["status"]) => {
    switch (status) {
      case "WAIT":
        return "검토중";
      case "ACCEPT":
        return "승인";
      case "DENIED":
        return "거절";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">프로젝트 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || "프로젝트를 찾을 수 없습니다"}
          </h2>
          <Link to="/projects">
            <Button>프로젝트 목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 뒤로가기 */}
        <div className="mb-6">
          <Link
            to="/projects"
            className="flex items-center text-indigo-600 hover:text-indigo-700 cursor-pointer font-medium"
          >
            <i className="ri-arrow-left-line mr-2 text-lg"></i>
            프로젝트 목록으로 돌아가기
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          {/* 상태 배지 & 분야 */}
          <div className="flex items-center space-x-4 mb-4">
            <span
              className={`px-4 py-2 rounded-full text-sm font-bold shadow-md ${getStatusStyle(
                project.status
              )}`}
            >
              {getStatusText(project.status)}
            </span>
            {project.interests.map((interest) => (
              <span
                key={interest.id}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
              >
                {interest.name}
              </span>
            ))}
          </div>

          {/* 제목 & 메타 정보 */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {project.title}
          </h1>
          <div className="flex items-center space-x-6 text-gray-600">
            <span className="flex items-center">
              <i className="ri-building-line mr-2 text-indigo-500"></i>
              <span className="font-medium">{project.ownerName}</span>
            </span>
            <span className="flex items-center">
              <i className="ri-calendar-line mr-2 text-blue-500"></i>
              <span>등록: {formatDate(project.createDate)}</span>
            </span>
            <span className="flex items-center">
              <i className="ri-calendar-deadline-line mr-2 text-red-500"></i>
              <span>마감: {formatDate(project.deadline)}</span>
            </span>
          </div>
        </div>

        {/* 프로젝트 정보 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="space-y-10">
            {/* 프로젝트 개요 */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                프로젝트 개요
              </h2>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <i className="ri-wallet-3-line text-white text-2xl"></i>
                    </div>
                    <p className="text-sm text-gray-600 font-medium mb-1">
                      프로젝트 예산
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPrice(project.price)}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <i className="ri-time-line text-white text-2xl"></i>
                    </div>
                    <p className="text-sm text-gray-600 font-medium mb-1">
                      예상 기간
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {project.duration}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <i className="ri-calendar-line text-white text-2xl"></i>
                    </div>
                    <p className="text-sm text-gray-600 font-medium mb-1">
                      지원 마감일
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatDate(project.deadline)}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <i className="ri-bookmark-line text-white text-2xl"></i>
                    </div>
                    <p className="text-sm text-gray-600 font-medium mb-1">
                      프로젝트 분야
                    </p>
                    <p className="text-xl font-bold text-purple-600">
                      {project.interests
                        .map((interest) => interest.name)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 프로젝트 상세 */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                프로젝트 상세 설명
              </h3>
              <div className="prose max-w-none bg-gray-50 rounded-2xl p-8">
                <div className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </div>
              </div>
            </div>

            {/* 기술 스택 */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                🛠️ 요구 기술 스택
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {project.skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                      <i className="ri-code-line text-white"></i>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {skill.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 우대사항 */}
            {project.preferredCondition && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  ⭐ 우대 사항
                </h3>
                <div className="bg-yellow-50 rounded-2xl p-8 border border-yellow-200">
                  <div className="prose max-w-none">
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {project.preferredCondition}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 급여 조건 */}
            {project.payCondition && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  💰 급여 조건
                </h3>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200">
                  <div className="prose max-w-none">
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {project.payCondition}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 업무 조건 */}
            {project.workingCondition && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  🏢 업무 조건
                </h3>
                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                  <div className="prose max-w-none">
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {project.workingCondition}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 지원서 목록 */}
            {isLoggedIn &&
              user?.role === "CLIENT" &&
              user?.id === project?.ownerId && (
                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    📝 지원서 목록
                  </h3>
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    {loadingApplications ? (
                      <div className="p-8 text-center">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-gray-600">지원서를 불러오는 중...</p>
                      </div>
                    ) : applications.length === 0 ? (
                      <div className="p-8 text-center text-gray-600">
                        아직 지원서가 없습니다.
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                                  지원자
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                                  예상 견적
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                                  예상 기간
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                                  업무 계획
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                                  상태
                                </th>
                                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                                  지원일
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {applications.map((application) => (
                                <tr key={application.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {application.freelancerName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatPrice(application.estimatedPay)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {application.expectedDuration}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-900">
                                    {application.workPlan}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getApplicationStatusStyle(
                                        application.status
                                      )}`}
                                    >
                                      {getApplicationStatusText(
                                        application.status
                                      )}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {formatDate(application.createDate)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {/* 페이지네이션 */}
                        {pageInfo && (
                          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-700">
                                총{" "}
                                <span className="font-medium">
                                  {pageInfo.totalElements}
                                </span>{" "}
                                개의 지원서
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() =>
                                  setPage((prev) => Math.max(0, prev - 1))
                                }
                                disabled={pageInfo.first}
                                className={`px-3 py-1 rounded ${
                                  pageInfo.first
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                                }`}
                              >
                                이전
                              </button>
                              <div className="px-2 py-1 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700">
                                {pageInfo.pageNumber + 1} /{" "}
                                {pageInfo.totalPages}
                              </div>
                              <button
                                onClick={() => setPage((prev) => prev + 1)}
                                disabled={pageInfo.last}
                                className={`px-3 py-1 rounded ${
                                  pageInfo.last
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                                }`}
                              >
                                다음
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

            {/* 버튼 영역 */}
            <div className="flex justify-end space-x-4 mt-8">
              {/* 클라이언트용 버튼 */}
              {isLoggedIn &&
                user?.role === "CLIENT" &&
                user?.id === project?.ownerId && (
                  <div className="client-only-buttons flex space-x-4">
                    <Link to={`/projects/${project.id}/edit`}>
                      <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:scale-105 transform transition flex items-center">
                        <i className="ri-edit-line mr-2"></i>
                        수정하기
                      </button>
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg shadow-md hover:scale-105 transform transition flex items-center"
                    >
                      <i className="ri-delete-bin-line mr-2"></i>
                      삭제하기
                    </button>
                  </div>
                )}

              {/* 프리랜서용 버튼 */}
              {isLoggedIn && user?.role === "FREELANCER" && (
                <div className="freelancer-only-buttons">
                  <Link to={`/projects/${project.id}/apply`}>
                    <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg shadow-md hover:scale-105 transform transition flex items-center">
                      <i className="ri-file-edit-line mr-2"></i>
                      지원서 작성하기
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
