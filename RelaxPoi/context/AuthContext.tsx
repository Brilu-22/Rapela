import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../firebaseConfig'; 

// Define the shape of the context data with updated signUp signature
interface AuthContextType {
  user: User | null;
  loading: boolean;
  // Updated to accept username
  signUp: (email: string, password: string, username: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  loginAnonymously: () => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // REWRITTEN SIGNUP FUNCTION
  const signUp = async (email: string, password: string, username: string) => {
    // 1. Create the user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // 2. Update their Firebase Auth profile to include the displayName
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: username,
      });
    }
    
    // Return the user credential object
    return userCredential;
  };

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };
  
  const loginAnonymously = () => {
    return signInAnonymously(auth);
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    user,
    loading,
    signUp,
    login,
    loginAnonymously,
    logout,
  };

  // Render children only when not loading
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily use the auth context in other components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};