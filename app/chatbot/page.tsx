"use client";

import { ChatbotWidget } from "@/components/ChatbotWidget";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAIJobMatch } from "@/hooks/useAIJobMatch";
import { useAuth } from "@/hooks/useAuth";
import { mockJobs } from "@/lib/db";

export default function ChatbotPage() {
  const { user } = useAuth();
  const recommendations = useAIJobMatch(user, mockJobs);

  return (
    <DashboardLayout
      title="AI Chatbot"
      subtitle="A calm, frontend-only chatbot simulation that helps users discover jobs, understand tokens, and navigate support."
    >
      <ChatbotWidget suggestions={recommendations} />
    </DashboardLayout>
  );
}
