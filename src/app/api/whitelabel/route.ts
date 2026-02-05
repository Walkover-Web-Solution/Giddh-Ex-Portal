import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const regionParam = req.nextUrl.searchParams.get("region");
  const cookieRegion = req.cookies.get("region")?.value;

  const allowedRegions = ["uk", "gb"];
  const region = (regionParam || cookieRegion || "").toLowerCase();

  const isUK = allowedRegions.includes(region);

  let targetUrl = process.env.GIDDH_WHITE_LABEL_URL;

  if (isUK) {
    targetUrl = process.env.GIDDH_GB_WHITE_LABEL_URL;
  }

  if (!targetUrl) {
    return NextResponse.json(
      { body: null, success: false, error: "White label URL not configured" },
      { status: 500 }
    );
  }

  try {
    const upstream = await fetch(targetUrl, {
      headers: {
        Origin: req.nextUrl.origin,
      },
    });

    if (!upstream.ok) {
      return NextResponse.json({ body: null, success: false }, { status: 502 });
    }

    const data = await upstream.text();

    const response = NextResponse.json({
      body: data,
      success: true,
    });

    if (regionParam && allowedRegions.includes(regionParam.toLowerCase())) {
      response.cookies.set("region", regionParam.toLowerCase(), {
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    }

    return response;
  } catch {
    return NextResponse.json({ body: null, success: false });
  }
}
