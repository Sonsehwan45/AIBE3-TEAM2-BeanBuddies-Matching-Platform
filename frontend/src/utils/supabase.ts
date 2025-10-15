"use client";
import { createClient } from "@supabase/supabase-js";

// 환경 변수에서 키 가져오면 에러가 나서 임시로 직접 입력 추후 변경 예정
const supabaseUrl = "https://zipkbiohsibegyxhbcpf.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppcGtiaW9oc2liZWd5eGhiY3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NTIzMzgsImV4cCI6MjA3NjAyODMzOH0.qDFfUAA0O9bQalgg4I_euztREToGtC2UBbO0MCV7mks";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
