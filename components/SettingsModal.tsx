import styled from "styled-components";
import Image from "next/image";
import closeButton from "../assets/close-button.svg";
import { useState } from "react";
import dayjs from "dayjs";
import { Session } from "next-auth";

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
  background: #272557;
  box-shadow: 0 30px 50px 10px rgba(0, 0, 0, 0.75);
  width: 700px;
  max-width: 90vw;
  border-radius: 30px;
  opacity: ${(props) => (props.isOpen ? "1" : "0")};
  transform: scale(${(props) => (props.isOpen ? "1" : "0.9")});

  transition: 0.3s opacity ease-out, 0.3s transform ease-out;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  border-radius: 30px 30px 0 0;
  background: rgba(255, 255, 255, 0.05);
  padding: 20px 24px;
  box-sizing: border-box;
  margin-bottom: 10px;
`;

const Title = styled.span`
  font-weight: 600;
  font-size: 20px;
  margin-right: auto;
`;

const TabSelectionRow = styled.div`
  display: flex;
`;

const TabSelectionButton = styled.span<{ active?: boolean }>`
  flex: 1;
  border-bottom: 1px solid
    ${(props) => (props.active ? "white" : "rgba(255, 255, 255, 0.1)")};
  color: ${(props) => (props.active ? "white" : "rgba(255, 255, 255, 0.5)")};
  text-align: center;
  padding-bottom: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    border-bottom: 1px solid
      ${(props) => (props.active ? "white" : "rgba(255, 255, 255, 0.5)")};
  }

  transition: 0.2s border-bottom ease-out;
`;

const ContentColumn = styled.div`
  display: flex;
  flex-direction: column;
  padding: 30px;
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

const DisplayRow = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  height: 44px;
  border-radius: 22px;
  padding: 0 15px;
`;

const Display = styled.div`
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
  margin-top: 70px;

  transition: 0.2s opacity ease-out;

  &:hover ${ButtonGlow} {
    opacity: ${(props) => (props.disabled ? "0" : "1")};
  }
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
  max-height: 150px;
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

interface SettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session;
  referralLink: string;
}

const SettingModal = (props: SettingModalProps) => {
  return (
    <Overlay
      isOpen={props.isOpen}
      onClick={(e) => (e.target === e.currentTarget ? props.onClose() : null)}
    >
      <Popup isOpen={props.isOpen}>
        <TitleRow>
          <Title>Settings</Title>
          <Image
            src={closeButton}
            width={24}
            height={24}
            style={{ cursor: "pointer" }}
            onClick={props.onClose}
            alt="Close button"
          />
        </TitleRow>
        <ContentColumn>
          <SpacedRow>
            <Heading>Referral Link</Heading>
          </SpacedRow>
          <DisplayRow>
            <Display>{props.referralLink}</Display>
          </DisplayRow>
        </ContentColumn>
      </Popup>
    </Overlay>
  );
};

export default SettingModal;
