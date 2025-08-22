import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../firebaseConfig'; 


interface AuthContextType {
  user: User | null;
  loading: boolean;
  
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

 
  const signUp = async (email: string, password: string, username: string) => {
   
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName: username,
      });
    }
    
    
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

  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};