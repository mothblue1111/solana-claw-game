import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { db } from "../../../firebase/admin";
import { web3 } from "@project-serum/anchor";
import uuid4 from "uuid4";
import { withSentry } from "@sentry/nextjs";

import type { NextApiRequest, NextApiResponse } from "next";

let request = {
  cookies: null,
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const nonce = request.cookies["auth-nonce"];

        const message = `Sign this message for authenticating with your wallet. Nonce: ${nonce}`;

        const messageBytes = new TextEncoder().encode(message);

        const publicKeyBytes = bs58.decode(credentials.publicKey);
        const signatureBytes = bs58.decode(credentials.signature);

        const result = nacl.sign.detached.verify(
          messageBytes,
          signatureBytes,
          publicKeyBytes
        );

        if (!result) {
          throw new Error("User can not be authenticated");
        }

        if (credentials.ref != "undefined") {
          const linkedReferralRef = db.ref(
            `users/${credentials.publicKey}/linkedReferral`
          );
          const linkedReferral = (await linkedReferralRef.get()).val();

          if (!linkedReferral) {
            linkedReferralRef.set(credentials.ref);
          }

          const referralRef = db.ref(
            `ref/${credentials.ref}/users/${new Date().getTime()}`
          );
          referralRef.set(credentials.publicKey);
        }

        const user: any = {
          name: credentials.publicKey,
        };

        return user;
      },
      credentials: {
        publicKey: { label: "publicKey", type: "text" },
        signature: { label: "signature", type: "text" },
        ref: { label: "ref", type: "text" },
      },
    }),
  ],
};

export default withSentry(async function auth(
  req: NextApiRequest,
  res: NextApiResponse
) {
  request = req;

  return await NextAuth(req, res, authOptions);
});
