import createClient from "openapi-fetch/dist/index.cjs";

import type { paths } from "./apiV1/schema";

// const NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080"; // 이 줄이 문제의 원인이었습니다.

export const client = createClient<paths>({
  // .env 파일에 설정된 NEXT_PUBLIC_API_BASE_URL 값을 사용하도록 변경합니다.
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  credentials: "include",
});

export default client;
