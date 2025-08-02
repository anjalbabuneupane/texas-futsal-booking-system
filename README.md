# Texas International College Futsal Booking System

A comprehensive futsal booking system for Texas International College students, built with Firebase and modern web technologies.

## 🌟 Features

- **Student Portal**: Students can login and book futsal sessions
- **Admin Dashboard**: Complete administrative control panel
- **Real-time Database**: Firebase Firestore for data persistence
- **Security**: Enhanced security with encryption and access controls
- **Responsive Design**: Works on all devices
- **Booking Management**: Easy booking interface with time slot selection

## 🚀 Live Application

**Access the live application at:** https://texas-futsal-booking.web.app

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Database**: Firebase Firestore
- **Hosting**: Firebase Hosting
- **Authentication**: Firebase Auth (custom implementation)
- **Security**: XOR encryption + Base64 encoding

## 📋 Prerequisites

- Node.js (for Firebase CLI)
- Firebase CLI (`npm install -g firebase-tools`)
- Google account with Firebase project access

## 🔧 Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "college futsal boking  copy2"
```

### 2. Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### 3. Login to Firebase
```bash
firebase login
```

### 4. Initialize Firebase Project
```bash
firebase init hosting
# Select existing project: texas-futsal-booking
```

### 5. Deploy to Firebase
```bash
# Deploy hosting
firebase deploy --only hosting

# Deploy Firestore rules and indexes
firebase deploy --only firestore
```

## 🗄️ Database Structure

### Collections

#### Students Collection
```javascript
{
  "studentId": "TIC001",
  "name": "Manish Karki",
  "program": "BSc. CSIT",
  "password": "encrypted_password",
  "email": "manish.karki@texasintl.edu.np",
  "phone": "9801234567",
  "registeredDate": "2024-01-15",
  "status": "active",
  "banHistory": []
}
```

#### Bookings Collection
```javascript
{
  "bookingId": "BK001",
  "studentId": "TIC001",
  "studentName": "Manish Karki",
  "date": "2024-08-02",
  "time": "18:15",
  "team": "CSIT Warriors",
  "phone": "9801234567",
  "status": "confirmed",
  "bookingDate": "2024-08-01T10:30:00Z"
}
```

#### Admin Collection
```javascript
{
  "username": "texas",
  "password": "admin123",
  "lastUpdated": "2024-08-01T10:30:00Z"
}
```

#### Security Logs Collection
```javascript
{
  "event": "student_login",
  "details": "Student TIC001 logged in successfully",
  "timestamp": "2024-08-01T10:30:00Z",
  "user": "TIC001",
  "ip": "web"
}
```

## 🔐 Security Features

- **Data Encryption**: XOR + Base64 encryption for sensitive data
- **Access Control**: Role-based access control
- **Security Logging**: Comprehensive security event logging
- **Input Validation**: Client and server-side validation
- **Session Management**: Secure session handling

## 👥 User Roles

### Students
- Login with student ID and password
- Book futsal sessions
- View booking history
- Cancel own bookings

### Admins
- Manage student accounts
- View all bookings
- Generate reports
- Access security logs
- System administration

## 📊 Demo Credentials

### Student Login
- **Student ID**: `TIC001`
- **Password**: `student123`

### Admin Login
- **Username**: `texas`
- **Password**: `admin123`

## 🚀 Deployment

The application is automatically deployed to Firebase Hosting. To deploy updates:

```bash
firebase deploy
```

## 📁 Project Structure

```
college futsal boking  copy2/
├── index.html              # Main application file
├── styles.css              # Application styles
├── script.js               # Main JavaScript logic
├── database.js             # Firebase database operations
├── firebase-config.js      # Firebase configuration
├── firebase.json           # Firebase project configuration
├── .firebaserc            # Firebase project settings
├── firestore.rules        # Firestore security rules
├── firestore.indexes.json # Firestore indexes
├── deploy.sh              # Deployment script
└── README.md              # Documentation
```

## 🔧 Configuration

### Firebase Configuration
The Firebase configuration is in `firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBnnZgj-oP4V0MA88p4c_q6b9uGtkdxJmA",
  authDomain: "texas-futsal-booking.firebaseapp.com",
  projectId: "texas-futsal-booking",
  storageBucket: "texas-futsal-booking.appspot.com",
  messagingSenderId: "1048971899774",
  appId: "1:1048971899774:web:adee5411e4102ee364392f",
  measurementId: "G-7X5M15GXTT"
};
```

## 📞 Support

For technical support or questions:
- **Email**: info@texasintl.edu.np
- **Phone**: 01-4590670
- **Address**: Texas International College, Mitrapark, Chabahil, Kathmandu

## 📄 License

This project is developed for Texas International College. All rights reserved.

---

**Developed By**: Envision Tech Pvt. Ltd.
**For**: Texas International College
**Version**: 2.0 (Firebase Edition) 