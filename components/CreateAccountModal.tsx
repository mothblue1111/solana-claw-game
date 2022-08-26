import styled from "styled-components";
import Image from "next/image";
import cryingEmoji from "../assets/crying.svg";
import partyingEmoji from "../assets/partying.svg";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useWallet } from "@solana/wallet-adapter-react";

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  min-height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(15px);
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

const Button = styled.span`
  height: 44px;
  background: linear-gradient(to bottom, #534bb1, #551bf9);
  align-self: stretch;
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
`;

interface CreateAccountModalProps {
  isOpen: boolean;
  onCreateAccount: () => Promise<void>;
}

const CreateAccountModal = (props: CreateAccountModalProps) => {
  const { publicKey } = useWallet();

  useEffect(() => {
    setTimeout(() => {
      if (publicKey) {
        toast.promise(
          async () => {
            await props.onCreateAccount();
          },
          {
            pending: "Creating account...",
            success: "Account created! Have fun!",
            error: "Error creating account, check your balance and network.",
          }
        );
      }
    }, 500);
  }, [publicKey]);

  return (
    // <Overlay isOpen={props.isOpen}>
    //   <Popup isOpen={props.isOpen}>
    //     <Title>Welcome</Title>
    //     <Subtitle>
    //       We're creating an account for you. Check your wallet and approve the
    //       transaction. If nothing happens, you may not have enough balance in
    //       your wallet.
    //     </Subtitle>
    //   </Popup>
    // </Overlay>
    <> </>
  );
};

export default CreateAccountModal;
