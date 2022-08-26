const serviceAccount = require("./serviceAccountKey.json");
import admin from "firebase-admin";

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://howlies-acff9-default-rtdb.firebaseio.com",
  });
} catch (err) {}

export const db = admin.database();
