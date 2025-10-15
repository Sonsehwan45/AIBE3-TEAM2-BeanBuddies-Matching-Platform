import { useAuth } from "@/context/AuthContext";
import client from "@/global/backend/client";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

interface ApplicationDetailData {
  id: number;
  estimatedPay: number;
  expectedDuration: string;
  workPlan: string;
  additionalRequest: string;
  status: string;
  freelancerName: string;
  freelancerId: number;
  projectTitle: string;
  projectId: number;
  clientName: string;
  clientId: number;
  createDate: string;
  modifyDate: string;
}

export default function ApplicationDetail() {
  const { user, token, isLoggedIn } = useAuth();
  const { id, applyId } = useParams<{ id: string; applyId: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<ApplicationDetailData | null>(
    null
  );
  const [hasAccess, setHasAccess] = useState<boolean | null>(null); // 권한 체크 상태

  // 데이터 로딩
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await client.GET(
          `/api/v1/projects/${id}/applications/${applyId}`
        );
        const appData = res.data.data;
        setApplication(appData);

        // 로그인 여부 확인
        if (!isLoggedIn) {
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
        }

        // 권한 체크: 프로젝트 클라이언트 or 지원서 작성자
        const isClientOfProject = appData.clientId === user?.id;
        const isFreelancerOfApplication = appData.freelancerId === user?.id;

        if (!isClientOfProject && !isFreelancerOfApplication) {
          alert("이 지원서를 열람할 권한이 없습니다.");
          navigate(`/projects/${id}`);
          return;
        }

        setHasAccess(true); // 접근 가능
      } catch (err) {
        console.error(err);
      }
    };
    fetchApplication();
  }, [id, applyId, isLoggedIn, user, navigate]);

  const handleDelete = useCallback(async () => {
    if (!application) return;

    if (!window.confirm("정말로 이 지원서를 삭제하시겠습니까?")) return;

    try {
      const response = await client.DELETE(
        "/api/v1/projects/{projectId}/applications/{id}",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            path: {
              projectId: application.projectId,
              id: application.id,
            },
          },
        }
      );

      if (response.error) throw response.error;

      alert("지원서가 삭제되었습니다.");
      navigate(`/projects/${application.projectId}`);
    } catch (err) {
      console.error("지원서 삭제 실패:", err);
      alert("지원서 삭제에 실패했습니다.");
    }
  }, [application, token, navigate]);

  if (!application || hasAccess === null) {
    return <div className="p-6 text-gray-500">로딩 중...</div>;
  }

  // ✅ 간단한 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatPrice = (price: number) => `${price.toLocaleString()}원`;

  const getStatusText = (status: string) => {
    switch (status) {
      case "WAIT":
        return "대기 중";
      case "APPROVED":
        return "승인됨";
      case "REJECTED":
        return "거절됨";
      default:
        return "알 수 없음";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "WAIT":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* 헤더 */}
      <div className="mb-6">
        <Link
          to={`/projects/${id}`}
          className="flex items-center text-indigo-600 hover:text-indigo-700 cursor-pointer font-medium"
        >
          <i className="ri-arrow-left-line mr-2 text-lg"></i>
          프로젝트로 돌아가기
        </Link>
      </div>

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            지원서 상세보기
          </h2>
          <p className="text-gray-500 text-sm">
            프로젝트{" "}
            <span className="font-medium text-gray-700">
              {application.projectTitle}
            </span>
            에 대한 지원 내역
          </p>
        </div>
        <span
          className={`px-4 py-2 text-sm font-semibold rounded-full shadow-sm ${getStatusStyle(
            application.status
          )}`}
        >
          {getStatusText(application.status)}
        </span>
      </div>

      {/* 본문 카드 */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
        <div className="p-8 grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              프로젝트명
            </h3>
            <p className="text-lg font-semibold text-gray-900">
              {application.projectTitle}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">지원자명</h3>
            <p className="text-lg font-semibold text-gray-900">
              {application.freelancerName}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              예상 견적
            </h3>
            <p className="text-lg text-gray-900">
              {formatPrice(application.estimatedPay)}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              예상 기간
            </h3>
            <p className="text-lg text-gray-900">
              {application.expectedDuration}
            </p>
          </div>

          <div className="col-span-2">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              업무 계획
            </h3>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-gray-800 whitespace-pre-line">
              {application.workPlan}
            </div>
          </div>

          <div className="col-span-2">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              추가 요청사항
            </h3>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-gray-800 whitespace-pre-line">
              {application.additionalRequest || "없음"}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">지원일</h3>
            <p className="text-gray-900">
              {formatDate(application.createDate)}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              마지막 수정일
            </h3>
            <p className="text-gray-900">
              {formatDate(application.modifyDate)}
            </p>
          </div>
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="flex justify-end gap-4 mt-10">
        {isLoggedIn &&
          user?.role === "FREELANCER" &&
          user?.id === application.freelancerId && (
            <button
              onClick={handleDelete}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg shadow-md hover:scale-105 transform transition flex items-center"
            >
              <i className="ri-delete-bin-line mr-2"></i>
              삭제하기
            </button>
          )}
      </div>
    </div>
  );
}
