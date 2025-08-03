// Firebase Realtime Database Module for Texas College Futsal Booking System
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, child, push, update, remove, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBnnZgj-oP4V0MA88p4c_q6b9uGtkdxJmA",
  authDomain: "texas-futsal-booking.firebaseapp.com",
  databaseURL: "https://texas-futsal-booking-default-rtdb.firebaseio.com",
  projectId: "texas-futsal-booking",
  storageBucket: "texas-futsal-booking.appspot.com",
  messagingSenderId: "1048971899774",
  appId: "1:1048971899774:web:adee5411e4102ee364392f",
  measurementId: "G-7X5M15GXTT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

console.log('🔥 Firebase Realtime Database initialized successfully');

// Student Management Functions
export async function registerStudent(student) {
  try {
    const studentRef = ref(database, 'students/' + student.studentId);
    await set(studentRef, {
      name: student.name,
      program: student.program,
      password: student.password,
      email: student.email,
      phone: student.phone,
      registeredDate: student.registeredDate,
      status: student.status || 'active',
      banHistory: student.banHistory || []
    });
    console.log('✅ Student registered successfully:', student.studentId);
    return { success: true, studentId: student.studentId };
  } catch (error) {
    console.error('❌ Error registering student:', error);
    return { success: false, error: error.message };
  }
}

export async function getAllStudents() {
  try {
    const snapshot = await get(child(ref(database), 'students'));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return {};
    }
  } catch (error) {
    console.error('❌ Error getting students:', error);
    return {};
  }
}

export async function getStudent(studentId) {
  try {
    const snapshot = await get(child(ref(database), `students/${studentId}`));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting student:', error);
    return null;
  }
}

export async function updateStudent(studentId, updates) {
  try {
    const studentRef = ref(database, `students/${studentId}`);
    await update(studentRef, updates);
    console.log('✅ Student updated successfully:', studentId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating student:', error);
    return { success: false, error: error.message };
  }
}

export async function banStudent(studentId, reason = '', duration = '') {
  try {
    const updates = {
      status: 'banned',
      banReason: reason,
      banDuration: duration,
      banDate: new Date().toISOString()
    };
    return await updateStudent(studentId, updates);
  } catch (error) {
    console.error('❌ Error banning student:', error);
    return { success: false, error: error.message };
  }
}

export async function unbanStudent(studentId) {
  try {
    const updates = {
      status: 'active',
      banReason: null,
      banDuration: null,
      banDate: null
    };
    return await updateStudent(studentId, updates);
  } catch (error) {
    console.error('❌ Error unbanning student:', error);
    return { success: false, error: error.message };
  }
}

// Booking Management Functions
export async function createBooking(booking) {
  try {
    const bookingRef = ref(database, 'bookings');
    const newBookingRef = push(bookingRef);
    const bookingId = newBookingRef.key;
    
    await set(newBookingRef, {
      bookingId: bookingId,
      studentId: booking.studentId,
      studentName: booking.studentName,
      date: booking.date,
      time: booking.time,
      teamName: booking.teamName,
      phone: booking.phone,
      status: booking.status || 'confirmed',
      bookingDate: new Date().toISOString()
    });
    
    console.log('✅ Booking created successfully:', bookingId);
    return { success: true, bookingId: bookingId };
  } catch (error) {
    console.error('❌ Error creating booking:', error);
    return { success: false, error: error.message };
  }
}

export async function getAllBookings() {
  try {
    const snapshot = await get(child(ref(database), 'bookings'));
    if (snapshot.exists()) {
      const bookings = [];
      snapshot.forEach((childSnapshot) => {
        bookings.push(childSnapshot.val());
      });
      return bookings;
    } else {
      return [];
    }
  } catch (error) {
    console.error('❌ Error getting bookings:', error);
    return [];
  }
}

export async function getBookingsByStudent(studentId) {
  try {
    const bookingsRef = ref(database, 'bookings');
    const studentBookingsQuery = query(bookingsRef, orderByChild('studentId'), equalTo(studentId));
    const snapshot = await get(studentBookingsQuery);
    
    if (snapshot.exists()) {
      const bookings = [];
      snapshot.forEach((childSnapshot) => {
        bookings.push(childSnapshot.val());
      });
      return bookings;
    } else {
      return [];
    }
  } catch (error) {
    console.error('❌ Error getting student bookings:', error);
    return [];
  }
}

export async function getBookingsByDate(date) {
  try {
    const bookingsRef = ref(database, 'bookings');
    const dateBookingsQuery = query(bookingsRef, orderByChild('date'), equalTo(date));
    const snapshot = await get(dateBookingsQuery);
    
    if (snapshot.exists()) {
      const bookings = [];
      snapshot.forEach((childSnapshot) => {
        bookings.push(childSnapshot.val());
      });
      return bookings;
    } else {
      return [];
    }
  } catch (error) {
    console.error('❌ Error getting date bookings:', error);
    return [];
  }
}

export async function updateBooking(bookingId, updates) {
  try {
    const bookingRef = ref(database, `bookings/${bookingId}`);
    await update(bookingRef, updates);
    console.log('✅ Booking updated successfully:', bookingId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating booking:', error);
    return { success: false, error: error.message };
  }
}

export async function cancelBooking(bookingId) {
  try {
    const updates = {
      status: 'cancelled',
      cancelledDate: new Date().toISOString()
    };
    return await updateBooking(bookingId, updates);
  } catch (error) {
    console.error('❌ Error cancelling booking:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteBooking(bookingId) {
  try {
    const bookingRef = ref(database, `bookings/${bookingId}`);
    await remove(bookingRef);
    console.log('✅ Booking deleted successfully:', bookingId);
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting booking:', error);
    return { success: false, error: error.message };
  }
}

// Admin Management Functions
export async function createAdmin(admin) {
  try {
    const adminRef = ref(database, 'admins/' + admin.username);
    await set(adminRef, {
      username: admin.username,
      password: admin.password,
      role: admin.role || 'admin',
      createdDate: new Date().toISOString()
    });
    console.log('✅ Admin created successfully:', admin.username);
    return { success: true };
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    return { success: false, error: error.message };
  }
}

export async function validateAdmin(username, password) {
  try {
    const snapshot = await get(child(ref(database), `admins/${username}`));
    if (snapshot.exists()) {
      const admin = snapshot.val();
      return admin.password === password;
    } else {
      return false;
    }
  } catch (error) {
    console.error('❌ Error validating admin:', error);
    return false;
  }
}

// Statistics Functions
export async function getStatistics() {
  try {
    const students = await getAllStudents();
    const bookings = await getAllBookings();
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = await getBookingsByDate(today);
    
    const activeStudents = Object.values(students).filter(s => s.status === 'active').length;
    const bannedStudents = Object.values(students).filter(s => s.status === 'banned').length;
    
    return {
      totalStudents: Object.keys(students).length,
      totalBookings: bookings.length,
      todayBookings: todayBookings.length,
      activeStudents: activeStudents,
      bannedStudents: bannedStudents
    };
  } catch (error) {
    console.error('❌ Error getting statistics:', error);
    return {
      totalStudents: 0,
      totalBookings: 0,
      todayBookings: 0,
      activeStudents: 0,
      bannedStudents: 0
    };
  }
}

// Security Logging
export async function logSecurityEvent(event, details) {
  try {
    const logRef = ref(database, 'securityLogs');
    const newLogRef = push(logRef);
    
    await set(newLogRef, {
      event: event,
      details: details,
      timestamp: new Date().toISOString(),
      user: 'system',
      ip: 'web'
    });
    
    console.log('🔒 Security event logged:', event);
  } catch (error) {
    console.error('❌ Error logging security event:', error);
  }
}

// Initialize default data
export async function initializeFirebaseData() {
  try {
    // Check if data already exists
    const students = await getAllStudents();
    if (Object.keys(students).length === 0) {
      console.log('📊 Initializing Firebase with default data...');
      
      // Add default students
      const defaultStudents = [
        {
          studentId: 'TIC001',
          name: 'Manish Karki',
          program: 'BSc. CSIT',
          password: 'student123',
          email: 'manish.karki@texasintl.edu.np',
          phone: '9801234567',
          registeredDate: '2024-01-15',
          status: 'active'
        },
        {
          studentId: 'TIC002',
          name: 'Subarna Karki',
          program: 'BBM',
          password: 'student123',
          email: 'subarna.karki@texasintl.edu.np',
          phone: '9801234568',
          registeredDate: '2024-01-16',
          status: 'active'
        }
      ];
      
      for (const student of defaultStudents) {
        await registerStudent(student);
      }
      
      // Add default admin
      await createAdmin({
        username: 'texas',
        password: '@@Texas@@123#',
        role: 'super_admin'
      });
      
      console.log('✅ Firebase data initialized successfully');
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase data:', error);
  }
}

// Export database instance for compatibility
export { database }; 