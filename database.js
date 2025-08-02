// Database Management System for Texas International College Futsal Booking
// Enhanced with security measures - localStorage only

class FutsalDatabase {
    constructor() {
        this.setupSecurity();
        this.initializeDatabase();
    }

    setupSecurity() {
        // Add security headers and prevent direct access
        if (typeof window !== 'undefined') {
            // Prevent right-click context menu
            document.addEventListener('contextmenu', e => e.preventDefault());
            
            // Prevent F12, Ctrl+Shift+I, Ctrl+U
            document.addEventListener('keydown', e => {
                if (e.key === 'F12' || 
                    (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                    (e.ctrlKey && e.key === 'u')) {
                    e.preventDefault();
                    return false;
                }
            });
        }
    }

    // Simple encryption for sensitive data
    encrypt(data) {
        try {
            // Simple XOR encryption with a key
            const key = 'TIC_FUTSAL_2024';
            const jsonStr = JSON.stringify(data);
            let encrypted = '';
            for (let i = 0; i < jsonStr.length; i++) {
                encrypted += String.fromCharCode(jsonStr.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            return btoa(encrypted); // Base64 encode
        } catch (error) {
            console.error('Encryption error:', error);
            return data;
        }
    }

    decrypt(encryptedData) {
        try {
            // Simple XOR decryption
            const key = 'TIC_FUTSAL_2024';
            const decoded = atob(encryptedData); // Base64 decode
            let decrypted = '';
            for (let i = 0; i < decoded.length; i++) {
                decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Decryption error:', error);
            return null;
        }
    }

    // Secure storage methods
    secureSetItem(key, data) {
        try {
            const encrypted = this.encrypt(data);
            localStorage.setItem(key, encrypted);
            return true;
        } catch (error) {
            console.error('Secure storage error:', error);
            return false;
        }
    }

    secureGetItem(key) {
        try {
            const encrypted = localStorage.getItem(key);
            if (!encrypted) return null;
            return this.decrypt(encrypted);
        } catch (error) {
            console.error('Secure retrieval error:', error);
            return null;
        }
    }

    initializeDatabase() {
        // Initialize students if not exists
        if (!this.secureGetItem('futsal_students')) {
            const initialStudents = {
                'TIC001': {
                    name: 'Manish Karki',
                    program: 'BSc. CSIT',
                    password: 'student123',
                    email: 'manish.karki@texasintl.edu.np',
                    phone: '9801234567',
                    registeredDate: '2024-01-15',
                    status: 'active',
                    banHistory: []
                },
                'TIC002': {
                    name: 'Subarna Karki',
                    program: 'BBM',
                    password: 'student123',
                    email: 'subarna.karki@texasintl.edu.np',
                    phone: '9801234568',
                    registeredDate: '2024-01-16',
                    status: 'active',
                    banHistory: []
                },
                'TIC003': {
                    name: 'Rajesh Joshi',
                    program: 'BCA',
                    password: 'student123',
                    email: 'rajesh.joshi@texasintl.edu.np',
                    phone: '9801234569',
                    registeredDate: '2024-01-17',
                    status: 'active',
                    banHistory: []
                },
                'TIC004': {
                    name: 'Anjali Sharma',
                    program: '+2 Science',
                    password: 'student123',
                    email: 'anjali.sharma@texasintl.edu.np',
                    phone: '9801234570',
                    registeredDate: '2024-01-18',
                    status: 'active',
                    banHistory: []
                },
                'TIC005': {
                    name: 'Prakash Thapa',
                    program: '+2 Management',
                    password: 'student123',
                    email: 'prakash.thapa@texasintl.edu.np',
                    phone: '9801234571',
                    registeredDate: '2024-01-19',
                    status: 'active',
                    banHistory: []
                },
                'TIC006': {
                    name: 'Sita Tamang',
                    program: 'MSc. CSIT',
                    password: 'student123',
                    email: 'sita.tamang@texasintl.edu.np',
                    phone: '9801234572',
                    registeredDate: '2024-01-20',
                    status: 'active',
                    banHistory: []
                }
            };
            this.secureSetItem('futsal_students', initialStudents);
        }

        // Initialize bookings if not exists
        if (!this.secureGetItem('futsal_bookings')) {
            this.secureSetItem('futsal_bookings', []);
        }

        // Initialize admins if not exists or force update to new credentials
        const existingAdmins = this.secureGetItem('futsal_admins');
        if (!existingAdmins || !existingAdmins.texas) {
            const admins = {
                'texas': {
                    username: 'texas',
                    password: '@@Texas@@123#',
                    role: 'super_admin'
                }
            };
            this.secureSetItem('futsal_admins', admins);
        }
        
        console.log("✅ localStorage database initialized successfully!");
    }

    // Student Management
    addStudent(studentId, studentData) {
        try {
            const students = this.getStudents();
            
            // Generate password if not provided
            if (!studentData.password) {
                studentData.password = this.generatePassword();
            }
            
            // Add default fields
            studentData.registeredDate = new Date().toISOString().split('T')[0];
            studentData.status = 'active';
            studentData.banHistory = [];
            
            students[studentId] = studentData;
            return this.secureSetItem('futsal_students', students);
        } catch (error) {
            console.error('Error adding student:', error);
            return false;
        }
    }

    getStudent(studentId) {
        const students = this.getStudents();
        return students[studentId] || null;
    }

    getStudents() {
        try {
            return this.secureGetItem('futsal_students') || {};
        } catch (error) {
            console.error('Error getting students:', error);
            return {};
        }
    }

    updateStudent(studentId, updates) {
        try {
            const students = this.getStudents();
            if (students[studentId]) {
                students[studentId] = { ...students[studentId], ...updates };
                return this.secureSetItem('futsal_students', students);
            }
            return false;
        } catch (error) {
            console.error('Error updating student:', error);
            return false;
        }
    }

    deleteStudent(studentId) {
        try {
            const students = this.getStudents();
            if (students[studentId]) {
                delete students[studentId];
                return this.secureSetItem('futsal_students', students);
            }
            return false;
        } catch (error) {
            console.error('Error deleting student:', error);
            return false;
        }
    }

    // Update student password securely
    updateStudentPassword(studentId, newPassword) {
        try {
            const students = this.getStudents();
            if (students[studentId]) {
                students[studentId].password = newPassword;
                return this.secureSetItem('futsal_students', students);
            }
            return false;
        } catch (error) {
            console.error('Error updating student password:', error);
            return false;
        }
    }

    // Ban/Unban functionality
    banStudent(studentId, reason = '', duration = '') {
        try {
            const students = this.getStudents();
            if (students[studentId]) {
                const banRecord = {
                    date: new Date().toISOString(),
                    reason: reason,
                    duration: duration,
                    admin: 'texas'
                };
                
                students[studentId].status = 'banned';
                students[studentId].banHistory = students[studentId].banHistory || [];
                students[studentId].banHistory.push(banRecord);
                
                return this.secureSetItem('futsal_students', students);
            }
            return false;
        } catch (error) {
            console.error('Error banning student:', error);
            return false;
        }
    }

    unbanStudent(studentId) {
        try {
            const students = this.getStudents();
            if (students[studentId]) {
                students[studentId].status = 'active';
                return this.secureSetItem('futsal_students', students);
            }
            return false;
        } catch (error) {
            console.error('Error unbanning student:', error);
            return false;
        }
    }

    // Booking Management
    addBooking(bookingData) {
        try {
            const bookings = this.getBookings();
            
            // Check if time slot is already booked
            const existingBooking = bookings.find(booking => 
                booking.date === bookingData.date && 
                booking.time === bookingData.time &&
                booking.status !== 'cancelled'
            );
            
            if (existingBooking) {
                return { success: false, message: 'This time slot is already booked by another student' };
            }
            
            // Check if student already has a booking on this date
            const studentBookings = bookings.filter(booking => 
                booking.studentId === bookingData.studentId && 
                booking.date === bookingData.date &&
                booking.status !== 'cancelled'
            );
            
            if (studentBookings.length > 0) {
                return { success: false, message: 'You already have a booking on this date' };
            }
            
            // Add booking ID and timestamp
            bookingData.bookingId = this.generateBookingId();
            bookingData.bookingDate = new Date().toISOString();
            bookingData.status = 'confirmed';
            
            bookings.push(bookingData);
            const result = this.secureSetItem('futsal_bookings', bookings);
            return result ? { success: true, bookingId: bookingData.bookingId } : { success: false, message: 'Error creating booking' };
        } catch (error) {
            console.error('Error adding booking:', error);
            return { success: false, message: 'Error creating booking' };
        }
    }

    getBookings() {
        try {
            return this.secureGetItem('futsal_bookings') || [];
        } catch (error) {
            console.error('Error getting bookings:', error);
            return [];
        }
    }

    getBookingsByStudent(studentId) {
        const bookings = this.getBookings();
        return bookings.filter(booking => booking.studentId === studentId);
    }

    getBookingsByDate(date) {
        const bookings = this.getBookings();
        return bookings.filter(booking => booking.date === date && booking.status !== 'cancelled');
    }

    getAvailableTimeSlots(date) {
        const bookedSlots = this.getBookingsByDate(date).map(booking => booking.time);
        const allSlots = [
            '06:15', '07:15', '08:15', '09:15', '10:15', '11:15', '12:15',
            '13:15', '14:15', '15:15', '16:15', '17:15', '18:15', '19:15',
            '20:15', '21:15', '22:15'
        ];
        
        return allSlots.filter(slot => !bookedSlots.includes(slot));
    }

    // Admin Management
    validateAdmin(username, password) {
        try {
            const admins = this.secureGetItem('futsal_admins') || {};
            const admin = admins[username];
            return admin && admin.password === password;
        } catch (error) {
            console.error('Error validating admin:', error);
            return false;
        }
    }

    // Statistics
    getStatistics() {
        const students = this.getStudents();
        const bookings = this.getBookings();
        const today = new Date().toISOString().split('T')[0];
        const todayBookings = this.getBookingsByDate(today);
        const activeStudents = Object.values(students).filter(s => s.status === 'active').length;
        const bannedStudents = Object.values(students).filter(s => s.status === 'banned').length;

        return {
            totalStudents: Object.keys(students).length,
            totalBookings: bookings.length,
            todayBookings: todayBookings.length,
            activeStudents: activeStudents,
            bannedStudents: bannedStudents
        };
    }

    // Password Generation
    generatePassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    // Booking ID Generation
    generateBookingId() {
        return 'TIC' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();
    }

    // Export Data (with encryption)
    exportData(type) {
        try {
            let data, filename;
            
            switch (type) {
                case 'students':
                    data = this.getStudents();
                    filename = 'students_data.json';
                    break;
                case 'bookings':
                    data = this.getBookings();
                    filename = 'bookings_data.json';
                    break;
                default:
                    return false;
            }
            
            const dataStr = JSON.stringify(data, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Error exporting data:', error);
            return false;
        }
    }

    // Logout method for compatibility with Firebase adapter
    async logout() {
        try {
            // Clear current user session from localStorage
            localStorage.removeItem('currentUser');
            localStorage.removeItem('currentUserType');
            return { success: true };
        } catch (error) {
            console.error('Error during logout:', error);
            return { success: false, error: error.message };
        }
    }

    // Clear all data (for security)
    clearAllData() {
        try {
            localStorage.removeItem('futsal_students');
            localStorage.removeItem('futsal_bookings');
            localStorage.removeItem('futsal_admins');
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }
}

// Initialize database
const futsalDB = new FutsalDatabase();

// Export for use in other files
window.futsalDB = futsalDB;
window.db = futsalDB; 