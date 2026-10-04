import { NextRequest } from "next/server";
import { getBackend, forwardCookies, handleAdminResponse } from "../../_lib";

async function safeJson(res: Response) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { ok: res.ok }; }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${getBackend()}/api/checkout/${id}`, forwardCookies(req, {}));
  const data = await safeJson(res);
  return handleAdminResponse(res, data);
}

function buildHeaders(req: NextRequest): Record<string, string> {
  const csrf = req.headers.get("x-csrf-token") || "";
  const forwarded = forwardCookies(req, {}).headers as Record<string, string>;
  let cookie = forwarded.cookie || "";
  // Ensure csrf_token cookie is present for double-submit pattern
  if (csrf && !cookie.includes("csrf_token=")) {
    cookie = cookie ? `${cookie}; csrf_token=${csrf}` : `csrf_token=${csrf}`;
  }
  return {
    ...forwarded,
    cookie,
    ...(csrf ? { "x-csrf-token": csrf } : {}),
  };
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const endpoint = body.financials ? "financials" : "status";
  const headers = { ...buildHeaders(req), "Content-Type": "application/json" };
  const res = await fetch(`${getBackend()}/api/checkout/${id}/${endpoint}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
  const data = await safeJson(res);
  return handleAdminResponse(res, data);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${getBackend()}/api/checkout/${id}`, {
    method: "DELETE",
    headers: buildHeaders(req),
  });
  const data = await safeJson(res);
  return handleAdminResponse(res, data);
}
