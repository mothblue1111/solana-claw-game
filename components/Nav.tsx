import styled, { keyframes } from "styled-components";
import Image from "next/image";

import navLogo from "../assets/nav-logo.png";
import walletIcon from "../assets/wallet-icon.svg";
import twitterLogo from "../assets/twitter.svg";
import discordLogo from "../assets/discord.svg";
import settingIcon from "../assets/autoplay.svg";
import countdownIcon from "../assets/countdown.svg";
import caretDown from "../assets/caret-down.svg";
import wolfAvatar from "../assets/wolf-avatar.png";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import { Session } from "next-auth";
import Countdown from "react-countdown";
import CreateAccountModal from "./CreateAccountModal";
import { RecentPlay } from "../pages";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import useSWR from "swr";
dayjs.extend(relativeTime);

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  width: calc(100vw - 40px);
  align-items: center;
  margin: 0 auto;
  margin-top: 15px;
  position: relative;

  // Override for WalletMultiButton CSS
  .wallet-adapter-button-trigger {
    background: linear-gradient(to bottom, #534bb1, #551bf9);
    border-radius: 18px;
    height: 36px;
    padding: 0 15px;
    font-size: 13px;
    font-weight: 600;

    .wallet-adapter-button-start-icon {
      margin-right: 6px;
    }
  }
`;

const RowItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  &:last-child {
    justify-content: flex-end;
  }

  &:nth-child(2) {
    justify-content: center;
  }
`;

const Logo = styled.div`
  margin-right: 10px;
`;

const LogoText = styled.span`
  font-family: "Apple", monospace;
  font-size: 10px;
  color: #e4e2ed;
`;

const Balance = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  height: 36px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 15px;
  box-sizing: border-box;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  transition: 0.2s background ease-out;
`;

const BalanceText = styled.span`
  margin-left: 5px;
  font-size: 13px;
  font-weight: 600;
`;

const NavButton = styled.div`
  display: flex;
  align-items: center;
  background: #512da8;
  height: 36px;
  border-radius: 4px;
  padding: 0 24px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  transition: 0.2s opacity ease-out;
`;

const WalletButton = styled.div`
  display: flex;
  align-items: center;
  background: #1e50ff;
  height: 36px;
  border-radius: 18px;
  padding: 0 24px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  transition: 0.2s opacity ease-out;
`;

const SocialButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  width: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-sizing: border-box;
  cursor: pointer;

  &:last-child {
    margin-right: 0;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  transition: 0.2s background ease-out;
`;

const Separator = styled.div`
  height: 20px;
  width: 1px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 1px;
`;

const CountdownCard = styled.div<{ disabled: boolean }>`
  display: flex;
  align-items: center;
  background: ${(props) =>
    props.disabled
      ? "rgba(255, 255, 255, 0.1)"
      : "linear-gradient(to bottom, #534bb1, #551bf9)"};
  height: 36px;
  border-radius: 18px;
  border: ${(props) =>
    props.disabled ? "1px solid rgba(255, 255, 255, 0.1)" : "none"};
  padding: 0 15px;
  box-sizing: border-box;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};

  transition: 0.2s background ease-out;
`;

const CountdownText = styled.span`
  font-family: "Roboto Mono", monospace;
  font-size: 13px;
  margin-left: 7px;
`;

const FreePlayText = styled.span`
  font-size: 13px;
  font-weight: 600;
  margin-left: 7px;
`;

const RecentButton = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  height: 36px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 15px;
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  transition: 0.2s background ease-out;
`;

const RecentButtonText = styled.span`
  font-size: 13px;
  font-weight: 600;
  margin-right: 5px;
`;

const RecentPlaysPopup = styled.div<{ isOpen: boolean }>`
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
  width: 325px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  max-height: 500px;
  overflow-y: auto;
  z-index: 3;
  backdrop-filter: blur(50px);

  &::-webkit-scrollbar {
    display: none;
  }
  &::-webkit-scrollbar-track {
    display: none;
  }

  transform: scale(${(props) => (props.isOpen ? 1 : 0.95)});
  transform-origin: top right;
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  visibility: ${(props) => (props.isOpen ? "visible" : "hidden")};

  transition: 0.2s transform ease-out, 0.2s opacity ease-out,
    0.2s visibility ease-out;
`;

const fadeIn = keyframes`
  from {opacity: 0;}
  to {opacity: 1;}
`;

const RecentPlayRow = styled.a`
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  text-decoration: none;
  color: white;
  padding: 10px;
  user-select: none;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  transition: 0.2s background ease-out;
  amimation: ${fadeIn} 0.2s ease-out;
`;

const RecentPlayAvatar = styled.div`
  height: 35px;
  width: 35px;
  background: #908cfd;
  border-radius: 50%;
  margin-right: 10px;
  flex-shrink: 0;
`;

const RecentPlayCol = styled.div`
  display: flex;
  flex-direction: column;
`;

const RecentPlayText = styled.span`
  font-size: 12px;
  font-weight: 500;
`;

const RecentPlayDescription = styled.span`
  font-size: 10px;
  color: rgba(255, 255, 255, 0.8);
`;

interface NavProps {
  session: Session;
  solBalance: number;
  setIsCashierModalOpen: (isOpen: boolean) => void;
  initializeAccount: () => Promise<void>;
  account: null | string;
  setIsSettingsModalOpen: (isOpen: boolean) => void;
  isPlaying: boolean;
  lastDailySpinTime: number;
  onDailySpin: () => void;
  recentPlays: RecentPlay[];
}

const Nav = (props: NavProps) => {
  const [isRecentPlaysOpen, setIsRecentPlaysOpen] = useState(true);

  const { data, error } = useSWR("/api/getAmountHeld");

  return (
    <Row>
      <RowItem>
        <SocialButton
          href="https://discord.gg/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src={discordLogo} alt="Discord" width={18} height={18} />
        </SocialButton>
        <SocialButton
          href="https://twitter.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src={twitterLogo} alt="Twitter" width={18} height={18} />
        </SocialButton>
        {!!props.account && <Separator />}
        {!!props.account && (
          <CountdownCard
            onClick={
              props.isPlaying ||
              Date.now() - props.lastDailySpinTime <= 86400000
                ? undefined
                : props.onDailySpin
            }
            disabled={
              (!data && !error) ||
              props.isPlaying ||
              Date.now() - props.lastDailySpinTime <= 86400000 ||
              (data && data.amountHeld <= 0)
            }
          >
            <Image src={countdownIcon} />
            {Date.now() - props.lastDailySpinTime > 86400000 ? (
              <FreePlayText>
                {!data && !error ? (
                  "Loading free play status..."
                ) : data && data.amountHeld >= 1 ? (
                  <>
                    Redeem Free Daily Play as a{" "}
                    {data.amountHeld >= 10
                      ? "Whale (0.15 SOL play)"
                      : data.amountHeld >= 5
                      ? "Baby Whale (0.1 SOL play)"
                      : "Holder (0.05 SOL play)"}
                  </>
                ) : (
                  "Purchase a Howlies to gain access to free daily plays!"
                )}
              </FreePlayText>
            ) : (
              <Countdown
                date={props.lastDailySpinTime + 86400000}
                renderer={({ hours, minutes, seconds }) => {
                  return (
                    <CountdownText>
                      {hours}:{minutes < 10 ? `0${minutes}` : minutes}:
                      {seconds < 10 ? `0${seconds}` : seconds}
                    </CountdownText>
                  );
                }}
              />
            )}
          </CountdownCard>
        )}
      </RowItem>
      {props.session ? (
        props.account ? (
          <></>
        ) : (
          // <RowItem>
          //   <NavButton onClick={() => props.initializeAccount()}>
          //     Create Account
          //   </NavButton>
          // </RowItem>
          <CreateAccountModal
            isOpen
            onCreateAccount={props.initializeAccount}
          />
        )
      ) : (
        <RowItem></RowItem>
      )}

      <RowItem>
        {!!props.session && !!props.account && (
          <Balance onClick={() => props.setIsCashierModalOpen(true)}>
            <Image src={walletIcon} alt="" width={14} height={12} />
            <BalanceText>{+props.solBalance.toFixed(5)} SOL</BalanceText>
          </Balance>
        )}
        <RecentButton onClick={() => setIsRecentPlaysOpen((prev) => !prev)}>
          <RecentButtonText>Recent</RecentButtonText>
          <Image src={caretDown} width={8} height={6} alt="" />
        </RecentButton>
        {/* Absolutely positioned recent plays popup: */}
        <RecentPlaysPopup isOpen={isRecentPlaysOpen}>
          {props.recentPlays.slice(0, 25).map((play) => (
            <RecentPlayRow
              href={`https://solscan.io/tx/${play.id}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <RecentPlayAvatar>
                <Image src={wolfAvatar} width={35} height={35} alt="" />
              </RecentPlayAvatar>
              <RecentPlayCol>
                <RecentPlayText>
                  {play.id.slice(0, 3)}..{play.id.slice(-3)}{" "}
                  {play.winnings > 0 || Math.abs(play.winnings) < play.bet
                    ? "won"
                    : "lost"}{" "}
                  {play.winnings > 0 || Math.abs(play.winnings) < play.bet ? (
                    <span
                      style={{
                        color: play.winnings > 0 ? "#13FF80" : "#908CFD",
                      }}
                    >
                      {((play.winnings + play.bet) / play.bet)
                        .toFixed(2)
                        .replace(/[.,]00$/, "")}
                      x on a {play.bet} SOL{" "}
                    </span>
                  ) : (
                    <>
                      <span style={{ color: "#FF0055" }}>
                        {play.winnings} SOL
                      </span>{" "}
                      on a{" "}
                    </>
                  )}
                  play.
                </RecentPlayText>
                <RecentPlayDescription>
                  {dayjs(play.timestamp).fromNow()}
                </RecentPlayDescription>
              </RecentPlayCol>
            </RecentPlayRow>
          ))}
        </RecentPlaysPopup>
        <WalletMultiButton />
        {props.session && (
          <SocialButton onClick={() => props.setIsSettingsModalOpen(true)}>
            <Image src={settingIcon} alt="Settings" width={18} height={18} />
          </SocialButton>
        )}
      </RowItem>

      {/* <div
          style={{
            textAlign: "center",
            marginTop: "16px",
            marginBottom: "8px",
          }}
        >
          Recent Plays
        </div>
        <ContentColumn>
          <TableHeadersRow>
            <TableHeader flex={2}>Time</TableHeader>
            <TableHeader>Bet</TableHeader>
            <TableHeader>Winnings</TableHeader>
            <TableHeader flex={2}>Transaction ID</TableHeader>
          </TableHeadersRow>
          <TableContent>
            {recentPlays.map((item, index) => (
              <TableRow key={index}>
                <TableRowText flex={2}>{timeAgo(item.timestamp)}</TableRowText>
                <TableRowText>{+item.bet.toFixed(2)} SOL</TableRowText>
                <TableRowText color={item.winnings > 0 ? "#13FF80" : "#FF0055"}>
                  {+item.winnings.toFixed(2)} SOL
                </TableRowText>
                <TableRowText
                  flex={2}
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    window.open(
                      `https://solscan.io/tx/${item.id}?cluster=devnet`,
                      "_blank"
                    )
                  }
                >
                  {item.id.slice(0, 8)}...{item.id.slice(-8)}
                </TableRowText>
              </TableRow>
            ))}
          </TableContent>
        </ContentColumn> */}
      {/* Recent plays: time, bet, winnings, txId

        */}
    </Row>
  );
};

export default Nav;
