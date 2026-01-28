import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBo4RX1R4zE5LwGNHKXaiCi480A1IQy1q0",
  authDomain: "jim-s-jim.firebaseapp.com",
  projectId: "jim-s-jim",
  storageBucket: "jim-s-jim.firebasestorage.app",
  messagingSenderId: "430936043822",
  appId: "1:430936043822:web:69f478029e220c19138abf"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
