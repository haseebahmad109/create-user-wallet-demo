"use client";

import { useState } from "react";
import {
  useAccount,
  useAccountEffect,
  useChainId,
  useConnect,
  useDisconnect,
  useEnsName,
  useSignMessage,
} from "wagmi";
import { SiweMessage } from "siwe";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE!;

export default function App() {
  useAccountEffect({
    onConnect(_data) {
      // console.log('onConnect', data)
    },
    onDisconnect() {
      // console.log('onDisconnect')
    },
  });

  return (
    <>
      <Account />
      <Connect />
    </>
  );
}

function createSiweMessage({
  domain,
  address,
  uri,
}: {
  domain: string;
  address: string;
  uri: string;
}) {
  const message = new SiweMessage({
    domain,
    address,
    uri,
    version: "1",
    chainId: 1,
  });
  return message;
}

function Account() {
  const account = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({
    address: account.address,
  });
  const { signMessageAsync } = useSignMessage();

  const [isLoading, setIsLoading] = useState(false);
  const [createUserWalletResp, setCreateUserWalletResp] = useState();

  const verifyAndCreateUserWallet = async () => {
    try {
      setIsLoading(true);
      const apiBaseUrl = new URL(API_BASE);
      const siweMessage = createSiweMessage({
        domain: apiBaseUrl.hostname,
        address: account.address as string,
        uri: apiBaseUrl.href,
      });

      const signature = await signMessageAsync({
        message: siweMessage.prepareMessage(),
      });

      const resp = await fetch("/api/users/wallets", {
        method: "POST",
        body: JSON.stringify({
          message: JSON.stringify(siweMessage),
          signature,
          walletAddress: account.address,
          walletType: "evm",
        }),
      });

      setCreateUserWalletResp(await resp.json());
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Account</h2>

      <div>
        account: {account.address} {ensName}
        <br />
        chainId: {account.chainId}
        <br />
        status: {account.status}
      </div>

      {account.status === "connected" && (
        <div>
          <div>
            {isLoading ? (
              <>Loading...</>
            ) : (
              <button
                disabled={isLoading}
                type="button"
                onClick={() => verifyAndCreateUserWallet()}
              >
                Verify and Create User Wallet
              </button>
            )}
          </div>

          {createUserWalletResp && (
            <div>
              <pre>{JSON.stringify(createUserWalletResp, null, 2)}</pre>
            </div>
          )}

          <div>
            <button type="button" onClick={() => disconnect()}>
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Connect() {
  const chainId = useChainId();
  const { connectors, connect, status, error } = useConnect();

  return (
    <div>
      <h2>Connect</h2>
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector, chainId })}
          type="button"
        >
          {connector.name}
        </button>
      ))}
      <div>{status}</div>
      <div>{error?.message}</div>
    </div>
  );
}
