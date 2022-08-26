import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { db } from "../../firebase/admin";

import IDL_JSON from "../../types/deposit_withdraw.json";
import {
  clusterApiUrl,
  ConfirmOptions,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { BN, Program, Provider, Wallet, web3 } from "@project-serum/anchor";
import { withSentry } from "@sentry/nextjs";

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

  const body = JSON.parse(req.body);

  const depositAmount: number = body.depositAmount;

  if (!(depositAmount > 0 && depositAmount < 100)) {
    res.status(400).json({
      message: "Invalid deposit amount",
    });
  }

  const lamportsAmount = parseInt(
    (web3.LAMPORTS_PER_SOL * depositAmount).toFixed(0)
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

  const contractLamports = await provider.connection.getBalance(poolSigner);
  const contractSol = contractLamports / web3.LAMPORTS_PER_SOL;

  if (contractSol < depositAmount) {
    res.status(400);
    res.json({
      message: "Insufficient funds",
    });
    return;
  }

  try {
    const tx = await program.rpc.withdraw(new BN(lamportsAmount * -1), {
      accounts: {
        pool: poolKeypair.publicKey,
        vault: poolSigner,
        receiver: payerWallet.publicKey,
        poolSigner: poolSigner,
        systemProgram: web3.SystemProgram.programId,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }

  let transaction = new Transaction();

  const toPubKey = new PublicKey(session.user.name);

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: privateKeypair.publicKey,
      toPubkey: toPubKey,
      lamports: lamportsAmount,
    })
  );

  let connection = new Connection(clusterApiUrl("devnet"));

  const withdrawTx = await sendAndConfirmTransaction(connection, transaction, [
    privateKeypair,
  ]);

  res.status(200).json({
    tx: withdrawTx,
  });
});
