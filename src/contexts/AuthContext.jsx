import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext();

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
        unsubscribeUserDoc = onSnapshot(
          doc(db, "users", user.uid),
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              setUserRole(docSnapshot.data().role || "learner");
            } else {
              setUserRole("learner");
            }

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
