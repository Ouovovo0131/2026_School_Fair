import crypto from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function buildSignature(params: Record<string, string>, apiSecret: string) {
  const signatureBase = Object.entries(params)
    .filter(([, value]) => value !== "")
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto.createHash("sha1").update(signatureBase + apiSecret).digest("hex");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const ownerId = String(formData.get("ownerId") ?? "anonymous");
    const questId = String(formData.get("questId") ?? "0");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "缺少上傳檔案" }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary 伺服器環境變數未設定完整，請檢查 CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET" },
        { status: 500 }
      );
    }

    const safeOwnerId = ownerId.replace(/[\\/#?]/g, "_");
    const publicId = `uploads/${safeOwnerId}/${questId}`;
    const folder = "school-fair";
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const signature = buildSignature(
      {
        folder,
        public_id: publicId,
        timestamp,
      },
      apiSecret
    );

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("api_key", apiKey);
    uploadForm.append("folder", folder);
    uploadForm.append("public_id", publicId);
    uploadForm.append("timestamp", timestamp);
    uploadForm.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: uploadForm,
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: result?.error?.message || "Cloudinary 上傳失敗" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
      bytes: result.bytes,
      format: result.format,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cloudinary 上傳失敗";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}