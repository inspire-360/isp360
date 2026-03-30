import { useEffect } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";

export async function writePresence(userId, isOnline) {
  if (!userId) {
    return;
  }

  await setDoc(
    doc(db, "users", userId),
    {
      isOnline,
      lastSeen: serverTimestamp(),
    },
    { merge: true },
  );
}

export function usePresence() {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      return undefined;
    }

    const userId = currentUser.uid;

    const markOnline = () =>
      writePresence(userId, true).catch((error) => {
        console.error("Error updating presence:", error);
      });

    const markOffline = () =>
      writePresence(userId, false).catch((error) => {
        console.error("Error updating presence:", error);
      });

    const syncPresence = () => {
      if (document.visibilityState === "visible") {
        markOnline();
        return;
      }

      markOffline();
    };

    markOnline();
    syncPresence();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        markOnline();
      }
    }, 45000);

    document.addEventListener("visibilitychange", syncPresence);
    window.addEventListener("focus", markOnline);
    window.addEventListener("blur", syncPresence);
    window.addEventListener("online", markOnline);
    window.addEventListener("offline", markOffline);
    window.addEventListener("pagehide", markOffline);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", syncPresence);
      window.removeEventListener("focus", markOnline);
      window.removeEventListener("blur", syncPresence);
      window.removeEventListener("online", markOnline);
      window.removeEventListener("offline", markOffline);
      window.removeEventListener("pagehide", markOffline);
      markOffline();
    };
  }, [currentUser]);
}
