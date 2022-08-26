import styled, { keyframes } from "styled-components";
import Image from "next/image";
import clawMachinePic from "../assets/claw-machine.svg";
import autoplayIcon from "../assets/autoplay.svg";
import frontLayerCards from "../assets/cards.png";
import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import CashierModal from "../components/CashierModal";
import { Player } from "@lottiefiles/react-lottie-player";
import GameResultModal from "../components/GameResultModal";
import AutoplayModal from "../components/AutoplayModal";
import SettingsModal from "../components/SettingsModal";
import useSound from "use-sound";

import Countdown from "react-countdown";

import { useRouter } from "next/router";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import BetSelection from "../components/BetSelection";
import dayjs from "dayjs";
import { signIn, signOut, useSession } from "next-auth/react";

import delay from "delay";

import bs58 from "bs58";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { clientDb } from "../firebase/app";
import {
  ref,
  set,
  onValue,
  limitToFirst,
  query,
  limitToLast,
} from "firebase/database";
import moment from "moment";
moment().format();

import {
  Commitment,
  ConfirmOptions,
  Connection,
  Keypair,
  PublicKey,
} from "@solana/web3.js";

import {
  Address,
  BN,
  Program,
  Provider,
  web3,
  Idl,
} from "@project-serum/anchor";

import IDL_JSON from "../types/deposit_withdraw.json";

const IDL: any = IDL_JSON;

const SMART_CONTRACT_ID = "7o2fZ5P9W8QazdATi3poUL5AXCnKCFi3FThNeVx9xfpi";
const programId = new PublicKey(SMART_CONTRACT_ID);

const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 100px;
  flex: 1;
  min-height: calc(100vh - 50px - 100px);
  position: relative;
`;

const ClawMachineContainer = styled.div<{ active: boolean }>`
  z-index: 2;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);

  width: ${(props) =>
    props.active
      ? "calc(0.707 * (100vh - 70px + 450px))"
      : "327px"}; // 0.707 * HEIGHT
  height: ${(props) =>
    props.active ? "calc(100vh - 70px + 450px)" : "653px"}; // 0.707 * HEIGHT

  * {
    width: ${(props) =>
      props.active
        ? "calc(0.707 * (100vh - 70px + 450px))"
        : "327px"} !important; // 0.707 * HEIGHT
    height: ${(props) =>
      props.active
        ? "calc(100vh - 70px + 450px)"
        : "653px"} !important; // 0.707 * HEIGHT

    transition: width 0.4s ease-in-out, height 0.4s ease-in-out;
  }

  transition: width 0.4s ease-in-out, height 0.4s ease-in-out;
`;

const ClawMachineContent = styled.div`
  position: relative;
  pointer-events: none;
  user-select: none;
`;

const flicker = keyframes`
  0% { opacity: 1; }
  5% { opacity: 0.65; }
  10% { opacity: 1; }
  30% { opacity: 0.7; }
  33% { opacity: 0.9; }
  36% { opacity: 0.8; }
  40% { opacity: 1; }
  70% { opacity: 0.8; }
  73% { opacity: 0.9; }
  78% { opacity: 1; }
  80% { opacity: 0.85; }
  84% { opacity: 1;}
`;

const MachineText = styled.span`
  font-family: "Apple", serif;
  font-size: 20px;
  color: #de6ace;
  white-space: nowrap;
  width: max-content !important;

  position: absolute;
  top: 13px;
  left: 50%;
  transform: translateX(-50%);
  animation: 2s ${flicker} linear infinite;
`;

const MachineTextBlurred = styled(MachineText)`
  filter: blur(2px);
`;

// @ts-ignore
const MachineLottiePlayer = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
`;

const GameControlsCol = styled.div<{ hidden: boolean }>`
  width: 320px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  margin-top: 43px;

  padding-top: 653px; // extra for the claw machine

  opacity: ${(props) => (props.hidden ? "0" : "1")};
  transition: opacity 0.2s ease-in-out;
`;

const SpacedRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Heading = styled.span`
  font-size: 12px;
`;

const ResetButton = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #ff0055;
  cursor: pointer;
`;

// const BetControlRow = styled.div`
//   display: flex;
//   align-items: center;
//   background: rgba(255, 255, 255, 0.1);
//   border-radius: 22px;
//   padding: 5px;
//   box-sizing: border-box;
//   margin-top: 5px;
//   margin-bottom: 20px;
// `;
//
// const BetControlButton = styled.span<{
//   active?: boolean;
//   isNextActive: boolean;
// }>`
//   background: ${(props) => (props.active ? "#0EBC5E" : "none")};
//   border-radius: ${(props) => (props.active ? "22px" : "0")};
//   height: ${(props) => (props.active ? "34px" : "24px")};
//   width: 52px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   color: ${(props) => (props.active ? "white" : "rgba(255, 255, 255, 0.5)")};
//   border-right: ${(props) =>
//     props.active || props.isNextActive
//       ? "none"
//       : "1px solid rgba(255, 255, 255, 0.1)"};
//   font-size: 15px;
//   font-weight: 600;
//   cursor: pointer;
//
//   &:last-child {
//     border-right: none;
//   }
//
//   &:hover {
//     color: white;
//   }
//
//   transition: 0.2s color ease-out;
// `;

const ButtonGlow = styled.div<{ disabled: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  background: #0ebc5e;
  border-radius: 22px;
  height: 44px;
  width: 185px;
  filter: blur(10px);
  z-index: -1;
  opacity: ${(props) => (props.disabled ? "0" : "0.7")};

  transition: 0.2s opacity ease-out;
`;

const StartButton = styled.span<{ disabled: boolean }>`
  background: #0ebc5e;
  border-radius: 22px;
  height: 44px;
  width: 185px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  opacity: ${(props) => (props.disabled ? "0.7" : "1")};

  transition: 0.2s opacity ease-out;

  &:hover ${ButtonGlow} {
    opacity: ${(props) => (props.disabled ? "0" : "1")};
  }

  cursor: ${(props) => (props.disabled ? "default" : "pointer")};

  pointer-events: ${(props) => (props.disabled ? "none" : "default")};
`;

const AutoPlayButton = styled.div`
  padding: 0 20px;
  height: 44px;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 22px;
  cursor: pointer;
`;

const AutoPlayText = styled.span<{ isAutoPlaying: boolean }>`
  margin-left: ${(props) => (props.isAutoPlaying ? "0" : "5px")};
  font-size: 15px;
  font-weight: 600;
  text-align: center;
`;

const CopyrightText = styled.span`
  margin-top: auto;
  padding-top: 50px;
  margin-bottom: 20px;
  font-size: 7px;
  font-family: "Apple", monospace;
`;

const ContentColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 40rem;
`;

const TableHeadersRow = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 10px 15px;
  border-radius: 15px 15px 0 0;
`;

const TableHeader = styled.span<{ flex?: number }>`
  flex: ${(props) => props.flex || 1};
  font-size: 14px;
  padding-right: 10px;
`;

const TableContent = styled.div`
  background: #272557;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 0 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0 0 15px 15px;
`;

const TableRow = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-bottom: none;
  }
`;

const TableRowText = styled.span<{ flex?: number; color?: string }>`
  flex: ${(props) => props.flex || 1};
  font-size: 14px;
  color: ${(props) => props.color || "white"};
  padding-right: 10px;
`;

const useAudio = (url: string): [boolean, () => void] => {
  const [audio] = useState(new Audio(url));
  const [playing, setPlaying] = useState(false);

  const toggle = (): void => setPlaying(!playing);

  useEffect(() => {
    playing ? audio.play() : audio.pause();
  }, [playing]);

  useEffect(() => {
    audio.addEventListener("ended", () => setPlaying(false));
    return () => {
      audio.removeEventListener("ended", () => setPlaying(false));
    };
  }, []);

  return [playing, toggle];
};

export interface RecentPlay {
  timestamp: number;
  bet: number;
  winnings: number;
  id: string;
}

const IndexPage = (props) => {
  const router = useRouter();
  const queryRef = router.query.ref;
  const { data: session } = useSession();
  const wallet = useWallet();

  const { publicKey, signMessage, disconnect } = wallet;

  const [account, setAccount] = useState(props.account);
  const [history, setHistory] = useState(props.history);
  const [lastDailySpinTime, setLastDailySpinTime] = useState(
    props.lastDailySpinTime
  );

  const createPoolkeypair = () => {
    if (props.poolKeyArray) {
      const secretKey: any = Uint8Array.from(props.poolKeyArray);
      return Keypair.fromSecretKey(secretKey);
    } else {
      return null;
    }
  };

  const getProvider = async () => {
    const network = "https://api.devnet.solana.com";
    const opts: ConfirmOptions = {
      preflightCommitment: "processed",
    };
    const connection = new Connection(network, opts.preflightCommitment);

    const provider = new Provider(connection, wallet, opts);
    return provider;
  };

  const poolKeypair = createPoolkeypair();

  const [solBalance, setSolBalance] = useState<number>(0);

  // Get balance
  useEffect(() => {
    (async () => {
      if (props.account) {
        const provider = await getProvider();
        const [poolSigner, nonce] = await web3.PublicKey.findProgramAddress(
          [poolKeypair.publicKey.toBuffer()],
          programId
        );

        const contractLamports = await provider.connection.getBalance(
          poolSigner
        );
        setSolBalance(contractLamports / web3.LAMPORTS_PER_SOL);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (publicKey) {
        if (!session) {
          try {
            const nonce = await fetchNonce();

            const message = `Sign this message for authenticating with your wallet. Nonce: ${nonce}`;
            const encodedMessage = new TextEncoder().encode(message);
            const signature = bs58.encode(await signMessage(encodedMessage));

            signIn("credentials", {
              publicKey: publicKey,
              signature: signature,
              ref: queryRef,
            });
          } catch (err) {
            disconnect();
          }
        }
      } else {
        if (session) {
          signOut();
        }
      }
    })();
  }, [publicKey]);

  const fetchNonce = async () => {
    const response = await fetch("/api/getNonce");

    if (response.status != 200) throw new Error("nonce could not be retrieved");

    const { nonce } = await response.json();

    return nonce;
  };

  const deposit = async (solAmount: string) => {
    const lamportsAmount = web3.LAMPORTS_PER_SOL * parseFloat(solAmount);

    const provider = await getProvider();
    const program = new Program(IDL, programId, provider);

    const [poolSigner, nonce] = await web3.PublicKey.findProgramAddress(
      [poolKeypair.publicKey.toBuffer()],
      programId
    );

    try {
      await program.rpc.deposit(new BN(lamportsAmount), {
        accounts: {
          pool: poolKeypair.publicKey,
          vault: poolSigner,
          depositor: publicKey,
          poolSigner: poolSigner,
          systemProgram: web3.SystemProgram.programId,
        },
      });
      const contractLamports = await provider.connection.getBalance(poolSigner);
      toast.success(`${solAmount} SOL deposited successfully.`, {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
      setSolBalance(contractLamports / web3.LAMPORTS_PER_SOL);
    } catch (err) {}
  };

  const withdraw = async (solAmount: string) => {
    const provider = await getProvider();

    const [poolSigner, nonce] = await web3.PublicKey.findProgramAddress(
      [poolKeypair.publicKey.toBuffer()],
      programId
    );

    try {
      const withdrawRequest = await fetch("/api/withdraw", {
        method: "POST",
        body: JSON.stringify({
          depositAmount: solAmount,
        }),
      });
      const contractLamports = await provider.connection.getBalance(poolSigner);
      toast.success(`${solAmount} SOL withdrawn succesfully.`, {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
      setSolBalance(contractLamports / web3.LAMPORTS_PER_SOL);
    } catch (err) {
      console.log(err);
    }
  };

  const initializeAccount = async () => {
    const provider = await getProvider();
    const program = new Program(IDL, programId, provider);

    const [poolSigner, nonce] = await web3.PublicKey.findProgramAddress(
      [poolKeypair.publicKey.toBuffer()],
      programId
    );

    try {
      const tx = await program.rpc.initialize(nonce, {
        accounts: {
          authority: new PublicKey(
            "4UHNQPbnmCmcFbGPQhLcM8mYTp8EMMa6BXi5beh915Lb"
          ),
          pool: poolKeypair.publicKey,
          poolSigner: poolSigner,
          owner: publicKey,
          vault: poolSigner,
          systemProgram: web3.SystemProgram.programId,
        },
        signers: [poolKeypair],
        instructions: [
          await program.account.pool.createInstruction(poolKeypair),
        ],
      });
      setAccount(tx);
      await fetch("/api/accountCreated", {
        method: "POST",
        body: JSON.stringify({
          tx: tx,
        }),
      });
    } catch (err) {}
  };

  const [machineText, setMachineText] = useState("PLAY NOW");
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationURL, setAnimationURL] = useState(
    "/animations/failed_1/data.json"
  );
  const [gameWon, setGameWon] = useState(false);
  const [winnings, setWinnings] = useState(0);
  const [isGameResultModalOpen, setIsGameResultModalOpen] = useState(false);
  const [isAutoplayModalOpen, setIsAutoplayModalOpen] = useState(false);
  const [betValue, setBetValue] = useState(0.05);
  const [isCashierModalOpen, setIsCashierModalOpen] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Audio handling
  const [playClawProcess] = useSound("/sounds/Claw_Process.wav");
  const [playCoinInsert] = useSound("/sounds/Coin_Insert.wav");
  const [playFailed] = useSound("/sounds/Failed.wav");
  const [playSuccess] = useSound("/sounds/Success.wav");

  const onStartGame = async () => {
    setIsPlaying(true);
    setMachineText("GOOD LUCK");
    playCoinInsert();

    const gameResponse = await fetch("/api/playGame", {
      method: "POST",
      body: JSON.stringify({
        betValue: betValue,
      }),
    });

    const gameResponseJSON = await gameResponse.json();

    const { winnings, animation, history } = gameResponseJSON;

    setAnimationURL(`/animations/${animation}/data.json`);
    setWinnings(winnings);
    if (winnings > 0) {
      setGameWon(true);
    } else {
      setGameWon(false);
    }

    await delay(8000);
    setIsPlaying(false);
    setMachineText("PLAY NOW");
    setSolBalance(solBalance + winnings);
    setIsGameResultModalOpen(true);
    if (winnings > 0) {
      playSuccess();
    } else {
      playFailed();
    }
    setHistory(history);

    if (winnings >= 0) {
      toast.success(`+ ${+winnings.toFixed(4)} SOL`, {
        position: "bottom-right",
      });
    } else {
      toast.update(`- ${+winnings.toFixed(4)} SOL`, {
        position: "bottom-right",
      });
    }
  };

  const onDailySpin = async () => {
    setIsPlaying(true);
    setMachineText("GOOD LUCK");

    const gameResponse = await fetch("/api/dailySpin", {
      method: "POST",
    });

    const gameResponseJSON = await gameResponse.json();

    const { winnings, animation, history, lastDailySpinTime } =
      gameResponseJSON;

    setAnimationURL(`/animations/${animation}/data.json`);
    setWinnings(winnings);
    if (winnings > 0) {
      setGameWon(true);
    } else {
      setGameWon(false);
    }

    await delay(8000);
    setIsPlaying(false);
    setMachineText("PLAY NOW");
    if (winnings > 0) {
      setSolBalance(solBalance + winnings);
    }
    setIsGameResultModalOpen(true);
    setHistory(history);
    setLastDailySpinTime(lastDailySpinTime);

    if (winnings >= 0) {
      toast.success(`+ ${+winnings.toFixed(4)} SOL`, {
        position: "bottom-right",
      });
    }
  };

  const onStartAutoplay = async (
    numberOfPlays: number,
    minBalance: number,
    maxWinnings: number
  ) => {
    let totalWinnings = 0;

    setIsPlaying(true);
    setMachineText("GOOD LUCK");
    setIsAutoplayModalOpen(false);

    for (let i = 0; i < numberOfPlays; i++) {
      if (solBalance < betValue) {
        break;
      }
      if (solBalance > minBalance) {
        break;
      }

      if (totalWinnings > maxWinnings) {
        break;
      }

      const gameResponse = await fetch("/api/playGame", {
        method: "POST",
        body: JSON.stringify({
          betValue: betValue,
        }),
      });

      const gameResponseJSON = await gameResponse.json();

      const { winnings, animation, history } = gameResponseJSON;

      setAnimationURL(`/animations/${animation}/data.json`);
      setWinnings(winnings);

      if (winnings > 0) {
        setGameWon(true);
      } else {
        setGameWon(false);
      }

      totalWinnings += winnings;

      await delay(8000);
      if (winnings > 0) {
        toast.success(`+${+winnings.toFixed(4)} SOL`, {
          position: "bottom-right",
        });
      } else {
        toast.error(`${+winnings.toFixed(4)} SOL`, {
          position: "bottom-right",
        });
      }
      setSolBalance(solBalance + winnings);
      setHistory(history);
    }

    setIsPlaying(false);
    setMachineText("PLAY NOW");
  };

  const [recentPlays, setRecentPlays] = useState<RecentPlay[]>([]);

  useEffect(() => {
    (async () => {
      const recentPlaysRef = query(
        ref(clientDb, "recentPlays"),
        limitToLast(20)
      );
      onValue(recentPlaysRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const historyData = Object.keys(data).map((key) => {
            return {
              ...data[key],
            };
          });

          historyData
            .sort((a, b) => {
              return a.timestamp - b.timestamp;
            })
            .reverse();

          setRecentPlays(historyData);
        }
      });
    })();
  }, []);

  function timeAgo(time) {
    moment.updateLocale("en", {
      relativeTime: {
        future: "in %s",
        past: "%s ago",
        s: (number) => number + "s ago",
        ss: "%ds ago",
        m: "1m ago",
        mm: "%dm ago",
        h: "1h ago",
        hh: "%dh ago",
        d: "1d ago",
        dd: "%dd ago",
        M: "a month ago",
        MM: "%d months ago",
        y: "a year ago",
        yy: "%d years ago",
      },
    });

    let secondsElapsed = moment().diff(time, "seconds");
    let dayStart = moment("2018-01-01").startOf("day").seconds(secondsElapsed);

    if (secondsElapsed > 300) {
      return moment(time).fromNow(true);
    } else if (secondsElapsed < 60) {
      return parseInt(dayStart.format("s")) + 2 + " seconds ago";
    } else {
      if (parseInt(dayStart.format("m")) == 1) {
        return dayStart.format("m") + " minutes ago";
      } else {
        return dayStart.format("m") + " minutes ago";
      }
    }
  }

  return (
    <>
      <ToastContainer position="bottom-right" />
      <CashierModal
        isOpen={isCashierModalOpen}
        onClose={() => setIsCashierModalOpen(false)}
        onDeposit={(amount) => deposit(amount)}
        onWithdraw={(amount) => withdraw(amount)}
        history={history}
      />
      <GameResultModal
        isOpen={isGameResultModalOpen}
        onClose={() => setIsGameResultModalOpen(false)}
        gameWon={gameWon}
        newBalance={solBalance}
        winnings={winnings}
      />
      <Nav
        session={session}
        solBalance={solBalance}
        setIsCashierModalOpen={setIsCashierModalOpen}
        initializeAccount={initializeAccount}
        account={account}
        setIsSettingsModalOpen={setIsSettingsModalOpen}
        isPlaying={isPlaying}
        lastDailySpinTime={lastDailySpinTime}
        onDailySpin={onDailySpin}
        recentPlays={recentPlays}
      />
      <AutoplayModal
        isOpen={isAutoplayModalOpen}
        onClose={() => setIsAutoplayModalOpen(false)}
        onStartAutoplay={onStartAutoplay}
        setAutoplay={setIsAutoPlaying}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        session={session}
        referralLink={props.refLink}
      />
      <Column>
        <MachineLottiePlayer>
          <Player
            src={animationURL}
            autoplay={isPlaying}
            style={{ width: "327px" }}
            // onEvent={(event) => {
            //   if (event === "load") {
            //     if (isPlaying) playClawProcess();
            //   }
            // }}
            // 2135px x 3021px
            // 230px = space height
          />
        </MachineLottiePlayer>
        <ClawMachineContainer active={false}>
          <ClawMachineContent>
            <Image
              src={clawMachinePic}
              width={327}
              height={653}
              alt="Claw machine"
              priority
            />
            <MachineText>{machineText}</MachineText>
            <MachineTextBlurred>{machineText}</MachineTextBlurred>
          </ClawMachineContent>
        </ClawMachineContainer>
        {session ? (
          <GameControlsCol hidden={false}>
            <SpacedRow>
              <Heading>Bet Amount (SOL)</Heading>
              <ResetButton onClick={() => setBetValue(0.05)}>Reset</ResetButton>
            </SpacedRow>
            <BetSelection
              betValue={betValue}
              onChange={(newValue) => setBetValue(newValue)}
              balance={solBalance}
            />
            <SpacedRow>
              <StartButton
                onClick={isPlaying ? undefined : onStartGame}
                disabled={isPlaying || solBalance < 0.05}
              >
                {isPlaying ? "Playing..." : "Start Game"}
                <ButtonGlow disabled={isPlaying} />
              </StartButton>
              <AutoPlayButton
                onClick={() => {
                  if (isAutoPlaying) {
                    window.location.reload();
                  } else {
                    setIsAutoplayModalOpen(true);
                  }
                }}
              >
                {!isAutoPlaying && (
                  <Image src={autoplayIcon} width={13} height={12} alt="" />
                )}
                <AutoPlayText isAutoPlaying={isAutoPlaying}>
                  {isAutoPlaying ? "Cancel" : "Autoplay"}
                </AutoPlayText>
              </AutoPlayButton>
            </SpacedRow>
          </GameControlsCol>
        ) : (
          <GameControlsCol hidden={false}>
            {/* <Heading>Connect Wallet to Play</Heading>
            <WalletMultiButton /> */}
          </GameControlsCol>
        )}

        <CopyrightText>Degen Claw Machine, developed by Howlies</CopyrightText>
      </Column>
    </>
  );
};

export default IndexPage;

import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import { db } from "../firebase/admin";
import uuid4 from "uuid4";

export async function getServerSideProps(context) {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions
  );

  if (session) {
    const publicKey = session.user.name;

    const historyRef = db.ref(`users/${publicKey}/history`);
    const accountRef = db.ref(`users/${publicKey}/account`);
    const poolKeyRef = db.ref(`users/${publicKey}/poolKeypair`);
    const referralRef = db.ref(`users/${publicKey}/referral`);
    const dailySpinRef = db.ref(`users/${publicKey}/lastDailySpin`);

    let history = (await historyRef.get()).val();
    let account = (await accountRef.get()).val();
    let poolKeypair = (await poolKeyRef.get()).val();
    let referral = (await referralRef.get()).val();
    let lastDailySpinTime = (await dailySpinRef.get()).val();

    if (!referral) {
      const referralId = uuid4();

      const referralLink = `http://localhost:3000/?ref=${referralId}`;

      referral = { link: referralLink, id: referralId };

      await referralRef.set(referral);
    }

    if (history) {
      history = Object.keys(history).map((key) => {
        return {
          ...history[key],
        };
      });
    }

    // code to check if user is a holder
    // not done yet need nft id
    let holder = true;

    if (holder) {
      if (!lastDailySpinTime) {
        const lastDailySpinRef = db.ref(`users/${publicKey}/lastDailySpin`);
        await lastDailySpinRef.set(0);
        lastDailySpinTime = 0;
      }
    }

    if (!poolKeypair) {
      poolKeypair = web3.Keypair.generate();

      const secretKey = poolKeypair.secretKey;

      await poolKeyRef.set(secretKey);
      poolKeypair = (await poolKeyRef.get()).val();
    }

    return {
      props: {
        account,
        poolKeyArray: poolKeypair,
        history,
        refLink: referral.link,
        lastDailySpinTime,
        holder,
      },
    };
  } else {
    return {
      props: {
        account: null,
        poolKeyArray: null,
        history: null,
        lastDailySpinTime: null,
        holder: null,
      },
    };
  }
}
