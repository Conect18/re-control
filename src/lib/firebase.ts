// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.AIzaSyAqwD5-9HOUdUZFdMh2_idLh7IQbpKG_XQ,
  authDomain: process.env.re-control-tacuarembo.firebaseapp.com,
  projectId: process.env."re-control-tacuarembo",
  storageBucket: process.env.re-control-tacuarembo.firebasestorage.app,
  messagingSenderId: process.env.413345633868,
  appId: process.env.1:413345633868:web:e9b2ffc881cea4566086e0
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);