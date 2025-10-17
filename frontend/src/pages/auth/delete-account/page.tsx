import { useState } from "react";
import { useAuth } from "@/context/AuthContext"; // <- logout 가져오기
import { Link, useNavigate } from "react-router-dom";
import Button from "../../../components/base/Button";
import Input from "../../../components/base/Input";
import { useApiClient } from "@/lib/backend/apiClient";
import Modal from "../../../components/base/Modal";

export default function DeleteAccount() {
  const client = useApiClient();
  const { token, clearAuth } = useAuth(); // 로그아웃 함수 가져오기
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  //모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const showModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalOpen(true);
    setModalOpen(true);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await client.PATCH("/api/v1/members/me/withdraw", {
        body: { password },
        throwHttpErrors: false,
      });

      if (res.response.ok && res.data) {
        showModal(
          "계정 탈퇴 완료",
          res.data.msg || "계정이 성공적으로 탈퇴되었습니다."
        );

        // 토큰/사용자 상태 초기화
        clearAuth();

        // navigate("/", { replace: true });
      } else {
        const msg = res.error?.msg || "계정 탈퇴 중 오류가 발생했습니다.";
        showModal("계정 탈퇴 실패", msg);
      }
    } catch (err) {
      alert("서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* MODAL: 화면에 모달 렌더링 */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
      >
        <p>{modalMessage}</p>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => {
              setModalOpen(false); // 모달 닫기
              if (modalTitle === "계정 탈퇴 완료") {
                // 성공일 때만 이동
                navigate("/", { replace: true });
              }
            }}
          >
            확인
          </Button>
        </div>
      </Modal>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <i className="ri-error-warning-line text-4xl text-red-500 mb-4"></i>
          <h2 className="text-3xl font-bold text-gray-900">계정 탈퇴</h2>
          <p className="mt-2 text-gray-600">
            계정 탈퇴 전 안내사항을 확인해주세요
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          <form onSubmit={handleWithdraw} className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">
                • 탈퇴 시 모든 개인정보와 활동 내역이 삭제됩니다.
                <br />
                • 진행 중인 프로젝트가 있다면 완료 후 탈퇴해주세요.
                <br />
                • 탈퇴 후 동일한 이메일로 재가입이 제한될 수 있습니다.
                <br />• 탈퇴 처리는 즉시 완료되며 복구가 불가능합니다.
              </p>
            </div>

            <Input
              label="비밀번호"
              type="password"
              placeholder="현재 비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <i className="ri-warning-line mr-2"></i>
                인증 확인 후 계정이 즉시 삭제되며 복구가 불가능합니다.
              </p>
            </div>

            <div className="flex space-x-3">
              <Link to="/mypage" className="flex-1">
                <Button variant="outline" className="w-full">
                  취소
                </Button>
              </Link>
              <Button
                type="submit"
                variant="danger"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? "탈퇴 중..." : "계정 탈퇴"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
