import { NextResponse } from "next/server";

/**
 * Fetches AWS EC2 instance metadata using IMDSv2 (Instance Metadata Service version 2).
 *
 * This function performs a two-step process:
 * 1. Obtains a session token from the metadata service
 * 2. Uses the token to fetch the instance identity document
 *
 * @returns {Promise<NextResponse>} JSON response containing instance metadata or error details
 *
 * @throws {AbortError} If the request exceeds the 3-second timeout
 *
 * @example
 * Response on success:
 * {
 *   "accountId": "123456789012",
 *   "architecture": "x86_64",
 *   "availabilityZone": "us-east-1a",
 *   "region": "us-east-1",
 *   ...
 * }
 *
 * @example
 * Response on timeout (504):
 * { "error": "Metadata request timeout" }
 *
 * @example
 * Response on failure (503):
 * { "error": "Failed to obtain metadata token" }
 * { "error": "Failed to fetch instance metadata" }
 * { "error": "Metadata unavailable" }
 */
async function fetchInstanceMetadata() {
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

/**
 * GET handler for instance metadata endpoint.
 * @returns {Promise<NextResponse>} Instance metadata response
 */
export async function GET() {
  return fetchInstanceMetadata();
}

/**
 * POST handler for instance metadata endpoint.
 * @returns {Promise<NextResponse>} Instance metadata response
 */
export async function POST() {
  return fetchInstanceMetadata();
}

/**
 * PUT handler for instance metadata endpoint.
 * @returns {Promise<NextResponse>} Instance metadata response
 */
export async function PUT() {
  return fetchInstanceMetadata();
}

/**
 * PATCH handler for instance metadata endpoint.
 * @returns {Promise<NextResponse>} Instance metadata response
 */
export async function PATCH() {
  return fetchInstanceMetadata();
}

/**
 * DELETE handler for instance metadata endpoint.
 * @returns {Promise<NextResponse>} Instance metadata response
 */
export async function DELETE() {
  return fetchInstanceMetadata();
}

/**
 * OPTIONS handler for instance metadata endpoint.
 * @returns {Promise<NextResponse>} Instance metadata response
 */
export async function OPTIONS() {
  return fetchInstanceMetadata();
}

/**
 * HEAD handler for instance metadata endpoint.
 * @returns {Promise<NextResponse>} Instance metadata response
 */
export async function HEAD() {
  return fetchInstanceMetadata();
}
