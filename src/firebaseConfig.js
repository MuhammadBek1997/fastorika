import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyADtwNl3zuK1E-b89wVzDNgS8QVrtsmXwQ",
  authDomain: "fastorika-6cfff.firebaseapp.com",
  projectId: "fastorika-6cfff",
  storageBucket: "fastorika-6cfff.firebasestorage.app",
  messagingSenderId: "59274906960",
  appId: "1:59274906960:web:9ce1545d62b8c60e6fb055",
  measurementId: "G-W32P34NF3K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');