import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { db } from "../../firebase/admin";
import holderCount from "./_output.json";

import IDL_JSON from "../../types/deposit_withdraw.json";
import {
  ConfirmOptions,
  Connection,
  Keypair,
  PublicKey,
} from "@solana/web3.js";
import { BN, Program, Provider, Wallet, web3 } from "@project-serum/anchor";
import { withSentry } from "@sentry/nextjs";

var randomNumberGenerator = require("random-number-csprng");

const IDL: any = IDL_JSON;

const SMART_CONTRACT_ID = process.env.NEXT_PUBLIC_SMART_CONTRACT_ID;
const programId = new PublicKey(SMART_CONTRACT_ID);

const privateKeypairBuffer: any = [
  38, 188, 159, 232, 182, 214, 98, 9, 50, 66, 152, 22, 174, 63, 50, 232, 105,
  132, 187, 78, 249, 58, 90, 240, 9, 151, 122, 43, 31, 52, 53, 238, 51, 144, 64,
  74, 117, 89, 208, 92, 216, 39, 157, 136, 173, 221, 234, 249, 243, 32, 112, 94,
  250, 219, 64, 75, 181, 223, 158, 100, 24, 189, 244, 192,
];
const privateKeyUint8Array: any = Uint8Array.from(privateKeypairBuffer);
const privateKeypair = Keypair.fromSecretKey(privateKeyUint8Array);

const payerWallet = new Wallet(privateKeypair);

const getProvider = async () => {
  const network = "https://api.devnet.solana.com";
  const opts: ConfirmOptions = {
    preflightCommitment: "processed",
  };
  const connection = new Connection(network, opts.preflightCommitment);

  const provider = new Provider(connection, payerWallet, opts);
  return provider;
};

export default withSentry(async (req, res) => {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401);
  }

  const publicKey = session.user.name;

  let betValue = 0;

  if (holderCount[publicKey]) {
    betValue =
      holderCount[publicKey] >= 10
        ? 0.15 // Whale: 10+
        : holderCount[publicKey] >= 5
        ? 0.1 // Baby whale: 5-9
        : 0.05; // Holder: 1-4
  } else {
    res.status(400).send("You are not a holder");
    return;
  }

  const lastDailySpinRef = db.ref(`users/${publicKey}/lastDailySpin`);
  const lastDailySpinTime = (await lastDailySpinRef.get()).val();

  if (Date.now() - lastDailySpinTime < 86400000) {
    res.status(400).send("You can only spin once per day");
  }

  let lastDailySpinTimeNumber = Date.now();
  lastDailySpinRef.set(lastDailySpinTimeNumber);

  const saveToDB = async (winnings, id) => {
    const historyTransactionRef = db.ref(`users/${publicKey}/history/${id}`);
    historyTransactionRef.set({
      timestamp: new Date().getTime(),
      bet: betValue,
      winnings: winnings,
      id: id,
    });
  };

  const getHistory = async () => {
    const historyRef = db.ref(`users/${publicKey}/history`);
    let history = (await historyRef.get()).val();
    if (history) {
      history = Object.keys(history).map((key) => {
        return {
          ...history[key],
        };
      });
      return history;
    } else {
      return [];
    }
  };

  const multipliers = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0.25,
    7: 0.5,
    8: 1,
    9: 0.75,
    10: 1.5,
    11: 1,
    12: 2,
    13: 2.5,
    14: 5,
    15: 0.1,
    16: 0,
    17: 0.25,
    18: 0.1,
    19: 0,
    20: 0,
  };

  const randomNumber = await randomNumberGenerator(1, 20);

  const multiplier = multipliers[randomNumber];

  const winnings = betValue * multiplier - betValue;

  const animationNumber = await randomNumberGenerator(1, 5);

  const lamportsAmount = parseInt(
    (web3.LAMPORTS_PER_SOL * winnings).toFixed(0)
  );

  const provider = await getProvider();
  const program = new Program(IDL, programId, provider);

  const poolKeyRef = db.ref(`users/${publicKey}/poolKeypair`);
  const poolKeypairArray = (await poolKeyRef.get()).val();

  const secretKey: any = Uint8Array.from(poolKeypairArray);
  const poolKeypair = Keypair.fromSecretKey(secretKey);

  const [poolSigner, nonce] = await web3.PublicKey.findProgramAddress(
    [poolKeypair.publicKey.toBuffer()],
    programId
  );

  const userRef = (
    await db.ref(`users/${publicKey}/linkedReferral`).get()
  ).val();

  if (winnings > 0) {
    try {
      const tx = await program.rpc.deposit(new BN(lamportsAmount), {
        accounts: {
          pool: poolKeypair.publicKey,
          vault: poolSigner,
          depositor: payerWallet.publicKey,
          poolSigner: poolSigner,
          systemProgram: web3.SystemProgram.programId,
        },
      });
      if (userRef) {
        const referralRef = db.ref(`ref/${userRef}/transactions/${tx}`);
        referralRef.set({
          timestamp: new Date().getTime(),
          bet: betValue,
          winnings: winnings,
          id: tx,
        });
      }
      saveToDB(winnings, tx);
    } catch (err) {
      console.log(err);
    }
    res.status(200).json({
      winnings,
      animation: `success_${animationNumber}`,
      history: await getHistory(),
      lastDailySpinTime: lastDailySpinTimeNumber,
    });
  } else if (winnings < 0) {
    try {
    } catch (err) {
      console.log(err);
    }
    res.status(200).json({
      winnings,
      animation: `failed_${animationNumber}`,
      history: await getHistory(),
      lastDailySpinTime: lastDailySpinTimeNumber,
    });
  } else {
    res.status(200).json({
      winnings,
      animation: `failed_${animationNumber}`,
      history: await getHistory(),
      lastDailySpinTime: lastDailySpinTimeNumber,
    });
  }
});
