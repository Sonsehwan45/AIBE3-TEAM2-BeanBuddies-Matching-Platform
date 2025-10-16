import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../../components/base/Button";
import Input from "../../../components/base/Input";
import toast from "react-hot-toast";
import { useApiClient } from "@/lib/backend/apiClient";

export default function ForgotPassword() {
  const client = useApiClient();
  const navigate = useNavigate();

  const [step, setStep] = useState<"info" | "verification" | "reset">("info");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    verificationCode: "",
    newPassword: "",
    newPasswordConfirm: "",
  });

  //인증 관련 상태
  const [emailSent, setEmailSent] = useState(false);

  //오류 상태
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors([]);
  };

  // 단계가 바뀔 때 초기화
  const handleStepChange = (newStep: "info" | "verification" | "reset") => {
    setFormErrors([]);
    setStep(newStep);
  };

  // 계정 정보 확인 → 인증 코드 전송
  const sendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await client.POST("/api/v1/members/password-reset/email", {
        body: { username: formData.username, email: formData.email },
        throwHttpErrors: false,
      });

      if (res.response.ok && res.data) {
        setEmailSent(true);
        toast.success(res.data.msg || "인증 코드가 이메일로 전송");
        handleStepChange("verification");
      } else {
        const { msg } = res.error ?? {};
        setFormErrors(Array.isArray(msg) ? msg : [msg]);
      }
    } catch (err) {
      toast.error("서버 오류가 발생했습니다.");
    }
  };

  // 인증 코드 확인
  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await client.POST(
        "/api/v1/members/password-reset/verification",
        {
          body: {
            username: formData.username,
            email: formData.email,
            code: formData.verificationCode,
          },
          throwHttpErrors: false,
        }
      );

      if (res.response.ok && res.data) {
        toast.success(res.data.msg || "인증 완료");
        handleStepChange("reset");
      } else {
        const { msg } = res.error ?? {};
        setFormErrors(Array.isArray(msg) ? msg : [msg]);
      }
    } catch (err) {
      toast.error("서버 오류가 발생했습니다.");
    }
  };

  //비밀번호 재설정
  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await client.PATCH("/api/v1/members/password-reset", {
        body: {
          username: formData.username,
          email: formData.email,
          newPassword: formData.newPassword,
          newPasswordConfirm: formData.newPasswordConfirm,
        },
        throwHttpErrors: false,
      });

      if (res.response.ok && res.data) {
        toast.success(res.data.msg || "비밀번호가 성공적으로 변경되었습니다.");
        navigate("/login");
      } else {
        const { msg } = res.error ?? {};
        setFormErrors(Array.isArray(msg) ? msg : [msg]);
      }
    } catch (err) {
      console.error(err);
      toast.error("서버 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">비밀번호 재설정</h2>
          <p className="mt-2 text-gray-600">
            {step === "info" && "아이디와 이메일을 입력해주세요"}
            {step === "verification" && "인증 코드를 입력해주세요"}
            {step === "reset" && "새 비밀번호를 설정해주세요"}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          {/* 단계 표시 */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {["계정 정보 입력", "인증 확인", "비밀번호 재설정"].map(
                (label, index) => (
                  <div key={label} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        (step === "info" && index === 0) ||
                        (step === "verification" && index === 1) ||
                        (step === "reset" && index === 2)
                          ? "bg-blue-600 text-white"
                          : index <
                            (step === "info"
                              ? 0
                              : step === "verification"
                              ? 1
                              : 2)
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {index <
                      (step === "info"
                        ? 0
                        : step === "verification"
                        ? 1
                        : 2) ? (
                        <i className="ri-check-line"></i>
                      ) : (
                        index + 1
                      )}
                    </div>
                    {index < 2 && (
                      <div
                        className={`w-16 h-0.5 mx-2 ${
                          index <
                          (step === "info"
                            ? 0
                            : step === "verification"
                            ? 1
                            : 2)
                            ? "bg-green-600"
                            : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                )
              )}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>계정 정보</span>
              <span>인증 확인</span>
              <span>비밀번호 재설정</span>
            </div>
          </div>

          {/* 계정 정보 입력 단계 */}
          {step === "info" && (
            <form onSubmit={sendVerificationCode} className="space-y-6">
              <Input
                label="아이디"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="등록된 아이디를 입력하세요"
                required
              />

              <Input
                label="이메일"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="등록된 이메일 주소를 입력하세요"
                required
              />

              {formErrors.length > 0 && (
                <ul className="text-red-500 text-sm mt-2 list-disc ml-5">
                  {formErrors.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              )}

              <Button type="submit" className="w-full" size="lg">
                인증 코드 전송
              </Button>
            </form>
          )}

          {/* 인증 코드 확인 단계 */}
          {step === "verification" && (
            <form onSubmit={verifyCode} className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>{formData.email}</strong>로 인증 코드를 전송했습니다.
                </p>
                <Input
                  label="인증 코드"
                  value={formData.verificationCode}
                  onChange={(e) =>
                    handleInputChange("verificationCode", e.target.value)
                  }
                  placeholder="6자리 인증 코드를 입력하세요"
                  required
                />
              </div>

              {formErrors.length > 0 && (
                <ul className="text-red-500 text-sm mt-2 list-disc ml-5">
                  {formErrors.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              )}

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("info")}
                  className="flex-1"
                >
                  이전
                </Button>
                <Button type="submit" className="flex-1">
                  인증 확인
                </Button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-500 cursor-pointer"
                >
                  인증 코드 재전송
                </button>
              </div>
            </form>
          )}

          {/* 비밀번호 재설정 단계 */}
          {step === "reset" && (
            <form onSubmit={resetPassword} className="space-y-6">
              <Input
                label="새 비밀번호"
                type="password"
                value={formData.newPassword}
                onChange={(e) =>
                  handleInputChange("newPassword", e.target.value)
                }
                placeholder="4자 이상의 새 비밀번호"
                required
              />

              <Input
                label="비밀번호 확인"
                type="password"
                value={formData.newPasswordConfirm}
                onChange={(e) =>
                  handleInputChange("newPasswordConfirm", e.target.value)
                }
                placeholder="새 비밀번호를 다시 입력하세요"
                required
              />

              {formErrors.length > 0 && (
                <ul className="text-red-500 text-sm mt-2 list-disc ml-5">
                  {formErrors.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              )}

              <Button type="submit" className="w-full" size="lg">
                비밀번호 재설정
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:text-blue-500 cursor-pointer"
            >
              로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
