import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, issueAccessToken, makeVerificationToken, verificationExpiryDate } from "@/lib/auth";
import { sendMail } from "@/lib/mailer";


const registerSchema = z.object({
  username: z.string().trim().min(3),
  email: z.string().trim().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
  role: z.enum(["CLIENT", "FREELANCER"]),
});

function appBaseUrl(request: Request) {
  return process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
}

export async function POST(request: Request) {
  const payload = registerSchema.parse(await request.json());

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: payload.email }, { username: payload.username }],
    },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({ detail: "An account with this username or email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(payload.password);
  const verificationToken = makeVerificationToken();
  const verificationTokenExpiresAt = verificationExpiryDate();

  const user = await prisma.user.create({
    data: {
      name: payload.username,
      username: payload.username,
      email: payload.email,
      passwordHash,
      role: payload.role,
      tokens: payload.role === "CLIENT" ? 100 : 50,
      emailVerified: false,
      verificationToken,
      verificationTokenExpiresAt,
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      walletAddress: true,
    },
  });

  const verificationLink = `${appBaseUrl(request)}/verify-email?token=${verificationToken}`;

  let mailResult: { sent: boolean };

  try {
    mailResult = await sendMail({
      to: payload.email,
      subject: "Welcome to 2Gathers - Verify your email",
      text: `Welcome to 2Gathers!\n\nPlease confirm your email address by clicking the link below:\n${verificationLink}\n\nIf you did not create this account, you can safely ignore this email.\n\nThanks,\nThe 2Gathers Team`,
      html: `<p>Welcome to <strong>2Gathers</strong>!</p><p>Please confirm your email address by clicking the link below:</p><p><a href="${verificationLink}">${verificationLink}</a></p><p>If you did not create this account, you can safely ignore this email.</p><p>Thanks,<br/>The 2Gathers Team</p>`,
    });
  } catch {
    await prisma.user.delete({ where: { id: user.id } });

    return NextResponse.json(
      {
        detail: "Email provider authentication failed. Check SMTP user/app password and try again.",
      },
      { status: 503 },
    );
  }

  if (!mailResult.sent) {
    await prisma.user.delete({ where: { id: user.id } });

    return NextResponse.json(
      {
        detail: "Email service is not configured. Set SMTP credentials to send verification emails.",
        verificationLink,
      },
      { status: 503 },
    );
  }

  return NextResponse.json(
    {
      message: "Registration successful. Please confirm your email before signing in.",
      emailSent: mailResult.sent,
      ...(process.env.NODE_ENV !== "production" ? { verificationLink } : {}),
      accessToken: issueAccessToken(user.id),
      user,
    },
    { status: 201 },
  );
}
