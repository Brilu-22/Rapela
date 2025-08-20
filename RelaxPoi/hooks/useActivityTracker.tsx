import { useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';

// Helper to get today's date string (e.g., "2025-08-17")
const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Define the names of the activities we want to track
export type ActivityName = 'journal' | 'breathing' | 'zenslide' | 'videoDiary' | 'game' | 'starlightTap' | 'willowispMaze';

export const useActivityTracker = (activityName: ActivityName) => {
  const { user } = useAuth();
  const startTimeRef = useRef<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      // --- SCREEN IS FOCUSED ---
      // Record the time when the user enters the screen
      startTimeRef.current = Date.now();

      // --- SCREEN IS UNFOCUSED ---
      // This function is called when the user leaves the screen
      return () => {
        if (!user || !startTimeRef.current) return;

        // Calculate how long the user was on the screen
        const endTime = Date.now();
        const durationSeconds = Math.round((endTime - startTimeRef.current) / 1000);
        startTimeRef.current = null; // Reset for next time

        // We only save if they spent a meaningful amount of time (e.g., > 10 seconds)
        if (durationSeconds > 10) {
          const todayString = getTodayDateString();
          const activityDocRef = doc(db, 'users', user.uid, 'dailyActivities', todayString);
          
          const updateActivityTime = async () => {
            try {
              const docSnap = await getDoc(activityDocRef);
              const currentDuration = docSnap.exists() ? (docSnap.data()[activityName] || 0) : 0;

              // Add the new duration to the existing total for that activity
              await setDoc(activityDocRef, {
                [activityName]: currentDuration + durationSeconds,
                lastUpdated: serverTimestamp(),
              }, { merge: true }); // Merge ensures we don't overwrite other activities
              
              console.log(`Tracked ${durationSeconds}s for ${activityName}`);

            } catch (error) {
              console.error("Failed to track activity: ", error);
            }
          };

          updateActivityTime();
        }
      };
    }, [user, activityName])
  );
};