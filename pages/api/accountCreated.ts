import { unstable_getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { db } from "../../firebase/admin";
import { withSentry } from "@sentry/nextjs";

export default withSentry(async (req, res) => {
  const session = await unstable_getServerSession(req, res, authOptions);

  const userRef = db.ref(`users/${session.user.name}/account`);

  const body = JSON.parse(req.body);
  await userRef.set(body.tx);

  res.status(200).json({
    message: "Account created",
  });
});
