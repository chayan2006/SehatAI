import { db } from './firebaseConfig';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc, 
  deleteDoc,
  getDoc
} from 'firebase/firestore';

export const firebaseService = {
  // Example: Add a new document to a collection
  async addDocument(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id, ...data };
    } catch (e) {
      console.error("Error adding document: ", e);
      throw e;
    }
  },

  // Example: Get all documents from a collection
  async getAllDocuments(collectionName) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (e) {
      console.error("Error getting documents: ", e);
      throw e;
    }
  },

  // Example: Get a single document by ID
  async getDocumentById(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (e) {
      console.error("Error getting document: ", e);
      throw e;
    }
  }
};
