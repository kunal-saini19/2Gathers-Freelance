import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const tokenSchema = z.object({ token: z.string().min(10) });

async function verifyToken(token: string) {
  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
      verificationTokenExpiresAt: { gt: new Date() },
    },
    select: { id: true },
  });

  if (!user) {
    return false;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    },
  });

  return true;
}

export async function POST(request: Request) {
  const payload = tokenSchema.parse(await request.json());
  const ok = await verifyToken(payload.token);

  if (!ok) {
    return NextResponse.json({ detail: "Invalid or expired verification token." }, { status: 400 });
  }

  return NextResponse.json({ message: "Email verified successfully. You can sign in now." });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token") || "";
  const parsed = tokenSchema.safeParse({ token });

  if (!parsed.success) {
    return NextResponse.json({ detail: "Invalid verification token." }, { status: 400 });
  }

  const ok = await verifyToken(parsed.data.token);

  if (!ok) {
    return NextResponse.json({ detail: "Invalid or expired verification token." }, { status: 400 });
  }

  return NextResponse.json({ message: "Email verified successfully. You can sign in now." });
}
