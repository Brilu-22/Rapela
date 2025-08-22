import { useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';

// This is for getting the Date string 
const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};


export type ActivityName = 'journal' | 'breathing' | 'zenslide' | 'videoDiary' | 'game' | 'starlightTap' | 'willowispMaze';

export const useActivityTracker = (activityName: ActivityName) => {
  const { user } = useAuth();
  const startTimeRef = useRef<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      
      startTimeRef.current = Date.now();

      
      return () => {
        if (!user || !startTimeRef.current) return;

        
        const endTime = Date.now();
        const durationSeconds = Math.round((endTime - startTimeRef.current) / 1000);
        startTimeRef.current = null; 

        
        if (durationSeconds > 10) {
          const todayString = getTodayDateString();
          const activityDocRef = doc(db, 'users', user.uid, 'dailyActivities', todayString);
          
          const updateActivityTime = async () => {
            try {
              const docSnap = await getDoc(activityDocRef);
              const currentDuration = docSnap.exists() ? (docSnap.data()[activityName] || 0) : 0;

              
              await setDoc(activityDocRef, {
                [activityName]: currentDuration + durationSeconds,
                lastUpdated: serverTimestamp(),
              }, { merge: true }); 
              
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