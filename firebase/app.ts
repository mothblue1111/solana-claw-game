import { getApps, initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDQoP2W3MFnceP70RZJ5vWGI91U6kqoJko",
  authDomain: "howlies-acff9.firebaseapp.com",
  databaseURL: "https://howlies-acff9-default-rtdb.firebaseio.com",
  projectId: "howlies-acff9",
  storageBucket: "howlies-acff9.appspot.com",
  messagingSenderId: "856084701593",
  appId: "1:856084701593:web:82c6000093753f0226f308"
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export const clientDb = getDatabase();
