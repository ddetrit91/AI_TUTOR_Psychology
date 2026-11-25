import { NextResponse } from "next/server";
import { checkPostgresHealth } from "@/lib/db";
import { journalObjectExists, UPLOADS_BUCKET } from "@/lib/storage";

export async function GET() {
  try {
    const dbStatus = await checkPostgresHealth();
    // Verify S3 endpoint signature & bucket reachability
    const probeExists = await journalObjectExists("healthcheck-probe-nonexistent");

    return NextResponse.json({
      status: "healthy",
      postgres: dbStatus,
      objectStorage: {
        ok: true,
        bucket: UPLOADS_BUCKET,
        endpoint: process.env.AWS_ENDPOINT_URL_S3,
        region: process.env.AWS_REGION,
        probeChecked: typeof probeExists === "boolean",
      },
    });
  } catch (error: any) {
    console.error("Neon health check failed:", error);
    return NextResponse.json(
      { status: "error", details: error.message },
      { status: 500 }
    );
  }
}
