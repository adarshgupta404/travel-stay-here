"use client";

import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { getUser, registerUser } from "../actions/user";
import { useRouter } from "next/navigation";

interface AuthUser extends User {
  _id?: string; // Add MongoDB ID
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userFromDb = await getUser(firebaseUser.email!);
          setUser({
            _id: userFromDb.userId,
            ...firebaseUser,
          });
        } catch (error) {
          console.error("Error fetching user from DB:", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userFromDb = await getUser(email);

      const authUser: AuthUser = {
        _id: userFromDb.userId,
        ...result.user,
      };

      setUser(authUser);
      return authUser;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Update Firebase user profile with the name
      await updateProfile(result.user, { displayName: name });
      // Register user in MongoDB
      const register = await registerUser({
        name,
        email,
        password,
      });

      if (register.success) {
        setUser({
          _id: register.userId, // Store MongoDB ID after registration
          ...result.user,
          displayName: name, // Ensure name is set
        });
      }

      return register.success;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      router.push("/")
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
