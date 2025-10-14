import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../../components/base/Button";
import Input from "../../../components/base/Input";
import toast from "react-hot-toast";
import { client } from "../../../lib/backend/client";

export default function Signup() {
  const navigate = useNavigate();

  //이메일 인증 관련 상태
  const [emailSent, setEmailSent] = useState(false); // 코드 발송 여부
  const [emailVerified, setEmailVerified] = useState(false); // 인증 완료 여부
  const [emailCode, setEmailCode] = useState(""); // 사용자가 입력한 인증 코드

  const [userType, setUserType] = useState<"CLIENT" | "FREELANCER">("CLIENT");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    passwordConfirm: "",
    name: "",
  });

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [emailErrors, setEmailErrors] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 이메일 인증 코드 발송
  const sendEmailCode = async () => {
    setFormErrors([]);
    if (!formData.email) {
      toast.error("이메일을 입력해주세요.");
      return;
    }

    try {
      const res = await client.POST("/api/v1/members/join/email", {
        body: { email: formData.email },
        throwHttpErrors: false,
      });

      if (res.response.ok && res.data) {
        setEmailSent(true);
        toast.success(res.data.msg || "인증 코드 이메일로 전송");
      } else {
        const { msg } = res.error ?? {};
        const messages = Array.isArray(msg) ? msg : [msg];
        setEmailErrors(messages.filter(Boolean));
        toast.error(msg || "인증 코드 전송 실패");
      }
    } catch (err) {
      console.error(err);
      toast.error("서버 오류가 발생했습니다.");
    }
  };

  // 인증 코드 검증
  const verifyEmailCode = async () => {
    setFormErrors([]);

    try {
      const res = await client.POST("/api/v1/members/join/verification", {
        body: { email: formData.email, code: emailCode },
        throwHttpErrors: false,
      });

      if (res.response.ok && res.data) {
        setEmailVerified(true);
        setEmailSent(false);
        setEmailErrors([]);
        toast.success(res.data.msg || "이메일 인증이 완료되었습니다.");
      } else {
        const { msg } = res.error ?? {};
        const messages = Array.isArray(msg) ? msg : [msg];
        setEmailErrors(messages.filter(Boolean));
      }
    } catch (err) {
      console.error(err);
      toast.error("서버 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormErrors([]); // 기존 에러 초기화

    try {
      // 실제 회원가입 요청
      const res = await client.POST("/api/v1/members", {
        body: {
          role: userType,
          name: formData.name,
          username: formData.username,
          password: formData.password,
          passwordConfirm: formData.passwordConfirm,
          email: formData.email,
        },
        throwHttpErrors: false,
      });

      if (res.response.ok && res.data) {
        toast.success(res.data.msg || "회원가입이 완료되었습니다!", {
          duration: 3000,
        });
        navigate("/login", { replace: true }); // 회원가입 완료 후 로그인 페이지로 이동
      } else {
        const { resultCode, msg } = res.error ?? {};
        const messages = Array.isArray(msg) ? msg : [msg];
        setFormErrors(messages.filter(Boolean)); // 폼 하단 에러 표시
      }
    } catch (err: any) {
      console.error(err);
      toast.error("알 수 없는 에러가 발생했습니다.", { duration: 3000 });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">회원가입</h2>
          <p className="mt-2 text-gray-600">새 계정을 만들어보세요</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          {/* 프로필 이미지 업로드 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              프로필 이미지
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="프로필"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <i className="ri-user-line text-2xl text-gray-400"></i>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="profile-upload"
                />
                <label
                  htmlFor="profile-upload"
                  className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 whitespace-nowrap"
                >
                  <i className="ri-camera-line mr-2"></i>
                  이미지 선택
                </label>
                {profileImage && (
                  <button
                    type="button"
                    onClick={() => setProfileImage(null)}
                    className="ml-2 text-sm text-red-600 hover:text-red-500 cursor-pointer"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 회원 유형 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              회원 유형 선택 <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              {["CLIENT", "FREELANCER"].map((type) => (
                <label
                  key={type}
                  className="flex items-center cursor-pointer w-1/2"
                >
                  <input
                    type="radio"
                    value={type}
                    checked={userType === type}
                    onChange={(e) =>
                      setUserType(e.target.value as "CLIENT" | "FREELANCER")
                    }
                    className="sr-only"
                  />
                  <div
                    className={`flex items-center justify-center w-full px-4 py-3 border rounded-lg transition-colors ${
                      userType === type
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <i
                      className={`${
                        type === "CLIENT" ? "ri-building-line" : "ri-user-line"
                      } mr-2`}
                    ></i>
                    {type === "CLIENT" ? "클라이언트" : "프리랜서"}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 회원가입 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이메일 + 인증 버튼 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일 <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="example@email.com"
                  required
                  disabled={emailVerified}
                  className="flex-1"
                />
                {emailVerified ? (
                  <div className="flex items-center justify-center px-3">
                    <i className="ri-check-line text-green-500 text-xl"></i>
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={sendEmailCode}
                    size="sm"
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    인증 코드 발송
                  </Button>
                )}
              </div>

              {/* 인증 코드 입력창 */}
              {emailSent && !emailVerified && (
                <div className="mt-3 flex space-x-2">
                  <Input
                    type="text"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    placeholder="인증 코드를 입력하세요"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={verifyEmailCode}
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    인증하기
                  </Button>
                </div>
              )}

              {/* 이메일 관련 에러 메시지 */}
              {emailErrors.length > 0 && (
                <ul className="text-red-500 text-sm mt-2 list-disc ml-5">
                  {emailErrors.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* 나머지 입력 필드 */}
            {userType === "CLIENT" ? (
              <Input
                label="회사명"
                value={formData.name}
                onChange={(e) =>
                  handleInputChange("companyName", e.target.value)
                }
                placeholder="회사명을 입력하세요"
                required
              />
            ) : (
              <Input
                label="이름"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="실명을 입력하세요"
                required
              />
            )}

            <Input
              label="아이디"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              placeholder="사용하실 아이디를 입력하세요"
              required
            />

            <Input
              label="비밀번호"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="8자 이상의 비밀번호"
              required
            />

            <Input
              label="비밀번호 확인"
              type="password"
              value={formData.passwordConfirm}
              onChange={(e) =>
                handleInputChange("passwordConfirm", e.target.value)
              }
              placeholder="비밀번호를 다시 입력하세요"
              required
            />

            {/* 폼 하단 에러 메시지 */}
            {formErrors.length > 0 && (
              <ul className="text-red-500 text-sm mt-2 list-disc ml-5">
                {formErrors.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            )}

            <div className="pt-4">
              <Button type="submit" className="w-full" size="lg">
                회원가입
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-500 cursor-pointer"
              >
                로그인하기
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
