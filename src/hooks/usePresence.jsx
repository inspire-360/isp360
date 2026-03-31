import { useEffect } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";

function buildPresenceIdentity(identity, fallbackRole = "learner") {
  if (!identity) {
    return null;
  }

  if (typeof identity === "string") {
    return {
      uid: identity,
      name: "ผู้ใช้งาน",
      photoURL: "",
      role: fallbackRole,
    };
  }

  return {
    uid: identity.uid,
    name:
      identity.name ||
      identity.displayName ||
      identity.email?.split("@")[0] ||
      "ผู้ใช้งาน",
    photoURL: identity.photoURL || "",
    role: identity.role || fallbackRole,
  };
}

export async function writePresence(identity, isOnline, fallbackRole = "learner") {
  const normalizedIdentity = buildPresenceIdentity(identity, fallbackRole);
  const userId = normalizedIdentity?.uid;

  if (!userId) {
    return;
  }

  await setDoc(
    doc(db, "presence", userId),
    {
      uid: userId,
      name: normalizedIdentity.name,
      photoURL: normalizedIdentity.photoURL,
      role: normalizedIdentity.role,
      isOnline,
      lastSeen: serverTimestamp(),
    },
    { merge: true },
  );
}

export function usePresence(profile = null) {
  const { currentUser, userRole } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      return undefined;
    }

    const presenceIdentity = {
      uid: currentUser.uid,
      displayName: currentUser.displayName,
      email: currentUser.email,
      photoURL: profile?.photoURL || currentUser.photoURL || "",
      role: profile?.role || userRole || "learner",
      name:
        profile?.name ||
        currentUser.displayName ||
        currentUser.email?.split("@")[0] ||
        "ผู้ใช้งาน",
    };

    const markOnline = () =>
      writePresence(presenceIdentity, true, userRole || "learner").catch((error) => {
        console.error("Error updating presence:", error);
      });

    const markOffline = () =>
      writePresence(presenceIdentity, false, userRole || "learner").catch((error) => {
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
  }, [currentUser, profile?.name, profile?.photoURL, profile?.role, userRole]);
}
