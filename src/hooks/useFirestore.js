import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

// Hook to subscribe to a Firestore collection in real-time.
// If the ordered query fails (e.g. missing index or field), it automatically
// falls back to an unordered snapshot so charts never go blank.
export const useCollection = (collectionName, orderByField = 'createdAt', orderDirection = 'desc') => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Primary: ordered query
    const orderedQuery = query(
      collection(db, collectionName),
      orderBy(orderByField, orderDirection)
    );

    let unsubscribeFallback = null;

    const unsubscribeOrdered = onSnapshot(
      orderedQuery,
      (snapshot) => {
        const results = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setData(results);
        setLoading(false);
        setError(null);
      },
      (err) => {
        // The ordered query failed — most likely a missing index or the field
        // doesn't exist on any document yet. Fall back to an unordered snapshot
        // so the UI still receives live data.
        console.warn(
          `[useCollection] Ordered query on "${collectionName}" by "${orderByField}" failed: ${err.message}. Falling back to unordered snapshot.`
        );

        const fallbackQuery = collection(db, collectionName);
        unsubscribeFallback = onSnapshot(
          fallbackQuery,
          (snapshot) => {
            const results = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            // Sort client-side if possible
            results.sort((a, b) => {
              const aVal = a[orderByField];
              const bVal = b[orderByField];
              if (aVal == null && bVal == null) return 0;
              if (aVal == null) return 1;
              if (bVal == null) return -1;
              // Handle Firestore Timestamps
              const aTime = aVal?.toMillis ? aVal.toMillis() : aVal;
              const bTime = bVal?.toMillis ? bVal.toMillis() : bVal;
              return orderDirection === 'desc' ? bTime - aTime : aTime - bTime;
            });
            setData(results);
            setLoading(false);
            setError(null);
          },
          (fallbackErr) => {
            console.error(`[useCollection] Fallback query on "${collectionName}" also failed:`, fallbackErr);
            setError(fallbackErr.message);
            setLoading(false);
          }
        );
      }
    );

    return () => {
      unsubscribeOrdered();
      if (unsubscribeFallback) unsubscribeFallback();
    };
  }, [collectionName, orderByField, orderDirection]);

  return { data, loading, error };
};

// Generic CRUD operations
export const useFirestore = (collectionName) => {
  const { user, userProfile } = useAuth();
  
  const addDocument = async (docData) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...docData,
        createdAt: serverTimestamp(),
        createdBy: user?.uid || 'system',
        createdByName: userProfile?.displayName || user?.email || 'system'
      });
      
      // Optionally log the activity
      if (collectionName !== 'activityLogs') {
        await logActivity(`Added document to ${collectionName}`, docRef.id);
      }
      return docRef;
    } catch (err) {
      console.error(`Error adding to ${collectionName}:`, err);
      throw err;
    }
  };

  const updateDocument = async (id, docData) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...docData,
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid || 'system'
      });
      
      if (collectionName !== 'activityLogs') {
        await logActivity(`Updated document in ${collectionName}`, id);
      }
    } catch (err) {
      console.error(`Error updating ${collectionName}:`, err);
      throw err;
    }
  };

  const deleteDocument = async (id) => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      
      if (collectionName !== 'activityLogs') {
        await logActivity(`Deleted document from ${collectionName}`, id);
      }
    } catch (err) {
      console.error(`Error deleting from ${collectionName}:`, err);
      throw err;
    }
  };

  const logActivity = async (action, recordId) => {
    try {
      await addDoc(collection(db, 'activityLogs'), {
        action,
        recordId,
        collection: collectionName,
        user: userProfile?.displayName || user?.email || 'system',
        userId: user?.uid || 'system',
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  };

  return { addDocument, updateDocument, deleteDocument };
};
