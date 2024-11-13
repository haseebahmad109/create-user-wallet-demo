import { type NextRequest, NextResponse } from "next/server";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;
const userId = process.env.USER_ID!;

export const POST = async (req: NextRequest) => {
  const { message, signature, walletAddress, walletType } = await req.json();

  console.log(process.env.API_KEY);

  const apiBaseUrl = new URL(API_BASE);
  const postUserWalletUrl = new URL("/api/users/wallets", apiBaseUrl.href);

  const resp = await fetch(postUserWalletUrl.href, {
    method: "POST",
    body: JSON.stringify({
      walletType,
      userId,
      walletAddress,
      verificationData: {
        signature,
        walletAddress,
        walletType,
        message,
      },
    }),
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.API_KEY!,
    },
  });

  return NextResponse.json(await resp.json());
};
