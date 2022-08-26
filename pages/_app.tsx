import Head from "next/head";
import Script from "next/script";
import React, { useMemo } from "react";
import { createGlobalStyle } from "styled-components";
import { SWRConfig } from "swr";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolletWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

import "@solana/wallet-adapter-react-ui/styles.css";

import { SessionProvider } from "next-auth/react";
import Sentry from "@sentry/nextjs";

const GlobalStyle = createGlobalStyle`  
  body {
    margin: 0;
    background: radial-gradient(84.6% 84.6% at 50% 100%, #0F3C54 0%, #05001C 100%), linear-gradient(0deg, #0F3C54 0%, #05001C 47.97%);
    min-height: 100vh;
    color: white;
    font-family: "Prompt", sans-serif;
    overflow-x: hidden;
  }
  
  * {
    scroll-behavior: smooth;
    
    &::-webkit-scrollbar {
      display: none;
    }
    &::-webkit-scrollbar-track {
      display: none;
    }
  }
  
`;

// @ts-ignore - SWR fetcher
const fetcher = (...args) => fetch(...args).then((res) => res.json());

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}) {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      /**
       * Select the wallets you wish to support, by instantiating wallet adapters here.
       *
       * Common adapters can be found in the npm package `@solana/wallet-adapter-wallets`.
       * That package supports tree shaking and lazy loading -- only the wallets you import
       * will be compiled into your application, and only the dependencies of wallets that
       * your users connect to will be loaded.
       */
      new PhantomWalletAdapter(),
      new SolletWalletAdapter(),
    ],
    []
  );

  const GOOGLE_ANAL_ID = "G-TODO";
  const DEPLOYMENT_URL = "/";
  const TWITTER_USER = "@HowliesNFT";
  const TITLE = "Degen Claw Machine {DCM}";
  const DESCRIPTION = "Solana's first claw machine developed by Howlies.";

  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <link rel="stylesheet" href="/fonts/font.css" />
        <link href="/favicon.ico" rel="icon" />
        <meta name="theme-color" content="#18182A" />
        <meta
          property="og:image"
          content={`${DEPLOYMENT_URL}metadata_preview.png`}
        />
        <meta
          name="twitter:image"
          content={`${DEPLOYMENT_URL}metadata_preview.png`}
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={TWITTER_USER} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:url" content={DEPLOYMENT_URL} />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="description" content={DESCRIPTION} />
      </Head>

      {/* Google analytics */}
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANAL_ID}`}
      />

      <Script id="google-analytics" strategy="lazyOnload">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ANAL_ID}', {
              page_path: window.location.pathname,
            });
                `}
      </Script>

      <GlobalStyle />
      <SessionProvider session={session}>
        <SWRConfig value={{ fetcher: fetcher }}>
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>
                <Component {...pageProps} />
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </SWRConfig>
      </SessionProvider>
    </>
  );
}
