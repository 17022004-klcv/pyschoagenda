import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA0QIAjXbQjSBmMx47Y5fzl5jj5Tazc17I",
  authDomain: "pyschoagenda.firebaseapp.com",
  projectId: "pyschoagenda",
  storageBucket: "pyschoagenda.firebasestorage.app",
  messagingSenderId: "230969284593",
  appId: "1:230969284593:web:8fd6a4a3f5e804099a9650",
  measurementId: "G-3WJCBCJSNY",
};
// Evita re-inicializar Firebase si ya se creó la app previamente
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Exportamos los servicios que usaremos en la app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
