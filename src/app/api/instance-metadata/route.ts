import { NextResponse } from "next/server";

export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const tokenRes = await fetch("http://169.254.169.254/latest/api/token", {
      method: "PUT",
      headers: { "X-aws-ec2-metadata-token-ttl-seconds": "21600" },
      signal: controller.signal,
    });

    if (!tokenRes.ok) {
      return NextResponse.json({ error: "Failed to obtain metadata token" }, { status: 503 });
    }

    const token = await tokenRes.text();

    const metaRes = await fetch(
      "http://169.254.169.254/latest/dynamic/instance-identity/document",
      {
        headers: { "X-aws-ec2-metadata-token": token },
        signal: controller.signal,
      }
    );

    if (!metaRes.ok) {
      return NextResponse.json({ error: "Failed to fetch instance metadata" }, { status: 503 });
    }

    const data = await metaRes.json();
    return NextResponse.json(data);
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      return NextResponse.json({ error: "Metadata request timeout" }, { status: 504 });
    }
    return NextResponse.json({ error: "Metadata unavailable" }, { status: 503 });
  } finally {
    clearTimeout(timeout);
  }
}
