import styled from "styled-components";
import Image from "next/image";
import cryingEmoji from "../assets/crying.svg";
import partyingEmoji from "../assets/partying.svg";

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  min-height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  visibility: ${(props) => (props.isOpen ? "visible" : "hidden")};
  opacity: ${(props) => (props.isOpen ? "1" : "0")};
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  transition: 0.3s opacity ease-out, 0.3s visibility ease-out;
`;

const Popup = styled.div<{ isOpen: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  box-sizing: border-box;
  background: #272557;
  box-shadow: 0 30px 50px 10px rgba(0, 0, 0, 0.75);
  width: 400px;
  max-width: 90vw;
  border-radius: 30px;
  opacity: ${(props) => (props.isOpen ? "1" : "0")};
  transform: scale(${(props) => (props.isOpen ? "1" : "0.9")});

  transition: 0.3s opacity ease-out, 0.3s transform ease-out;
`;

const Emoji = styled.div<{ hidden: boolean }>`
  display: ${(props) => (props.hidden ? "none" : "unset")};
  margin-top: -100px;
`;

const Title = styled.span`
  font-size: 28px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 10px;
`;

const Subtitle = styled.span`
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 20px;
`;

const Text = styled.span`
  font-size: 12px;
  text-align: center;
  margin-bottom: 20px;
  opacity: 0.7;
`;

const CloseButton = styled.span`
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.1);
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  transition: 0.2s background ease-out;
`;

interface GameResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameWon: boolean;
  newBalance: number;
  winnings: number;
}

const GameResultModal = (props: GameResultModalProps) => {
  return (
    <Overlay
      isOpen={props.isOpen}
      onClick={(e) => (e.target === e.currentTarget ? props.onClose() : null)}
    >
      <Popup isOpen={props.isOpen}>
        <Emoji hidden={!props.gameWon}>
          <Image src={partyingEmoji} priority alt="" />
        </Emoji>
        <Emoji hidden={props.gameWon}>
          <Image src={cryingEmoji} priority alt="" />
        </Emoji>
        <Title>
          {props.gameWon ? "Congratulations!" : "Better luck next time!"}
        </Title>
        <Subtitle>
          {props.gameWon
            ? `You won ${+props.winnings.toFixed(4)} SOL! `
            : "Sorry you didn't win."}
        </Subtitle>
        <Text>
          Your current balance is now: {+props.newBalance.toFixed(4)} SOL
        </Text>
        <CloseButton onClick={props.onClose}>Close</CloseButton>
      </Popup>
    </Overlay>
  );
};

export default GameResultModal;
