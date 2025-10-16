import createClient from "openapi-fetch";

import type { paths } from "@/lib/backend/apiV1/schema";

// 우선 순위: VITE_API_BASE_URL > 개발/배포 기본값
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV
    ? "http://localhost:8080" // 개발 환경 기본 백엔드 주소
    : "https://api.yhcho.com"); // 배포 기본 백엔드 주소

export const client = createClient<paths>({
  baseUrl: API_BASE_URL,
  credentials: "include",
});
