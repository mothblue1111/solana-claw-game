import { useState } from "react";
import styled from "styled-components";

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
  padding: 30px;
  box-sizing: border-box;
  background: #272557;
  box-shadow: 0 30px 50px 10px rgba(0, 0, 0, 0.75);
  width: 340px;
  max-width: 90vw;
  border-radius: 30px;
  opacity: ${(props) => (props.isOpen ? "1" : "0")};
  transform: scale(${(props) => (props.isOpen ? "1" : "0.9")});

  transition: 0.3s opacity ease-out, 0.3s transform ease-out;
`;

const SpacedRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
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

const InputRow = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  height: 44px;
  border-radius: 22px;
  padding: 0 15px;
  margin-bottom: 20px;
`;

const Input = styled.input`
  border: none;
  outline: none;
  background: none;
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  color: white;
  width: 100%;
`;

const InputInfo = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
`;

const ButtonGlow = styled.div<{ disabled: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  background: #0ebc5e;
  border-radius: 22px;
  height: 44px;
  width: 100%;
  filter: blur(10px);
  z-index: -1;
  opacity: ${(props) => (props.disabled ? "0" : "0.7")};

  transition: 0.2s opacity ease-out;
`;

const Button = styled.span<{ disabled: boolean }>`
  background: #0ebc5e;
  border-radius: 22px;
  height: 44px;
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
`;

const BetControlRow = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 22px;
  padding: 5px;
  box-sizing: border-box;
  margin-top: 5px;
  margin-bottom: 20px;
`;

const BetControlButton = styled.span<{
  active?: boolean;
  isNextActive: boolean;
}>`
  background: ${(props) => (props.active ? "#0EBC5E" : "none")};
  border-radius: ${(props) => (props.active ? "22px" : "0")};
  height: ${(props) => (props.active ? "34px" : "24px")};
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.active ? "white" : "rgba(255, 255, 255, 0.5)")};
  border-right: ${(props) =>
    props.active || props.isNextActive
      ? "none"
      : "1px solid rgba(255, 255, 255, 0.1)"};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;

  &:last-child {
    border-right: none;
  }

  &:hover {
    color: white;
  }

  transition: 0.2s color ease-out;
`;

const CancelButton = styled.span`
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 22px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  margin-top: 10px;
`;

interface AutoplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartAutoplay: (
    numberOfPlays: number,
    minBalance: number,
    maxWinnings: number
  ) => void;
  setAutoplay: (isAutoplay: boolean) => void;
}

const AutoplayModal = (props: AutoplayModalProps) => {
  const [numberOfPlays, setNumberOfPlays] = useState(10);
  const [minBalance, setMinBalance] = useState("10");
  const [maxWinnings, setMaxWinnings] = useState("100");

  return (
    <Overlay
      isOpen={props.isOpen}
      onClick={(e) => (e.target === e.currentTarget ? props.onClose() : null)}
    >
      <Popup isOpen={props.isOpen}>
        <SpacedRow>
          <Heading>Number of Plays</Heading>
          <ResetButton onClick={() => setNumberOfPlays(10)}>Reset</ResetButton>
        </SpacedRow>
        <BetControlRow>
          <BetControlButton
            active={numberOfPlays === 10}
            isNextActive={numberOfPlays === 20}
            onClick={() => setNumberOfPlays(10)}
          >
            10
          </BetControlButton>
          <BetControlButton
            active={numberOfPlays === 20}
            isNextActive={numberOfPlays === 50}
            onClick={() => setNumberOfPlays(20)}
          >
            20
          </BetControlButton>
          <BetControlButton
            active={numberOfPlays === 50}
            isNextActive={numberOfPlays === 100}
            onClick={() => setNumberOfPlays(50)}
          >
            50
          </BetControlButton>
          <BetControlButton
            active={numberOfPlays === 100}
            isNextActive={false}
            onClick={() => setNumberOfPlays(100)}
          >
            100
          </BetControlButton>
        </BetControlRow>
        <SpacedRow>
          <Heading>Stop When SOL Balance Hits</Heading>
          <ResetButton onClick={() => setMinBalance("")}>Reset</ResetButton>
        </SpacedRow>
        <InputRow>
          <Input
            type="text"
            placeholder="0"
            value={minBalance}
            onChange={(e) => setMinBalance(e.target.value)}
          />
          <InputInfo>SOL</InputInfo>
        </InputRow>
        <SpacedRow>
          <Heading>Stop When SOL Winnings Exceed</Heading>
          <ResetButton onClick={() => setMaxWinnings("")}>Reset</ResetButton>
        </SpacedRow>
        <InputRow>
          <Input
            type="text"
            placeholder="0"
            value={maxWinnings}
            onChange={(e) => setMaxWinnings(e.target.value)}
          />
          <InputInfo>SOL</InputInfo>
        </InputRow>
        <Button
          disabled={false}
          onClick={() => {
            props.setAutoplay(true)
            props.onStartAutoplay(
              numberOfPlays,
              Number(minBalance),
              Number(maxWinnings)
            );
          }}
        >
          <ButtonGlow disabled={false} />
          Start Game
        </Button>
        <CancelButton onClick={props.onClose}>Cancel</CancelButton>
      </Popup>
    </Overlay>
  );
};

export default AutoplayModal;
