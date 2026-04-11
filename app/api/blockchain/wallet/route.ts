import { NextRequest, NextResponse } from "next/server";

import { getWalletState } from "@/lib/blockchain";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId") || "";

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const wallet = await getWalletState(userId);
    return NextResponse.json({ wallet });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to read wallet state" },
      { status: 500 },
    );
  }
}
