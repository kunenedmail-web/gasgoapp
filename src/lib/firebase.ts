
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, User } from "firebase/auth";
import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp, Timestamp, orderBy, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAJPu4f5oOsfxbxk0NaYAKhcgZrq58kGys",
    authDomain: "gasfinder-34xs9.firebaseapp.com",
    projectId: "gasfinder-34xs9",
    storageBucket: "gasfinder-34xs9.appspot.com",
    messagingSenderId: "84706598336",
    appId: "1:84706598336:web:6c09bb1a8c9b312788e0e3",
    measurementId: "G-8L5Z697G95"
};


// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Generic function to get user role
const getUserRole = async (userId: string): Promise<string | null> => {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        return userDoc.data().role || null;
    }
    return null;
}

// Sign up for customers
const signUpWithEmail = async (name: string, surname: string, email: string, password: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await updateProfile(user, {
    displayName: `${name} ${surname}`
  });
  // Add user to the 'users' collection with a role
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    displayName: `${name} ${surname}`,
    role: 'customer'
  });
  return user;
}

// Sign up for drivers
const signUpAsDriver = async (name: string, surname: string, email: string, password: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await updateProfile(user, {
    displayName: `${name} ${surname}`
  });
  // Add user to the 'users' collection with a role
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    displayName: `${name} ${surname}`,
    role: 'driver'
  });
  return user;
};


// Sign in for customers
const signInAsCustomer = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const role = await getUserRole(userCredential.user.uid);
    if (role !== 'customer') {
        await signOut(auth);
        throw new Error("This account is not a customer account.");
    }
    return userCredential.user;
};

// Sign in for drivers
const signInAsDriver = async (email: string, password: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const role = await getUserRole(userCredential.user.uid);
    if (role !== 'driver') {
        await signOut(auth);
        throw new Error("Access denied. Not a driver account.");
    }
    return userCredential.user;
};

const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out", error);
    }
}

export interface OrderItem {
  id: string;
  label: string;
  quantity: number;
  price: number;
}

export interface Order {
  id?: string;
  userId: string;
  address: string;
  entityType: string;
  companyName?: string;
  items: OrderItem[];
  totalCost: number;
  paymentMethod: string;
  createdAt: Timestamp;
}


const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>) => {
  try {
    await addDoc(collection(db, "orders"), {
      ...orderData,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding document: ", error);
    throw new Error("Could not save order.");
  }
};

const getUserOrders = async (userId: string): Promise<Order[]> => {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
    
    try {
        const querySnapshot = await getDocs(q);
        const orders: Order[] = [];
        querySnapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() } as Order);
        });
        return orders;
    } catch (error) {
        console.error("Firestore query failed: ", error);
        throw error;
    }
}

const getAllOrders = async (): Promise<Order[]> => {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc")); 
    
    try {
        const querySnapshot = await getDocs(q);
        const orders: Order[] = [];
        querySnapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() } as Order);
        });
        return orders;
    } catch (error) {
        console.error("Firestore query failed: ", error);
        throw error;
    }
};

export { auth, db, signUpWithEmail, signUpAsDriver, signInAsCustomer, signInAsDriver, logout, addOrder, getUserOrders, getAllOrders };
