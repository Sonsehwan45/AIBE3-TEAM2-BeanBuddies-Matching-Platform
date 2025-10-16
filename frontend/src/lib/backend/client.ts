import createClient from "openapi-fetch";

import type { paths } from "@/lib/backend/apiV1/schema";

const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:8080" // 개발 환경일 때 사용할 백엔드 주소
  : "https://api.yhcho.com"; // 빌드하여 배포할 때 사용할 실제 백엔드 API 주소

export const client = createClient<paths>({
  baseUrl: API_BASE_URL,
  credentials: "include",
});
