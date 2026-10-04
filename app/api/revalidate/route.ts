import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret =
    req.headers.get("x-revalidate-secret") ||
    req.nextUrl.searchParams.get("secret");

  const expectedSecret = process.env.REVALIDATE_SECRET;
  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const tag = req.nextUrl.searchParams.get("tag");
  if (!tag) {
    return NextResponse.json({ message: "Missing tag parameter" }, { status: 400 });
  }

  try {
    revalidateTag(tag, "max");
    return NextResponse.json({ revalidated: true, tag, now: Date.now() }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error revalidating", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
