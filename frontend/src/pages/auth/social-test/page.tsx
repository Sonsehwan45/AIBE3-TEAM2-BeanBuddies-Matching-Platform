"use client";

import { useEffect, useState } from "react";
import { useApiClient } from "@/lib/backend/apiClient";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/base/Button";
import toast from "react-hot-toast";

interface LinkedAccount {
  provider: string;
  providerId: string;
}

export default function SocialTestPage() {
  const client = useApiClient();
  const { user, setToken, setUser } = useAuth();
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [linked, setLinked] = useState(false);

  // 해시에서 로그인/연동 데이터 처리
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("accessToken");
      const id = params.get("id");
      const name = params.get("name");
      const role = params.get("role");
      const status = params.get("status");
      const profileImg = params.get("profileImg");

      if (accessToken) setToken(decodeURIComponent(accessToken));
      if (id)
        setUser({
          id: Number(decodeURIComponent(id)),
          name: decodeURIComponent(name || ""),
          role: decodeURIComponent(role || ""),
          status: decodeURIComponent(status || ""),
          profileImgUrl: decodeURIComponent(profileImg || ""),
        });

      // URL 깨끗하게
      window.history.replaceState(null, "", window.location.pathname);
    }

    // 초기 연동 계정 조회
    fetchLinkedAccounts();
  }, []);

  // 카카오 계정 연동
  const handleKakaoConnect = () => {
    if (!user) {
      toast.error("로그인 후 사용 가능합니다.");
      return;
    }
    const kakaoLinkUrl = `http://localhost:8080/api/v1/members/oauth/kakao/link?id=${user.id}`;
    window.location.href = kakaoLinkUrl;
  };

  // 카카오 소셜 로그인
  const handleKakaoLogin = () => {
    const kakaoLoginUrl = `http://localhost:8080/api/v1/auth/oauth/kakao/login`;
    window.location.href = kakaoLoginUrl;
  };

  // 연동 계정 조회
  const fetchLinkedAccounts = async () => {
    try {
      const res = await client.GET("/api/v1/members/me/social", {
        throwHttpErrors: false,
      });

      if (res.data) setLinkedAccounts(res.data);
      else setLinkedAccounts([]);
    } catch (err) {
      console.error(err);
      toast.error("연동 계정 조회 실패");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">소셜 계정 테스트</h1>

      {/* 소셜 로그인 버튼 */}
      <Button onClick={handleKakaoLogin} className="mb-4">
        카카오로 로그인
      </Button>

      {/* 카카오 연동 버튼 */}
      {!linked ? (
        <Button onClick={handleKakaoConnect} className="mb-4">
          카카오 계정 연동
        </Button>
      ) : (
        <p className="mt-4 text-green-600 font-semibold">
          카카오 계정이 연동되어 있습니다.
        </p>
      )}

      <h2 className="text-xl font-bold mt-6 mb-2">현재 연동된 계정 목록</h2>
      {linkedAccounts.length > 0 ? (
        <ul className="list-disc pl-5">
          {linkedAccounts.map((account, idx) => (
            <li key={idx}>
              {account.provider} - {account.providerId}
            </li>
          ))}
        </ul>
      ) : (
        <p>연동된 계정이 없습니다.</p>
      )}

      <Button onClick={fetchLinkedAccounts} className="mt-4">
        연동 계정 다시 조회
      </Button>
    </div>
  );
}
