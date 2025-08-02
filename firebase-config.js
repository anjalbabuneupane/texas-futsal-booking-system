// Firebase Configuration for Texas College Futsal Booking System
const firebaseConfig = {
  apiKey: "AIzaSyBnnZgj-oP4V0MA88p4c_q6b9uGtkdxJmA",
  authDomain: "texas-futsal-booking.firebaseapp.com",
  projectId: "texas-futsal-booking",
  storageBucket: "texas-futsal-booking.appspot.com",
  messagingSenderId: "1048971899774",
  appId: "1:1048971899774:web:adee5411e4102ee364392f",
  measurementId: "G-7X5M15GXTT"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

console.log('🔥 Firebase initialized successfully');
console.log('📊 Database ready for worldwide real-time access'); 