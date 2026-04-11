import { NextRequest, NextResponse } from "next/server";

import { linkWalletAddress } from "@/lib/blockchain";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = String(body.userId || "");
    const walletAddress = String(body.walletAddress || "");

    if (!userId || !walletAddress) {
      return NextResponse.json({ error: "userId and walletAddress are required" }, { status: 400 });
    }

    const user = await linkWalletAddress(userId, walletAddress);
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to link wallet address" },
      { status: 400 },
    );
  }
}
