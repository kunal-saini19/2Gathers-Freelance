import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { comparePassword, issueAccessToken } from "@/lib/auth";

export const runtime = "nodejs";

const loginSchema = z.object({
  username: z.string().trim().min(3),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const payload = loginSchema.parse(await request.json());

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: payload.username }, { email: payload.username }],
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      walletAddress: true,
      passwordHash: true,
      emailVerified: true,
    },
  });

  if (!user || !user.passwordHash) {
    return NextResponse.json({ detail: "Invalid username/email or password." }, { status: 401 });
  }

  const ok = await comparePassword(payload.password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ detail: "Invalid username/email or password." }, { status: 401 });
  }

  if (!user.emailVerified) {
    return NextResponse.json({ detail: "Please verify your email before signing in." }, { status: 403 });
  }

  return NextResponse.json({
    accessToken: issueAccessToken(user.id),
    user: {
      id: String(user.id),
      username: user.username,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress,
    },
  });
}
