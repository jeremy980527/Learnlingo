export interface UploadResult {
  materialId: string;
}

export function uploadMaterial(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/materials/upload");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(body as UploadResult);
        } else {
          reject(new Error(body.error ?? `上傳失敗（狀態碼 ${xhr.status}）`));
        }
      } catch {
        reject(new Error("伺服器回應格式錯誤，請稍後再試。"));
      }
    };

    xhr.onerror = () => reject(new Error("網路連線發生問題，請確認網路後再試一次。"));

    xhr.send(formData);
  });
}

export interface MaterialStatusResponse {
  id: string;
  filename: string;
  status: "UPLOADING" | "PARSING" | "GENERATING" | "READY" | "FAILED";
  errorMessage: string | null;
  unitCount: number;
}

export async function fetchMaterialStatus(
  materialId: string,
): Promise<MaterialStatusResponse> {
  const response = await fetch(`/api/materials/${materialId}/status`);
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.error ?? "無法取得處理狀態。");
  }

  return body as MaterialStatusResponse;
}

export async function retryMaterialProcessing(materialId: string): Promise<void> {
  const response = await fetch(`/api/materials/${materialId}/process`, {
    method: "POST",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? "重新處理失敗，請稍後再試。");
  }
}
