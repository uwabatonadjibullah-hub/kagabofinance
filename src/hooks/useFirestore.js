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

// Hook to subscribe to a collection
export const useCollection = (collectionName, orderByField = 'createdAt', orderDirection = 'desc') => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, collectionName), orderBy(orderByField, orderDirection));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const results = [];
        snapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() });
        });
        setData(results);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Error fetching ${collectionName}:`, err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
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
