
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, User } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyD2Ik3W39j774mLpFjFLiig9t-4sgk-sRI",
    authDomain: "gasgo-466918.firebaseapp.com",
    projectId: "gasgo-466918",
    storageBucket: "gasgo-466918.appspot.com",
    messagingSenderId: "153257774518",
    appId: "1:153257774518:web:8f20f44c8182f2751e8517",
    measurementId: "G-1SPBSR3WDS"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const signUpWithEmail = async (name: string, surname: string, email: string, password: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, {
    displayName: `${name} ${surname}`
  });
  return userCredential.user;
}

const signInWithEmail = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out", error);
    }
}

export { auth, signUpWithEmail, signInWithEmail, logout };
