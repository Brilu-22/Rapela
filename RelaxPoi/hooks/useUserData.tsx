import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, increment, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig'; 
import { useAuth } from '../context/AuthContext';
import { isSameDay, subDays } from 'date-fns';


type UserData = {
  username: string;
  email: string;
  streak: number;
  lastCompletionDate: Timestamp | null;
  dailyProgress: number;
};

export const useUserData = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    if (!user) {
      setUserData(null);
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    
    
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setUserData(doc.data() as UserData);
      } else {
        
        console.log("No user data found in Firestore!");
      }
      setLoading(false);
    });

    
    return () => unsubscribe();
  }, [user]); 

  /**
   * Updates the user's daily progress and calculates their streak.
   * @param progressToAdd - The percentage to add to the daily progress (e.g., 25 for 25%).
   */
  const updateUserProgress = async (progressToAdd: number) => {
    if (!user || !userData) return;
    const userDocRef = doc(db, "users", user.uid);

    const today = new Date();
    
    const lastCompletion = userData.lastCompletionDate?.toDate();
    const yesterday = subDays(today, 1);

    let newStreak = userData.streak;

   
    if (lastCompletion && isSameDay(lastCompletion, yesterday)) {
        newStreak++;
    } 
    
    else if (!lastCompletion || !isSameDay(lastCompletion, today)) {
        newStreak = 1; 
    }
    
    const newProgress = Math.min(100, userData.dailyProgress + progressToAdd);

    await updateDoc(userDocRef, {
        dailyProgress: newProgress,
        streak: newStreak,
        lastCompletionDate: serverTimestamp(),
    });
  };

  /**
   * Saves the user's mood rating for the current day.
   * @param rating - A number representing the user's mood (e.g., 1-5).
   */
  const saveMoodRating = async (rating: number) => {
    if (!user) return;
    const todayString = new Date().toISOString().split('T')[0]; 
    const moodRef = doc(db, "users", user.uid, "moods", todayString);
    
    await setDoc(moodRef, {
        rating: rating,
        date: serverTimestamp(),
    });
  };

  
  return { userData, loading, updateUserProgress, saveMoodRating };
};