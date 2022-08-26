import styled from "styled-components";

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
  isDisabled: boolean;
}>`
  background: ${(props) => (props.active ? "#0EBC5E" : "none")};
  border-radius: ${(props) => (props.active ? "22px" : "0")};
  height: ${(props) => (props.active ? "34px" : "24px")};
  width: 52px;
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
  cursor: ${(props) => (props.isDisabled ? "default" : "pointer")};
  pointer-events: ${(props) => (props.isDisabled ? "none" : "auto")};
  opacity: ${(props) => (props.isDisabled ? "0.5" : "1")};

  &:last-child {
    border-right: none;
  }

  &:hover {
    color: white;
  }

  transition: 0.2s color ease-out;
`;

interface BetSelectionProps {
  betValue: number;
  onChange: (value: number) => void;
  balance: number;
}

const BetSelection = (props: BetSelectionProps) => {
  return (
    <BetControlRow>
      <BetControlButton
        active={props.betValue === 0.05}
        isNextActive={props.betValue === 0.1}
        onClick={() => props.onChange(0.05)}
        isDisabled={props.balance < 0.05}
      >
        0.05
      </BetControlButton>
      <BetControlButton
        active={props.betValue === 0.1}
        isNextActive={props.betValue === 0.25}
        isDisabled={props.balance < 0.1}
        onClick={() => props.onChange(0.1)}
      >
        0.10
      </BetControlButton>
      <BetControlButton
        active={props.betValue === 0.25}
        isNextActive={props.betValue === 0.5}
        isDisabled={props.balance < 0.25}
        onClick={() => props.onChange(0.25)}
      >
        0.25
      </BetControlButton>
      <BetControlButton
        active={props.betValue === 0.5}
        isNextActive={props.betValue === 1}
        isDisabled={props.balance < 0.5}
        onClick={() => props.onChange(0.5)}
      >
        0.50
      </BetControlButton>
      <BetControlButton
        active={props.betValue === 1}
        isNextActive={props.betValue === 2}
        onClick={() => props.onChange(1)}
        isDisabled={props.balance < 1}
      >
        1.00
      </BetControlButton>
      <BetControlButton
        active={props.betValue === 2}
        isNextActive={false}
        // onClick={() => props.onChange(2)}
        // isDisabled={props.balance < 2}
        isDisabled
      >
        2.00
      </BetControlButton>
    </BetControlRow>
  );
};

export default BetSelection;
