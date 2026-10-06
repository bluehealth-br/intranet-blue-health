import { supabase, isConfigured } from "@/integrations/supabase/client";

const BUCKET = "project-files";
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  path: string;
  url: string;
}

export function validateFiles(files: File[]): { valid: File[]; errors: string[] } {
  const errors: string[] = [];
  const valid: File[] = [];

  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`"${file.name}" excede 50MB`);
    } else {
      valid.push(file);
    }
  }

  return { valid, errors };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function uploadFiles(
  files: File[],
  submissionId: string,
): Promise<{ uploaded: UploadedFile[]; errors: string[] }> {
  if (!isConfigured) {
    return {
      uploaded: files.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
        path: `${submissionId}/${f.name}`,
        url: URL.createObjectURL(f),
      })),
      errors: [],
    };
  }

  const uploaded: UploadedFile[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const filePath = `${submissionId}/${Date.now()}_${file.name}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, { upsert: false });

    if (error) {
      errors.push(`Erro ao enviar "${file.name}": ${error.message}`);
      continue;
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    uploaded.push({
      name: file.name,
      size: file.size,
      type: file.type,
      path: filePath,
      url: urlData.publicUrl,
    });
  }

  return { uploaded, errors };
}
