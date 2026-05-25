import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDqfjnOfgyUs4tbx2saWFTPHDhRaf-aMcc",
  authDomain: "mantenimiento-casa.firebaseapp.com",
  projectId: "mantenimiento-casa",
  storageBucket: "mantenimiento-casa.firebasestorage.app",
  messagingSenderId: "76148932265",
  appId: "1:76148932265:web:a54b256c896b660de8f3b8"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export default app
