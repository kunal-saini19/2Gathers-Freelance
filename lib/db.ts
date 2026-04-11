export type UserRole = "CLIENT" | "FREELANCER" | "ADMIN";

export type MockUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tokens: number;
  headline: string;
  skills: string[];
  bio: string;
};

export type MockJob = {
  id: string;
  title: string;
  client: string;
  description: string;
  budget: string;
  tokenCost: number;
  matchScore: number;
  tags: string[];
  status: "Open" | "Featured" | "Matched";
};

export type MockTokenTransaction = {
  id: string;
  type: "earn" | "buy" | "spend" | "transfer";
  label: string;
  amount: number;
  balanceAfter: number;
  createdAt: string;
};

export type MockFaq = {
  question: string;
  answer: string;
};

export type MockTeamMember = {
  name: string;
  role: string;
  bio: string;
};

export const mockUsers: MockUser[] = [
  {
    id: "u1",
    name: "Kunal Saini",
    email: "kunal112@gmail.com",
    role: "FREELANCER",
    tokens: 240,
    headline: "Product designer and full-stack freelancer",
    skills: ["Next.js", "TypeScript", "Tailwind", "AI UX"],
    bio: "Builds polished marketplace and SaaS experiences with a bias toward clarity and speed.",
  },
  {
    id: "u2",
    name: "Aarav Mehta",
    email: "aarav@2gathers.dev",
    role: "CLIENT",
    tokens: 800,
    headline: "Hiring manager at Studio North",
    skills: ["Hiring", "Leadership", "Product Strategy"],
    bio: "Uses 2Gathers to post premium projects and short-list strong freelancers quickly.",
  },
  {
    id: "u3",
    name: "Script Four",
    email: "script4@2gathers.dev",
    role: "ADMIN",
    tokens: 1200,
    headline: "Platform operations",
    skills: ["Moderation", "Analytics", "Policy"],
    bio: "Oversees token policies, wallet adjustments, and marketplace quality controls.",
  },
];

export const mockJobs: MockJob[] = [
  {
    id: "j1",
    title: "Build a clean AI matching dashboard",
    client: "Studio North",
    description: "Design and implement a highly polished freelancer dashboard with recommendation cards and token metrics.",
    budget: "$2,400",
    tokenCost: 45,
    matchScore: 97,
    tags: ["Next.js", "Dashboard", "AI"],
    status: "Featured",
  },
  {
    id: "j2",
    title: "Token wallet prototype for a marketplace",
    client: "Inkwell Labs",
    description: "Prototype a token economy with earn, spend, and transfer flows while keeping the UI clean and minimal.",
    budget: "$1,850",
    tokenCost: 35,
    matchScore: 93,
    tags: ["Fintech", "Wallet", "Blockchain"],
    status: "Open",
  },
  {
    id: "j3",
    title: "Chatbot assistant for candidate support",
    client: "Northstar HR",
    description: "Create a conversational interface that helps freelancers find relevant jobs and understand token usage.",
    budget: "$1,200",
    tokenCost: 25,
    matchScore: 88,
    tags: ["Chatbot", "AI UX", "Support"],
    status: "Matched",
  },
  {
    id: "j4",
    title: "Responsive landing page for a hiring platform",
    client: "Orbit Works",
    description: "Build a modern, serious landing page with subtle gradients and responsive sections.",
    budget: "$950",
    tokenCost: 15,
    matchScore: 84,
    tags: ["UI", "Brand", "Responsive"],
    status: "Open",
  },
];

export const mockTokenTransactions: MockTokenTransaction[] = [
  {
    id: "t1",
    type: "earn",
    label: "Completed learning module",
    amount: 30,
    balanceAfter: 240,
    createdAt: "2026-04-10T09:30:00Z",
  },
  {
    id: "t2",
    type: "spend",
    label: "Applied to premium job",
    amount: -45,
    balanceAfter: 210,
    createdAt: "2026-04-10T10:15:00Z",
  },
  {
    id: "t3",
    type: "buy",
    label: "Bought tokens via wallet",
    amount: 120,
    balanceAfter: 330,
    createdAt: "2026-04-10T11:05:00Z",
  },
  {
    id: "t4",
    type: "transfer",
    label: "Transferred to freelancer",
    amount: -40,
    balanceAfter: 290,
    createdAt: "2026-04-10T11:48:00Z",
  },
];

export const mockTeam: MockTeamMember[] = [
  {
    name: "Product Team",
    role: "Vision",
    bio: "Shipping a focused freelancing platform with quality tooling and simple workflows.",
  },
  {
    name: "Engineering Team",
    role: "Platform",
    bio: "Maintaining the AI matching engine, token ledger, and future blockchain integration path.",
  },
  {
    name: "Support Team",
    role: "Success",
    bio: "Helping clients and freelancers get value from the platform quickly and safely.",
  },
];

export const mockFaqs: MockFaq[] = [
  {
    question: "How do tokens work?",
    answer: "Tokens are the platform currency used for premium applications, boosts, and wallet rewards.",
  },
  {
    question: "Can I use this without crypto?",
    answer: "Yes. The prototype simulates blockchain behavior now and can evolve into real web3 later.",
  },
  {
    question: "How does AI job matching work?",
    answer: "Job recommendations are scored from skills, role fit, and token activity using mock AI logic.",
  },
  {
    question: "Is the database real?",
    answer: "Yes. A Prisma SQLite database is added in the background while the current UI remains unchanged.",
  },
];

export function getMockUser(id: string) {
  return mockUsers.find((user) => user.id === id) ?? mockUsers[0];
}

export function getMockWallet(userId: string) {
  const user = getMockUser(userId);
  return {
    userId: user.id,
    address: `twogathers:${user.id}:wallet`,
    balance: user.tokens,
    tokenName: "2GTH",
    network: "Simulated Ledger",
  };
}
