/**
 * 후기 작성/수정 이미지 관련 공통 함수
 */
import { supabase } from "@/utils/supabase";

// 안전한 파일명 생성
export function generateImageFileName(
  originalFile: File,
  prefix: string = ""
): string {
  const extension = originalFile.name.split(".").pop()?.toLowerCase() || "jpg";
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 10);
  return `${prefix}${timestamp}-${randomString}.${extension}`;
}

// 스토리지에서 공개 URL 가져오기
export async function getPublicUrl(filePath: string): Promise<string> {
  const { data } = supabase.storage.from("profileImg").getPublicUrl(filePath);
  if (!data?.publicUrl) {
    throw new Error("Failed to get public URL");
  }
  return data.publicUrl;
}

// 스토리지에 파일 업로드하고 공개 URL 반환
export async function uploadImageToStorage(
  file: File,
  fileName: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from("profileImg")
    .upload(fileName, file);

  if (error) throw new Error(`이미지 업로드 실패: ${error.message}`);

  return await getPublicUrl(data.path);
}
