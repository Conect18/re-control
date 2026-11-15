// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAqwD5-9HOUdUZFdMh2_idLh7IQbpKG_XQ",
  authDomain: "re-control-tacuarembo.firebaseapp.com",
  projectId: "re-control-tacuarembo",
  storageBucket: "re-control-tacuarembo.firebasestorage.app",
  messagingSenderId: "413345633868",
  appId: "1:413345633868:web:e9b2ffc881cea4566086e0"
};

// Inicializar Firebase (evitando duplicados en Next.js)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);