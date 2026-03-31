import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext();

function buildSeedProfile(user) {
  return {
    uid: user.uid,
    email: user.email || "",
    role: "learner",
    name: user.displayName || user.email?.split("@")[0] || "ผู้ใช้",
    photoURL: user.photoURL || "",
    badges: [],
    lastLogin: serverTimestamp(),
    createdAt: serverTimestamp(),
    pdpaAccepted: true,
  };
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUserDoc = () => {};

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribeUserDoc();

      if (user) {
        setCurrentUser(user);
        const userRef = doc(db, "users", user.uid);

        unsubscribeUserDoc = onSnapshot(
          userRef,
          async (docSnapshot) => {
            if (!docSnapshot.exists()) {
              try {
                await setDoc(userRef, buildSeedProfile(user), { merge: true });
              } catch (seedError) {
                console.error("Error seeding user profile:", seedError);
              }

              setUserRole("learner");
              setLoading(false);
              return;
            }

            setUserRole(docSnapshot.data().role || "learner");
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching user role:", error);
            setUserRole("learner");
            setLoading(false);
          },
        );
        return;
      }

      setCurrentUser(null);
      setUserRole(null);
      setLoading(false);
    });

    return () => {
      unsubscribeUserDoc();
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    userRole,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
