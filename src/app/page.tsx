"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import ConnectButton from "@/components/ConnectButton";
import peanut from "@squirrel-labs/peanut-sdk";
import { ethers } from "ethers";
import { useState } from "react";

export default function Home() {
  const chainId = "11155111"; // Sepolia
  const [link, setLink] = useState("")

  async function createLink() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    console.log("Signer Address:", await signer.getAddress());

    const linkDetails = {
      chainId,
      tokenAmount: 0.00001,
      tokenType: 0, // 0 for ether
      tokenDecimals: 18,
    };

    const password = await peanut.getRandomString(16);

    const preparedTransactions = await peanut.prepareDepositTxs({
      address: signer.address,
      linkDetails,
      passwords: [password],
    });

    const transactionHashes: string[] = [];
    console.log("txHas:", transactionHashes)

    for (const unsignedTx of preparedTransactions.unsignedTxs) {
      const preparedTx = peanut.peanutToEthersV5Tx(unsignedTx);
      preparedTx.from = signer.address;

      console.log("ready", preparedTx)

      if (preparedTx.value) {
        preparedTx.value = preparedTx.value.toString();
      }

      try {
        // Send transaction with the signer
        const txResponse = await signer.sendTransaction(preparedTx as any);
        
        transactionHashes.push(txResponse.hash);
      } catch (error) {
        console.error("Transaction failed", error);
        return null;
      }
    }

    const { links } = await peanut.getLinksFromTx({
      linkDetails,
      passwords: [password],
      txHash: transactionHashes[transactionHashes.length - 1],
    });

    setLink(links[0])
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <ConnectButton />
      <p>{link}</p>
      <button onClick={() => createLink().then((link) => console.log(link))}>Create</button>
    </div>
  );
}
