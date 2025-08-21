// hooks/useUserData.ts

import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, increment, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Make sure this uses 'db' if you named it that
import { useAuth } from '../context/AuthContext';
import { isSameDay, subDays } from 'date-fns';

// Define the "shape" of the user data object for TypeScript
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

  // This effect sets up a LIVE listener to the user's document in Firestore
  useEffect(() => {
    if (!user) {
      setUserData(null);
      setLoading(false);
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    
    // onSnapshot creates the real-time listener.
    // Whenever the data changes on the server, this code automatically runs.
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setUserData(doc.data() as UserData);
      } else {
        // This can happen if the user document wasn't created on sign up
        console.log("No user data found in Firestore!");
      }
      setLoading(false);
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [user]); // Re-run this effect if the user logs in or out

  /**
   * Updates the user's daily progress and calculates their streak.
   * @param progressToAdd - The percentage to add to the daily progress (e.g., 25 for 25%).
   */
  const updateUserProgress = async (progressToAdd: number) => {
    if (!user || !userData) return;
    const userDocRef = doc(db, "users", user.uid);

    const today = new Date();
    // Convert Firestore Timestamp to a normal Date object, if it exists
    const lastCompletion = userData.lastCompletionDate?.toDate();
    const yesterday = subDays(today, 1);

    let newStreak = userData.streak;

    // Check if the last completion was yesterday to continue the streak
    if (lastCompletion && isSameDay(lastCompletion, yesterday)) {
        newStreak++;
    } 
    // If the last completion was not today or yesterday, the streak is broken.
    else if (!lastCompletion || !isSameDay(lastCompletion, today)) {
        newStreak = 1; // Start a new streak
    }
    // If last completion was today, the streak doesn't change.

    // Calculate the new progress, ensuring it doesn't go over 100
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
    const todayString = new Date().toISOString().split('T')[0]; // Format as "YYYY-MM-DD"
    const moodRef = doc(db, "users", user.uid, "moods", todayString);
    
    await setDoc(moodRef, {
        rating: rating,
        date: serverTimestamp(),
    });
  };

  // Return the data and functions for any component to use
  return { userData, loading, updateUserProgress, saveMoodRating };
};