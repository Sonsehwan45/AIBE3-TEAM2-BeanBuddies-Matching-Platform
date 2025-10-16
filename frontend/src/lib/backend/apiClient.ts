//apiClient.ts
import createClient from "openapi-fetch";
import type { paths } from "@/lib/backend/apiV1/schema";
import { useAuth } from "@/context/AuthContext";
import { useMemo } from "react";

const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:8080"
  : "https://api.yhcho.com";

export function useApiClient() {
  const { token, setToken } = useAuth();

  const client = useMemo(
    () =>
      createClient<paths>({
        baseUrl: API_BASE_URL,
        credentials: "include",
        fetch: async (input: RequestInfo, init: RequestInit = {}) => {
          // 기존 헤더를 가져와서 수정
          const headers = new Headers(init.headers);
          headers.set("Content-Type", "application/json"); // JSON 명시
          if (token) {
            headers.set("Authorization", `Bearer ${token}`);
          }

          // body가 있으면 JSON.stringify 처리
          const body =
            init.body && typeof init.body !== "string"
              ? JSON.stringify(init.body)
              : init.body;
          const response = await fetch(input, { ...init, headers, body });

          // Authorization 헤더 갱신
          const newToken = response.headers.get("Authorization");
          if (newToken) {
            setToken(newToken.replace("Bearer ", ""));
          }

          return response;
        },
      }),
    [token, setToken]
  );

  return client;
}
