import createClient from "openapi-fetch/dist/index.cjs";

import type { paths } from "./apiV1/schema";

// Vite의 내장 환경 변수를 사용하여 개발/프로덕션 모드를 감지합니다.
// 개발 모드(npm run dev)에서는 `import.meta.env.DEV`가 true가 됩니다.
const baseUrl = import.meta.env.DEV
  ? 'http://localhost:8080' // 개발 환경일 때 사용할 백엔드 주소
  : 'https://beanbuddies.yhcho.com'; // 빌드하여 배포할 때 사용할 백엔드 주소

export const client = createClient<paths>({
  baseUrl: baseUrl,
  credentials: "include",
});

export default client;
