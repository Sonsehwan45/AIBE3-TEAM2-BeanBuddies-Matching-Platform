import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../../components/base/Button";
import Input from "../../../components/base/Input";
import { useApiClient } from "@/lib/backend/apiClient";
import toast from "react-hot-toast";

export default function ChangePassword() {
  const client = useApiClient();
  const { token } = useAuth(); // 로그인 시 저장된 토큰

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    newPasswordConfirm: "",
  });

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewPasswordConfirm, setShowNewPasswordConfirm] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors([]); // 입력 시 기존 에러 초기화
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormErrors([]);

    setIsLoading(true);
    try {
      const res = await client.PATCH("/api/v1/members/password", {
        body: formData,
        throwHttpErrors: false,
      });

      if (res.response.ok && res.data) {
        toast.success(res.data.msg || "비밀번호 변경 성공");
        navigate("/mypage", { replace: true });
      } else {
        const { msg } = res.error ?? {};
        const messages = Array.isArray(msg) ? msg : [msg];
        setFormErrors(messages.filter(Boolean));
      }
    } catch (err) {
      toast.error("서버 오류가 발생했습니다.", { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">비밀번호 변경</h2>
          <p className="mt-2 text-gray-600">
            보안을 위해 정기적으로 비밀번호를 변경하세요
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 현재 비밀번호 */}
            <div className="relative">
              <Input
                name="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="현재 비밀번호"
                value={formData.currentPassword}
                onChange={(e) =>
                  handleInputChange("currentPassword", e.target.value)
                }
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i
                  className={`ri-eye-line ${
                    showCurrentPassword ? "ri-eye-off-line" : ""
                  }`}
                ></i>
              </button>
            </div>

            {/* 새 비밀번호 */}
            <div className="relative">
              <Input
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="새 비밀번호"
                value={formData.newPassword}
                onChange={(e) =>
                  handleInputChange("newPassword", e.target.value)
                }
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i
                  className={`ri-eye-line ${
                    showNewPassword ? "ri-eye-off-line" : ""
                  }`}
                ></i>
              </button>
            </div>

            {/* 새 비밀번호 확인 */}
            <div className="relative">
              <Input
                name="newPasswordConfirm"
                type={showNewPasswordConfirm ? "text" : "password"}
                placeholder="새 비밀번호 확인"
                value={formData.newPasswordConfirm}
                onChange={(e) =>
                  handleInputChange("newPasswordConfirm", e.target.value)
                }
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowNewPasswordConfirm(!showNewPasswordConfirm)
                }
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i
                  className={`ri-eye-line ${
                    showNewPasswordConfirm ? "ri-eye-off-line" : ""
                  }`}
                ></i>
              </button>
            </div>

            {/* 폼 하단 에러 */}
            {formErrors.length > 0 && (
              <ul className="text-red-500 text-sm mt-2 list-disc ml-5">
                {formErrors.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            )}

            <Button
              type="submit"
              className="w-full mt-4"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "변경 중..." : "비밀번호 변경"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/mypage"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              취소
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
