import { withSentry } from "@sentry/nextjs";
import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import holderCount from "./_output.json";

export default withSentry(async (req, res) => {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401);
  }

  const publicKey = session.user.name;

  return res.json({ amountHeld: holderCount[publicKey] || 0 });
});
