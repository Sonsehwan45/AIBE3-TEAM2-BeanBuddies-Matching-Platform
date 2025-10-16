"use client";
import { useEffect, useState } from "react";
import Button from "../../../components/base/Button";
import Modal from "../../../components/base/Modal";
import { useApiClient } from "@/lib/backend/apiClient";
import { useAuth } from "@/context/AuthContext";

export default function MyPageSocial() {
  const client = useApiClient();
  const { token, user } = useAuth();

  // 연결 상태 관리
  const [socialAccounts, setSocialAccounts] = useState({
    google: { connected: false, email: null, connectedAt: null },
    kakao: { connected: false, email: null, connectedAt: null },
    naver: { connected: false, email: null, connectedAt: null },
  });

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalAction, setModalAction] = useState<() => void>(() => {});

  const showModal = (
    title: string,
    message: string,
    onConfirm?: () => void
  ) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalOpen(true);
    setModalAction(() => onConfirm || (() => setModalOpen(false)));
  };

  // 연결 상태 조회
  useEffect(() => {
    const fetchLinkedAccounts = async () => {
      try {
        const res = await client.GET("/api/v1/members/me/social", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.data) return;

        const linked = res.data.data; // [{provider: "KAKAO", providerId: "..."}]
        const updated = { ...socialAccounts };
        linked.forEach((acc: any) => {
          const provider = acc.provider.toLowerCase(); // KAKAO → kakao, NAVER → naver
          if (updated[provider]) {
            updated[provider].connected = true;
            updated[provider].email = `${provider}@linked.com`; // TODO: 실제 이메일 API에서 가져오면 좋음
            updated[provider].connectedAt = new Date()
              .toISOString()
              .split("T")[0];
          }
        });

        setSocialAccounts(updated);
      } catch (err) {
        console.error("소셜 계정 조회 실패", err);
      }
    };

    fetchLinkedAccounts();
  }, []);

  // 소셜 연결/해제
  const handleSocialConnect = async (
    provider: "google" | "kakao" | "naver"
  ) => {
    const target = socialAccounts[provider];

    // 연결 해제
    if (target.connected) {
      showModal(
        `${provider.toUpperCase()} 계정 해제`,
        `${provider.toUpperCase()} 계정을 정말로 해제하시겠습니까?`,
        async () => {
          try {
            const res = await client.DELETE("/api/v1/members/me/social", {
              params: { query: { provider: provider.toUpperCase() } },
              headers: { Authorization: `Bearer ${token}` },
              throwHttpErrors: false,
            });

            if (res.response.ok) {
              setSocialAccounts((prev) => ({
                ...prev,
                [provider]: {
                  connected: false,
                  email: null,
                  connectedAt: null,
                },
              }));
              showModal(
                "연결 해제 완료",
                `${provider.toUpperCase()} 계정 연결이 해제되었습니다.`
              );
            } else {
              const msg =
                res.error?.msg ||
                `${provider.toUpperCase()} 연결 해제에 실패했습니다.`;
              showModal("연결 해제 실패", msg);
            }
          } catch (err) {
            console.error(err);
            showModal("오류", "서버 오류가 발생했습니다.");
          }
        }
      );
    }
    // 새로 연결
    else {
      if (provider === "kakao") {
        window.location.href = `http://localhost:8080/api/v1/members/oauth/kakao/link?id=${user?.id}`;
      } else if (provider === "naver") {
        window.location.href = `http://localhost:8080/api/v1/members/oauth/naver/link?id=${user?.id}`;
      } else if (provider === "google") {
        window.location.href = `http://localhost:8080/api/v1/members/oauth/google/link?id=${user?.id}`;
      } else {
        showModal(
          "준비 중",
          `${provider.toUpperCase()} 연동은 아직 지원되지 않습니다.`
        );
      }
    }
  };

  // ✅ 공통 UI 렌더 함수
  const renderSocialCard = (provider: "google" | "kakao" | "naver") => {
    const info = {
      google: { color: "red", icon: "ri-google-fill" },
      kakao: { color: "yellow", icon: "ri-kakao-talk-fill" },
      naver: { color: "green", icon: "ri-naver-fill" },
    }[provider];

    const account = socialAccounts[provider];

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div
              className={`w-12 h-12 bg-${info.color}-50 rounded-xl flex items-center justify-center`}
            >
              <i className={`${info.icon} text-${info.color}-500 text-2xl`}></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </h3>
              {account.connected ? (
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">{account.email}</p>
                  <p className="text-xs text-gray-500">
                    연결일: {account.connectedAt}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">연결되지 않음</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {account.connected && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                연결됨
              </span>
            )}
            <Button
              variant={account.connected ? "danger" : "primary"}
              size="sm"
              onClick={() => handleSocialConnect(provider)}
              className="rounded-xl whitespace-nowrap"
            >
              {account.connected ? "연결 해제" : "연결하기"}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      {/* ✅ 모달 */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
      >
        <p>{modalMessage}</p>
        <div className="mt-4 flex justify-end space-x-2">
          {modalTitle.includes("해제") && modalAction !== undefined ? (
            <>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                취소
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setModalOpen(false);
                  modalAction();
                }}
              >
                확인
              </Button>
            </>
          ) : (
            <Button onClick={() => setModalOpen(false)}>확인</Button>
          )}
        </div>
      </Modal>

      <div className="flex items-center space-x-3 mb-8">
        <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
          <i className="ri-links-line text-white text-xl"></i>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">소셜 계정 연결</h2>
          <p className="text-gray-600">
            소셜 계정을 연결하거나 해제할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {renderSocialCard("google")}
        {renderSocialCard("kakao")}
        {renderSocialCard("naver")}
      </div>
    </div>
  );
}
