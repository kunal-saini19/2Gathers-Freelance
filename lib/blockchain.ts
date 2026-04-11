import "server-only";

import crypto from "node:crypto";

import { ethers } from "ethers";

import { prisma } from "@/lib/prisma";

const TOKEN_DECIMALS = 18;
const TOKEN_CONTRACT_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function mint(address to, uint256 amount)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

export type BlockchainLedgerTransaction = {
  id: string;
  hash: string;
  type: "mint" | "receive" | "send";
  label: string;
  amount: number;
  balanceAfter: number;
  createdAt: string;
  from?: string;
  to?: string;
};

export type BlockchainWalletState = {
  userId: string;
  walletAddress: string | null;
  balance: number;
  contractAddress: string | null;
  transactions: BlockchainLedgerTransaction[];
};

function requireRpcUrl() {
  return process.env.NEXT_PUBLIC_CHAIN_RPC_URL || process.env.SEPOLIA_RPC_URL || process.env.POLYGON_AMOY_RPC_URL || "";
}

function getProvider() {
  const rpcUrl = requireRpcUrl();
  if (!rpcUrl) {
    throw new Error("Missing chain RPC URL");
  }

  return new ethers.JsonRpcProvider(rpcUrl);
}

function getContractAddress() {
  return process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || "";
}

export function getTokenContract(readonlyProvider?: ethers.ContractRunner) {
  const contractAddress = getContractAddress();
  if (!contractAddress) {
    throw new Error("Missing token contract address");
  }

  return new ethers.Contract(contractAddress, TOKEN_CONTRACT_ABI, readonlyProvider ?? getProvider());
}

export async function linkWalletAddress(userId: string, walletAddress: string) {
  if (!ethers.isAddress(walletAddress)) {
    throw new Error("Invalid wallet address");
  }

  const numericUserId = Number(userId);
  if (!Number.isFinite(numericUserId)) {
    throw new Error("Invalid user id");
  }

  const existing = await prisma.user.findFirst({
    where: {
      walletAddress,
      NOT: {
        id: numericUserId,
      },
    },
    select: { id: true },
  });

  if (existing) {
    throw new Error("This wallet address is already linked to another account");
  }

  const updated = await prisma.user.update({
    where: { id: Number(userId) },
    data: { walletAddress },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      walletAddress: true,
    },
  });

  return updated;
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function toTokenAmount(rawValue: bigint) {
  return Number(ethers.formatUnits(rawValue, TOKEN_DECIMALS));
}

export async function getWalletState(userId: string): Promise<BlockchainWalletState> {
  const numericUserId = Number(userId);
  if (!Number.isFinite(numericUserId)) {
    return {
      userId,
      walletAddress: null,
      balance: 0,
      contractAddress: getContractAddress() || null,
      transactions: [],
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: numericUserId },
    select: { id: true, walletAddress: true },
  });

  if (!user) {
    return {
      userId,
      walletAddress: null,
      balance: 0,
      contractAddress: getContractAddress() || null,
      transactions: [],
    };
  }

  const walletAddress = user.walletAddress;
  if (!walletAddress) {
    return {
      userId,
      walletAddress: null,
      balance: 0,
      contractAddress: getContractAddress() || null,
      transactions: [],
    };
  }

  const provider = getProvider();
  const contract = getTokenContract(provider);
  const [balanceRaw, incomingEvents, outgoingEvents] = await Promise.all([
    contract.balanceOf(walletAddress) as Promise<bigint>,
    contract.queryFilter(contract.filters.Transfer(null, walletAddress)),
    contract.queryFilter(contract.filters.Transfer(walletAddress, null)),
  ]);

  const eventEntries = await Promise.all(
    [...incomingEvents, ...outgoingEvents].map(async (event) => {
      const parsed = contract.interface.parseLog({ topics: event.topics, data: event.data });
      const from = String(parsed?.args?.from || "");
      const to = String(parsed?.args?.to || "");
      const value = BigInt(parsed?.args?.value?.toString?.() ?? "0");
      const logIndex = Number((event as { index?: number; logIndex?: number }).logIndex ?? (event as { index?: number }).index ?? 0);
      const direction: BlockchainLedgerTransaction["type"] = from === ethers.ZeroAddress ? "mint" : to === walletAddress ? "receive" : "send";
      const amount = toTokenAmount(value);
      const signedAmount = direction === "send" ? -amount : amount;
      const block = event.blockNumber ? await provider.getBlock(event.blockNumber) : null;
      return {
        id: `${event.transactionHash}-${logIndex}`,
        hash: event.transactionHash || crypto.randomUUID(),
        type: direction,
        label:
          direction === "mint"
            ? "Minted via onramp"
            : direction === "receive"
              ? `Received from ${shortAddress(from)}`
              : `Sent to ${shortAddress(to)}`,
        amount: signedAmount,
        balanceAfter: 0,
        createdAt: block?.timestamp ? new Date(block.timestamp * 1000).toISOString() : new Date().toISOString(),
        from,
        to,
        blockNumber: Number(event.blockNumber || 0),
        logIndex,
      };
    }),
  );

  const transactions = eventEntries.sort((left, right) => left.blockNumber - right.blockNumber || left.logIndex - right.logIndex);

  const balance = toTokenAmount(balanceRaw);
  const netMovement = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  let runningBalance = Math.max(0, balance - netMovement);

  const ledger = transactions.map((tx) => {
    runningBalance += tx.amount;
    return {
      id: tx.id,
      hash: tx.hash,
      type: tx.type,
      label: tx.label,
      amount: tx.amount,
      balanceAfter: Number(runningBalance.toFixed(6)),
      createdAt: tx.createdAt,
      from: tx.from,
      to: tx.to,
    };
  });

  return {
    userId,
    walletAddress,
    balance: Number(balance.toFixed(6)),
    contractAddress: getContractAddress(),
    transactions: ledger,
  };
}

export async function mintTokensToWallet(params: { walletAddress: string; tokenAmount: number }) {
  if (!ethers.isAddress(params.walletAddress)) {
    throw new Error("Invalid wallet address");
  }

  if (!Number.isFinite(params.tokenAmount) || params.tokenAmount <= 0) {
    throw new Error("Invalid token amount");
  }

  const privateKey = process.env.ADMIN_PRIVATE_KEY || "";
  if (!privateKey) {
    throw new Error("Missing admin private key");
  }

  const provider = getProvider();
  const signer = new ethers.Wallet(privateKey, provider);
  const contract = getTokenContract(signer);
  const amount = ethers.parseUnits(params.tokenAmount.toString(), TOKEN_DECIMALS);
  const tx = await contract.mint(params.walletAddress, amount);
  const receipt = await tx.wait();

  return {
    hash: receipt?.hash || tx.hash,
    blockNumber: receipt?.blockNumber ?? null,
  };
}

