import { NextResponse } from "next/server";
import { pingBackend } from "@/lib/api/health";

export async function GET() {
  try {
    const result = await pingBackend();

    return NextResponse.json({
      backend: result.ok,
      latency: result.latency,
    });
  } catch {
    return NextResponse.json(
      {
        backend: false,
      },
      { status: 503 }
    );
  }
}
