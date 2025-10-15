import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { client } from "@/lib/backend/client";
import Button from "../../components/base/Button";

export default function MyInfo() {
  const { token } = useAuth(); // 로그인 시 저장된 토큰
  const [userData, setUserData] = useState<any>(null);

  const fetchMyInfo = async () => {
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const res = await client.GET("/api/v1/test/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        throwHttpErrors: false,
      });

      console.log("서버 응답:", res);
      setUserData(res.data?.data); // ApiResponse 구조에서 data 안의 실제 member 데이터
    } catch (error) {
      console.error("요청 실패:", error);
      setUserData({ error: "요청 실패" });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">내 정보 조회 테스트</h1>
      <Button onClick={fetchMyInfo} size="lg">
        내 정보 조회
      </Button>

      {userData && (
        <>
          <pre className="mt-4 bg-gray-100 p-4 rounded">
            {JSON.stringify(userData, null, 2)}
          </pre>

          {/* 프로필 이미지 */}
          {userData.profileImgUrl && (
            <img
              src={userData.profileImgUrl}
              alt="프로필 이미지"
              className="mt-4 w-32 h-32 rounded-full object-cover"
            />
          )}
        </>
      )}
    </div>
  );
}
