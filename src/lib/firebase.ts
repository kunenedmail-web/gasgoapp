
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, User } from "firebase/auth";

const firebaseConfig = {
    projectId: "gasfinder-34xs9",
    appId: "1:609067270058:web:2b01d2ce8d48d696f235d3",
    storageBucket: "gasfinder-34xs9.firebasestorage.app",
    apiKey: "AIzaSyBFM91lpzR6Ni8A-JgIirI2hBQsV51cL-8",
    authDomain: "gasfinder-34xs9.firebaseapp.com",
    messagingSenderId: "609067270058"
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
