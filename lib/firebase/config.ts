"use client"

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyArODhmkcHrjYJKJz80jKqcMUK_vw3YEHE",
  authDomain: "bajaj-fd278.firebaseapp.com",
  projectId: "bajaj-fd278",
  storageBucket: "bajaj-fd278.firebasestorage.app",
  messagingSenderId: "57680492076",
  appId: "1:57680492076:web:9f29612e920fc8f6388389",
  measurementId: "G-N2GJMKDLY9"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Initialize Analytics only on client side and when supported
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then(yes => yes && (analytics = getAnalytics(app)));
}

export { app, auth, analytics }; 