import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../../components/base/Button";
import Input from "../../../components/base/Input";
import { useApiClient } from "@/lib/backend/apiClient";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuth();
  const client = useApiClient();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState<string[]>([]); // <-- 폼 하단용

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormErrors([]); // 기존 에러 초기화

    try {
      const res = await client.POST("/api/v1/auth/login", {
        body: formData,
        throwHttpErrors: false,
      });

      if (res.response.ok && res.data) {
        // 성공
        if (res.data.data) setUser(res.data.data);

        toast.success(res.data.msg || "로그인 성공!", { duration: 3000 });
        navigate("/", { replace: true });
      } else {
        // 실패
        const { resultCode, msg } = res.error ?? {};

        // 폼 하단 표시
        const messages = Array.isArray(msg) ? msg : [msg];
        setFormErrors(messages.filter(Boolean));
      }
    } catch (err: any) {
      toast.error("알 수 없는 에러가 발생했습니다.", { duration: 3000 });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">로그인</h2>
          <p className="mt-2 text-gray-600">계정에 로그인하세요</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              name="username"
              label="아이디"
              type="text"
              placeholder="아이디를 입력하세요"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              required
            />

            <Input
              name="password"
              label="비밀번호"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
            />

            {/* 에러 메시지 폼 하단 표시 */}
            {formErrors.length > 0 && (
              <ul className="text-red-500 text-sm mt-2 list-disc ml-5">
                {formErrors.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">
                  로그인 상태 유지
                </span>
              </label>

              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500 cursor-pointer"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg">
              로그인
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin("Google")}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-pointer whitespace-nowrap"
              >
                <i className="ri-google-fill text-red-500 text-lg"></i>
                <span className="ml-2">Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin("Kakao")}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-pointer whitespace-nowrap"
              >
                <i className="ri-kakao-talk-fill text-yellow-500 text-lg"></i>
                <span className="ml-2">Kakao</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin("Naver")}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 cursor-pointer whitespace-nowrap"
              >
                <i className="ri-naver-fill text-green-500 text-lg"></i>
                <span className="ml-2">Naver</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              계정이 없으신가요?{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-500 cursor-pointer"
              >
                회원가입하기
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
