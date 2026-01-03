import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  where
} from "firebase/firestore";
import { db } from "../firebase/config";

const COLLECTION_NAME = "surveys";
const DEFECT_TYPES_COLLECTION = "defectTypes";

export const surveyService = {
  // Add a new survey entry
  addSurvey: async (surveyData) => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...surveyData,
        createdAt: serverTimestamp(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error adding document: ", error);
      return { success: false, error: error.message };
    }
  },

  // Get all surveys
  getSurveys: async () => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting documents: ", error);
      throw error;
    }
  },

  // Real-time listener for surveys
  subscribeToSurveys: (callback) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"), limit(100));
    return onSnapshot(q, (snapshot) => {
      const surveys = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(surveys);
    });
  },

  // Get surveys filtered by date and line
  getSurveysByFilters: async (date, line) => {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("date", "==", date),
        where("line", "==", line),
        where("type", "==", "defect_survey")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error filtered getting surveys: ", error);
      throw error;
    }
  },

  // Get all defect surveys for dashboard analysis
  getDefectSurveys: async () => {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("type", "==", "defect_survey")
        // orderBy("date", "asc") // Removed to fix missing index issue, doing client-side sorting instead
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting defect surveys: ", error);
      throw error;
    }
  },

  // Defect Types management
  getDefectTypes: async () => {
    try {
      const q = query(collection(db, DEFECT_TYPES_COLLECTION), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting defect types: ", error);
      throw error;
    }
  },

  addDefectType: async (name, category = 1) => {
    try {
      const docRef = await addDoc(collection(db, DEFECT_TYPES_COLLECTION), {
        name,
        category,
        createdAt: serverTimestamp(),
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error adding defect type: ", error);
      return { success: false, error: error.message };
    }
  },

  // Real-time listener for defect types
  subscribeToDefectTypes: (callback) => {
    const q = query(collection(db, DEFECT_TYPES_COLLECTION), orderBy("name", "asc"));
    return onSnapshot(q, (snapshot) => {
      const types = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(types);
    });
  }
};
