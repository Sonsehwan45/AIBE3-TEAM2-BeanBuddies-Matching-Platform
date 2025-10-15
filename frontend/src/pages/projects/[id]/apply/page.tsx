import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../../../../components/base/Button";
import Input from "../../../../components/base/Input";
import client from "../../../../global/backend/client";

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

export default function ProjectApply() {
  const { user, token, isLoggedIn } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    estimatedPay: "",
    expectedDuration: "",
    workPlan: "",
    additionalRequest: "",
  });

  const [submitting, setSubmitting] = useState(false);

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

        if (!response || !response.data.data) {
          throw new Error("프로젝트 데이터가 없습니다.");
        }

        setProject(response.data.data);
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (submitting) return;
    setSubmitting(true);

    try {
      // 입력값 검증
      if (!formData.estimatedPay || Number(formData.estimatedPay) <= 0) {
        alert("유효한 예상 급여를 입력해주세요.");
        return;
      }
      if (!formData.expectedDuration.trim()) {
        alert("예상 기간을 입력해주세요.");
        return;
      }
      if (!formData.workPlan.trim()) {
        alert("작업 계획을 입력해주세요.");
        return;
      }
      if (!formData.additionalRequest.trim()) {
        alert("추가 요청사항을 입력해주세요.");
        return;
      }

      // API 요청
      if (!project || !project.id) {
        throw new Error("프로젝트 정보가 없습니다.");
      }

      const response = await client.POST(
        "/api/v1/projects/{projectId}/applications",
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ 토큰 포함
          },
          params: { path: { projectId: project.id } },
          body: {
            estimatedPay: Number(formData.estimatedPay),
            expectedDuration: formData.expectedDuration,
            workPlan: formData.workPlan,
            additionalRequest: formData.additionalRequest,
          },
        }
      );

      if (!response || response.error) {
        throw new Error(response?.error?.msg || "지원서 제출에 실패했습니다.");
      }

      alert("지원서가 성공적으로 제출되었습니다!");
      navigate(`/projects/${project.id}`);
    } catch (err: any) {
      console.error("지원서 제출 실패:", err);
      alert(err.message || "지원서 제출에 실패했습니다.");
    } finally {
      setSubmitting(false);
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 뒤로가기 */}
        <div className="mb-6">
          <Link
            to={`/projects/${project.id}`}
            className="flex items-center text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            프로젝트 상세로 돌아가기
          </Link>
        </div>

        {/* 프로젝트 요약 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {project.title}
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>
              예산:{" "}
              {new Intl.NumberFormat("ko-KR", {
                style: "currency",
                currency: "KRW",
              }).format(project.price)}
            </span>
            <span>기간: {project.duration}</span>
            <span>클라이언트: {project.ownerName}</span>
          </div>
        </div>

        {/* 지원서 작성 폼 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              지원서 작성
            </h1>
            <p className="text-gray-600">
              프로젝트에 대한 상세한 제안을 작성해주세요.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="예상 견적"
              type="number"
              value={formData.estimatedPay}
              onChange={(e) =>
                handleInputChange("estimatedPay", e.target.value)
              }
              placeholder="예: 25000000"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                작업 계획 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.workPlan}
                onChange={(e) => handleInputChange("workPlan", e.target.value)}
                placeholder="프로젝트를 어떻게 진행할 계획인지 상세히 작성해주세요."
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <Input
              label="예상 작업 기간"
              value={formData.expectedDuration}
              onChange={(e) =>
                handleInputChange("expectedDuration", e.target.value)
              }
              placeholder="예: 2.5개월"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                추가 요청사항 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.additionalRequest}
                onChange={(e) =>
                  handleInputChange("additionalRequest", e.target.value)
                }
                placeholder="프로젝트 진행 시 필요한 추가 요청사항이나 문의사항을 작성해주세요."
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* 
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">첨부 파일</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <i className="ri-file-text-line text-3xl text-gray-400 mb-2"></i>
                  <p className="text-sm text-gray-600 mb-2">이력서 첨부</p>
                  <Button variant="outline" size="sm">
                    파일 선택
                  </Button>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <i className="ri-folder-line text-3xl text-gray-400 mb-2"></i>
                  <p className="text-sm text-gray-600 mb-2">포트폴리오 첨부</p>
                  <Button variant="outline" size="sm">
                    파일 선택
                  </Button>
                </div>
              </div>
            </div>*/}

            {/* 제출 버튼 */}
            <div className="flex space-x-4 pt-6">
              <Link to={`/projects/${project.id}`} className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  취소
                </Button>
              </Link>
              <Button type="submit" className="flex-1" size="lg">
                지원서 제출
              </Button>
            </div>
          </form>
        </div>

        {/* 안내사항 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex">
            <i className="ri-information-line text-blue-500 text-lg mr-3 mt-0.5"></i>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">지원서 제출 전 확인사항</p>
              <ul className="space-y-1 text-blue-700">
                <li>• 제출한 지원서는 수정이 불가능합니다.</li>
                <li>• 클라이언트의 검토 후 연락을 받게 됩니다.</li>
                <li>• 허위 정보 기재 시 계정이 제재될 수 있습니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
