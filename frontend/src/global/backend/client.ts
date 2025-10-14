import createClient from "openapi-fetch/dist/index.cjs";

import { paths } from "./apiV1/schema";

const NEXT_PUBLIC_API_BASE_URL = "http://localhost:8080";

export const client = createClient<paths>({
  baseUrl: NEXT_PUBLIC_API_BASE_URL,
  credentials: "include",
});

export default client;
