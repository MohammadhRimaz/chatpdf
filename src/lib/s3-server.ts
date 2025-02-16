import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import os from "os";
import path from "path";
import { Readable } from "stream";

const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
  },
});

export async function downloadFromS3(file_key: string) {
  try {
    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: file_key,
    };

    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error("S3 response body is empty.");
    }

    // Convert ReadableStream to Buffer
    const streamToBuffer = async (stream: Readable) => {
      return new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
      });
    };

    const fileBuffer = await streamToBuffer(response.Body as Readable);

    // Use OS-specific temp directory
    const tempDir = os.tmpdir();
    const file_name = path.join(tempDir, `pdf-${Date.now()}.pdf`);

    fs.writeFileSync(file_name, fileBuffer);

    return file_name;
  } catch (error) {
    console.error("S3 Download Error:", error);
    return null;
  }
}
