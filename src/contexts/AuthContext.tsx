"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut as fbSignOut, type User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseAuth, getGoogleProvider, getFirebaseDb } from "@/lib/firebase";

interface AuthState {
  user: User | null;
  loading: boolean;
  isAscended: boolean;
  isNewUser: boolean | null;
  emailSent: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const VAULT_URL = "https://external-stems-vault.com";

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  isAscended: false,
  isNewUser: null,
  emailSent: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAscended, setIsAscended] = useState(false);
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (u) => {
      setUser(u);
      if (u) {
        try {
          const snap = await getDoc(doc(getFirebaseDb(), "users", u.uid));
          setIsAscended(snap.exists() && snap.data()?.isAscended === true);
        } catch (err: unknown) {
          const code = (err as { code?: string })?.code ?? "unknown";
          console.error(`[Auth] Failed to check ascension status — code: ${code}`, err);
          setIsAscended(false);
        }
      } else {
        setIsAscended(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    const provider = getGoogleProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const u = result?.user;
      if (!u || !u.uid) {
        console.error("[Auth] Google sign-in returned no user object");
        return;
      }
      console.log("[Auth] Sign-in success:", u.uid, u.email);

      // Check if this is a new or returning user
      const db = getFirebaseDb();
      const userRef = doc(db, "users", u.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // NEW USER — create record and send vault email
        setIsNewUser(true);
        await setDoc(userRef, {
          email: u.email,
          displayName: u.displayName,
          createdAt: serverTimestamp(),
          isAscended: false,
        });

        try {
          await fetch("/api/send-vault-access", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: u.email,
              name: u.displayName || "",
            }),
          });
          setEmailSent(true);
          console.log("[Auth] Vault access email dispatched to", u.email);
        } catch (emailErr) {
          console.error("[Auth] Failed to send vault email:", emailErr);
        }
      } else {
        // RETURNING USER — redirect to vault
        setIsNewUser(false);
        window.location.href = VAULT_URL;
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "unknown";
      const message = (err as { message?: string })?.message ?? "";
      console.error(`[Auth] Google sign-in failed — code: ${code}, message: ${message}`);
      if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request") {
        console.warn("[Auth] Popup blocked — falling back to redirect");
        await signInWithRedirect(auth, provider);
        return;
      }
      if (code === "auth/unauthorized-domain") {
        console.error(
          "[Auth] Add this domain to Firebase Console > Authentication > Settings > Authorized domains"
        );
      } else if (code === "auth/popup-closed-by-user") {
        console.warn("[Auth] User closed the popup before completing sign-in");
      }
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fbSignOut(getFirebaseAuth());
    } catch (err) {
      console.error("[Auth] Sign-out failed:", err);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAscended, isNewUser, emailSent, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
