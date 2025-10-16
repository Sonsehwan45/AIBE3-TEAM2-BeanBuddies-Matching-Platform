import { useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { mockProjects } from "../../mocks/users";
import Button from "../../components/base/Button";
import { client } from "../../lib/backend/client";

export default function Evaluation() {
  const { type, projectId } = useParams(); // type: 'client' | 'freelancer'
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    professionalism: 0,
    scheduleAdherence: 0,
    communication: 0,
    proactiveness: 0,
    comment: "",
  });
  //커밋 위치 확인용 주석
  const [isSubmitting, setIsSubmitting] = useState(false);

  const project = mockProjects.find((p) => p.id === Number(projectId));
  const isEvaluatingClient = type === "client";

  const handleRatingChange = (category: string, rating: number) => {
    setFormData((prev) => ({ ...prev, [category]: rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (formData.professionalism === 0) {
      alert("전문성 평점을 선택해주세요.");
      return;
    }
    if (formData.scheduleAdherence === 0) {
      alert("일정 준수 평점을 선택해주세요.");
      return;
    }
    if (formData.communication === 0) {
      alert("커뮤니케이션 평점을 선택해주세요.");
      return;
    }
    if (formData.proactiveness === 0) {
      alert("적극성 평점을 선택해주세요.");
      return;
    }
    if (formData.comment.length < 20) {
      alert("피드백을 최소 20자 이상 작성해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // URL에서 evaluateeId 가져오기 (location.state에서 전달받을 수도 있음)
      const evaluateeId = location.state?.evaluateeId;

      if (!evaluateeId) {
        alert("평가 대상 정보를 찾을 수 없습니다.");
        return;
      }

      const { error } = await client.POST("/api/v1/evaluations", {
        body: {
          projectId: Number(projectId),
          evaluateeId: evaluateeId,
          ratings: {
            professionalism: formData.professionalism,
            scheduleAdherence: formData.scheduleAdherence,
            communication: formData.communication,
            proactiveness: formData.proactiveness,
          },
          comment: formData.comment,
        },
      });

      if (error) {
        console.error("평가 제출 실패:", error);
        alert("평가 제출에 실패했습니다. 다시 시도해주세요.");
        return;
      }

      alert("평가가 성공적으로 제출되었습니다!");
      navigate("/mypage");
    } catch (error) {
      console.error("평가 제출 중 오류:", error);
      alert("평가 제출 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            프로젝트를 찾을 수 없습니다
          </h2>
          <Link to="/mypage">
            <Button>마이페이지로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  const RatingStars = ({
    rating,
    onRatingChange,
    label,
    required = false,
  }: {
    rating: number;
    onRatingChange: (rating: number) => void;
    label: string;
    required?: boolean;
  }) => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="text-3xl cursor-pointer transition-all duration-200 hover:scale-110"
          >
            <i
              className={`ri-star-${star <= rating ? "fill" : "line"} ${
                star <= rating
                  ? "text-yellow-400"
                  : "text-gray-300 hover:text-yellow-300"
              }`}
            ></i>
          </button>
        ))}
        <span className="ml-3 text-lg font-medium text-gray-600">
          ({rating}/5)
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 뒤로가기 */}
        <div className="mb-8">
          <Link
            to="/mypage"
            className="flex items-center text-indigo-600 hover:text-indigo-700 cursor-pointer group"
          >
            <i className="ri-arrow-left-line mr-2 group-hover:-translate-x-1 transition-transform"></i>
            마이페이지로 돌아가기
          </Link>
        </div>

        {/* 평가 대상 정보 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl">
              <i className="ri-user-star-line text-white text-2xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                평가 대상 정보
              </h2>
              <p className="text-gray-600">
                프로젝트와 관련된 정보를 확인하세요
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {isEvaluatingClient ? "클라이언트" : "프리랜서"}
                </h3>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {isEvaluatingClient
                      ? project.clientName.charAt(0)
                      : project.selectedFreelancer?.name?.charAt(0) || "F"}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {isEvaluatingClient
                        ? project.clientName
                        : project.selectedFreelancer?.name || "프리랜서"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {isEvaluatingClient ? "의뢰자" : "개발자"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  프로젝트 정보
                </h3>
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  {project.title}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">기간:</span>
                    <span className="ml-2 font-medium">{project.duration}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">예산:</span>
                    <span className="ml-2 font-medium">
                      {project.finalBudget || project.budget}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">완료일:</span>
                    <span className="ml-2 font-medium">
                      {project.completedAt || "2024-01-20"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">상태:</span>
                    <span className="ml-2 font-medium text-purple-600">
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 평가 폼 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">
              {isEvaluatingClient ? "클라이언트" : "프리랜서"} 평가하기
            </h1>
            <p className="text-indigo-100">
              프로젝트 경험을 바탕으로 솔직한 평가를 남겨주세요
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* 세부 평가 */}
              <div className="pb-8 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  세부 평가
                </h3>
                <p className="text-center text-gray-600 mb-8">
                  4개 항목의 평균으로 전체 만족도가 자동 계산됩니다
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-blue-50 rounded-2xl p-6">
                    <RatingStars
                      rating={formData.professionalism}
                      onRatingChange={(rating) =>
                        handleRatingChange("professionalism", rating)
                      }
                      label={isEvaluatingClient ? "프로젝트 관리" : "전문성"}
                      required={true}
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      {isEvaluatingClient
                        ? "프로젝트 진행 관리 및 요구사항 전달"
                        : "업무 처리 능력 및 기술적 역량"}
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-2xl p-6">
                    <RatingStars
                      rating={formData.scheduleAdherence}
                      onRatingChange={(rating) =>
                        handleRatingChange("scheduleAdherence", rating)
                      }
                      label={
                        isEvaluatingClient ? "급여 일정 준수" : "일정 준수"
                      }
                      required={true}
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      {isEvaluatingClient
                        ? "약속된 급여 지급 일정 준수"
                        : "협의된 프로젝트 기한 준수"}
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-2xl p-6">
                    <RatingStars
                      rating={formData.communication}
                      onRatingChange={(rating) =>
                        handleRatingChange("communication", rating)
                      }
                      label="커뮤니케이션"
                      required={true}
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      의사소통 능력 및 응답 속도
                    </p>
                  </div>

                  <div className="bg-yellow-50 rounded-2xl p-6">
                    <RatingStars
                      rating={formData.proactiveness}
                      onRatingChange={(rating) =>
                        handleRatingChange("proactiveness", rating)
                      }
                      label="적극성"
                      required={true}
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      문제 해결 및 제안의 능동성
                    </p>
                  </div>
                </div>
              </div>

              {/* 피드백 작성 */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  상세 피드백 <span className="text-red-500">*</span>
                </label>
                <div className="bg-gray-50 rounded-2xl p-6">
                  <textarea
                    value={formData.comment}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    placeholder={`${
                      isEvaluatingClient ? "클라이언트" : "프리랜서"
                    }와의 협업 경험을 자유롭게 작성해주세요.

• 좋았던 점
• 아쉬웠던 점
• 개선사항
• 추천 여부 등${isEvaluatingClient ? "\n• 급여 지급 과정에서의 경험" : ""}`}
                    rows={8}
                    className="w-full px-4 py-3 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none bg-white"
                    disabled={isSubmitting}
                  />
                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-sm text-gray-500 flex items-center">
                      <i className="ri-information-line mr-1"></i>
                      최소 20자 이상 작성해주세요
                    </p>
                    <span
                      className={`text-sm ${
                        formData.comment.length >= 20
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {formData.comment.length}/20
                    </span>
                  </div>
                </div>
              </div>

              {/* 제출 버튼 */}
              <div className="flex space-x-4 pt-8">
                <Link to="/mypage" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl py-4 text-lg"
                    disabled={isSubmitting}
                  >
                    <i className="ri-close-line mr-2"></i>
                    취소
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1 rounded-xl py-4 text-lg bg-gradient-to-r from-indigo-500 to-purple-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <i className="ri-loader-4-line mr-2 animate-spin"></i>
                      제출 중...
                    </>
                  ) : (
                    <>
                      <i className="ri-send-plane-fill mr-2"></i>
                      평가 제출
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* 안내사항 */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mt-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <i className="ri-information-line text-amber-600 text-lg"></i>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-amber-800 mb-2">
                평가 작성 안내
              </h3>
              <ul className="space-y-2 text-sm text-amber-700">
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-line mr-2 mt-0.5 text-amber-600"></i>
                  평가는 제출 후 수정이 불가능합니다
                </li>
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-line mr-2 mt-0.5 text-amber-600"></i>
                  객관적이고 건설적인 피드백을 작성해주세요
                </li>
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-line mr-2 mt-0.5 text-amber-600"></i>
                  평가 내용은 상대방에게 공개됩니다
                </li>
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-line mr-2 mt-0.5 text-amber-600"></i>
                  부적절한 내용의 평가는 관리자에 의해 삭제될 수 있습니다
                </li>
                <li className="flex items-start">
                  <i className="ri-checkbox-circle-line mr-2 mt-0.5 text-amber-600"></i>
                  전체 만족도는 4개 평가 항목의 평균으로 자동 계산됩니다
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
