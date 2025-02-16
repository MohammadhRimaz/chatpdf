import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(file: File) {
  try {
    // Convert File object to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const file_key =
      "uploads/" + Date.now().toString() + file.name.replace(/\s+/g, "-");

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: file_key,
      Body: buffer,
      ContentType: file.type, // Ensure correct MIME type
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    console.log("Successfully uploaded to S3:", file_key);

    return {
      file_key,
      file_name: file.name,
    };
  } catch (error) {
    console.error("S3 Upload Error:", error);
    return null;
  }
}

export function getS3Url(file_key: string) {
  return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com/${file_key}`;
}
