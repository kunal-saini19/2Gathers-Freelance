import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/server-auth";
import { createNotification } from "@/lib/notifications";

export const runtime = "nodejs";

const createProposalSchema = z.object({
  jobId: z.coerce.number().int().positive(),
  coverLetter: z.string().trim().min(10),
});

export async function GET(request: Request) {
  const userId = getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const jobId = Number(url.searchParams.get("jobId") || "0");

  if (!Number.isInteger(jobId) || jobId <= 0) {
    return NextResponse.json({ detail: "jobId query param is required" }, { status: 400 });
  }

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, clientId: true },
  });

  if (!job) {
    return NextResponse.json({ detail: "Job not found" }, { status: 404 });
  }

  const requester = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!requester) {
    return NextResponse.json({ detail: "User not found" }, { status: 404 });
  }

  if (job.clientId !== requester.id && requester.role !== "ADMIN") {
    return NextResponse.json({ detail: "Only the job owner can view proposals" }, { status: 403 });
  }

  const proposals = await prisma.proposal.findMany({
    where: { jobId },
    orderBy: { createdAt: "desc" },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
      freelancer: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          role: true,
          walletAddress: true,
        },
      },
    },
  });

  return NextResponse.json({ proposals });
}

export async function POST(request: Request) {
  const userId = getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const freelancer = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, username: true },
  });

  if (!freelancer) {
    return NextResponse.json({ detail: "User not found" }, { status: 404 });
  }

  if (freelancer.role !== "FREELANCER") {
    return NextResponse.json({ detail: "Only freelancers can apply" }, { status: 403 });
  }

  const payload = createProposalSchema.parse(await request.json());

  const job = await prisma.job.findUnique({
    where: { id: payload.jobId },
    select: {
      id: true,
      title: true,
      clientId: true,
      client: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!job) {
    return NextResponse.json({ detail: "Job not found" }, { status: 404 });
  }

  if (job.clientId === freelancer.id) {
    return NextResponse.json({ detail: "You cannot apply to your own job" }, { status: 400 });
  }

  const existing = await prisma.proposal.findUnique({
    where: {
      jobId_freelancerId: {
        jobId: payload.jobId,
        freelancerId: freelancer.id,
      },
    },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({ detail: "You already applied to this job" }, { status: 409 });
  }

  const proposal = await prisma.proposal.create({
    data: {
      jobId: payload.jobId,
      freelancerId: freelancer.id,
      coverLetter: payload.coverLetter,
      status: "SUBMITTED",
    },
    include: {
      freelancer: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  await createNotification({
    userId: job.clientId,
    type: "PROPOSAL_SUBMITTED",
    title: "New job application",
    body: `${freelancer.username || "A freelancer"} applied to ${job.title}.`,
    link: `/dashboard?proposalId=${proposal.id}`,
    email: job.client.email,
  });

  return NextResponse.json({ proposal }, { status: 201 });
}
