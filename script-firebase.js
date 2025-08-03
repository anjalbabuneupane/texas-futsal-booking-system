// Main Application Script for Texas College Futsal Booking System
// Using Firebase Realtime Database

import { 
    registerStudent, 
    getAllStudents, 
    getStudent, 
    updateStudent, 
    banStudent, 
    unbanStudent,
    createBooking,
    getAllBookings,
    getBookingsByStudent,
    getBookingsByDate,
    updateBooking,
    cancelBooking,
    deleteBooking,
    createAdmin,
    validateAdmin,
    getStatistics,
    logSecurityEvent,
    initializeFirebaseData
} from './firebase-database.js';

// Global variables
let currentUser = null;
let currentUserType = null;

// Initialize the application
async function initializeApp() {
    try {
        console.log('🚀 Initializing Texas College Futsal Booking System...');
        
        // Initialize Firebase data
        await initializeFirebaseData();
        
        // Check for existing session
        const savedUser = localStorage.getItem('currentUser');
        const savedUserType = localStorage.getItem('currentUserType');
        
        if (savedUser && savedUserType) {
            currentUser = JSON.parse(savedUser);
            currentUserType = savedUserType;
            console.log('🔄 Restored session for:', currentUser.name);
            
            if (currentUserType === 'student') {
                showStudentDashboard();
            } else if (currentUserType === 'admin') {
                showAdminDashboard();
            }
        }
        
        // Update navigation
        updateNavigation();
        
        console.log('✅ Application initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing application:', error);
        showNotification('Error initializing application', 'error');
    }
}

// Security logging function
async function logSecurityEvent(event, details) {
    try {
        await logSecurityEvent(event, details);
    } catch (error) {
        console.error('❌ Error logging security event:', error);
    }
}

// Modal functions
function openLoginModal() {
    console.log('🔓 Opening login modal...');
    try {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.style.display = 'block';
            console.log('✅ Login modal opened successfully');
            return true;
        } else {
            console.error('❌ Login modal not found');
            alert('Login modal not found. Please refresh the page.');
            return false;
        }
    } catch (error) {
        console.error('❌ Error opening login modal:', error);
        alert('Error opening login modal. Please refresh the page.');
        return false;
    }
}

function openAdminModal() {
    console.log('🔐 Opening admin modal...');
    try {
        const modal = document.getElementById('adminModal');
        if (modal) {
            modal.style.display = 'block';
            console.log('✅ Admin modal opened successfully');
            return true;
        } else {
            console.error('❌ Admin modal not found');
            alert('Admin modal not found. Please refresh the page.');
            return false;
        }
    } catch (error) {
        console.error('❌ Error opening admin modal:', error);
        alert('Error opening admin modal. Please refresh the page.');
        return false;
    }
}

function closeLoginModal() {
    console.log('🔒 Closing login modal...');
    const modal = document.getElementById('loginModal');
    const form = document.getElementById('loginForm');
    if (modal) {
        modal.style.display = 'none';
        if (form) form.reset();
        console.log('✅ Login modal closed');
    } else {
        console.error('❌ Login modal not found');
    }
}

function closeAdminModal() {
    console.log('🔒 Closing admin modal...');
    const modal = document.getElementById('adminModal');
    const form = document.getElementById('adminForm');
    if (modal) {
        modal.style.display = 'none';
        if (form) form.reset();
        console.log('✅ Admin modal closed');
    } else {
        console.error('❌ Admin modal not found');
    }
}

// Handle student login
async function handleLogin(event) {
    event.preventDefault();
    console.log('🔐 Student login attempt...');
    
    const studentId = document.getElementById('studentId').value;
    const password = document.getElementById('password').value;
    
    console.log('📝 Student ID:', studentId);
    console.log('🔑 Password length:', password ? password.length : 0);
    
    if (!studentId || !password) {
        showNotification('Please enter both Student ID and Password', 'error');
        return;
    }
    
    try {
        // Validate student credentials using Firebase
        const student = await getStudent(studentId);
        
        if (student && student.password === password && student.status === 'active') {
            console.log('✅ Student login successful');
            
            // Log security event
            await logSecurityEvent('student_login', `Student ${studentId} logged in successfully`);
            
            // Set current user
            currentUser = {
                studentId: studentId,
                name: student.name,
                program: student.program,
                email: student.email,
                phone: student.phone,
                type: 'student'
            };
            currentUserType = 'student';
            
            // Save to localStorage for session persistence
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('currentUserType', currentUserType);
            
            // Close modal and show dashboard
            closeLoginModal();
            showStudentDashboard();
            
            // Show success notification
            showNotification('Login successful! Welcome back, ' + student.name, 'success');
            
        } else if (student && student.status === 'banned') {
            showNotification('Your account has been banned. Please contact admin.', 'error');
        } else {
            showNotification('Invalid student ID or password. Please try again.', 'error');
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    }
}

// Handle admin login
async function handleAdminLogin(event) {
    console.log('🔐 Admin login function called');
    event.preventDefault();
    console.log('🔐 Admin login attempt...');
    
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    console.log('📝 Admin username:', username);
    console.log('🔑 Admin password length:', password ? password.length : 0);
    
    if (!username || !password) {
        showNotification('Please enter both Username and Password', 'error');
        return;
    }
    
    try {
        console.log('🔍 Authenticating admin with Firebase...');
        
        const isValid = await validateAdmin(username, password);
        
        if (isValid) {
            console.log('✅ Firebase admin login successful');
            
            // Log security event
            await logSecurityEvent('admin_login', `Admin ${username} logged in successfully`);
            
            // Set current user
            currentUser = {
                username: username,
                type: 'admin'
            };
            currentUserType = 'admin';
            
            // Save to localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('currentUserType', currentUserType);
            
            // Close modal and show dashboard
            closeAdminModal();
            showAdminDashboard();
            
            // Show success notification
            showNotification('Admin login successful! Welcome back, ' + username, 'success');
            
        } else {
            console.log('❌ Invalid admin credentials');
            showNotification('Invalid admin credentials. Please try again.', 'error');
        }
    } catch (error) {
        console.error('❌ Admin login error:', error);
        showNotification('Admin login failed. Please try again.', 'error');
    }
}

// Show student dashboard
function showStudentDashboard() {
    try {
        // Hide main content
        document.querySelectorAll('section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show student dashboard
        document.getElementById('studentDashboard').style.display = 'block';
        
        // Load student data
        loadStudentData();
        
        // Update navigation
        updateNavigation();
        
        console.log('✅ Student dashboard displayed');
    } catch (error) {
        console.error('❌ Error showing student dashboard:', error);
        showNotification('Error loading student dashboard', 'error');
    }
}

// Show admin dashboard
function showAdminDashboard() {
    try {
        // Hide main content
        document.querySelectorAll('section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show admin dashboard
        document.getElementById('adminDashboard').style.display = 'block';
        
        // Load admin data
        loadAdminData();
        
        // Update navigation
        updateNavigation();
        
        console.log('✅ Admin dashboard displayed');
    } catch (error) {
        console.error('❌ Error showing admin dashboard:', error);
        showNotification('Error loading admin dashboard', 'error');
    }
}

// Load student data
async function loadStudentData() {
    try {
        console.log('🔍 Loading student data for:', currentUser);
        
        const studentBookings = await getBookingsByStudent(currentUser.studentId);
        
        // Update statistics
        const myTotalBookingsElement = document.getElementById('myTotalBookings');
        if (myTotalBookingsElement) {
            myTotalBookingsElement.textContent = studentBookings.length;
        }
        
        const thisMonth = new Date().getMonth();
        const thisMonthBookings = studentBookings.filter(booking => {
            const bookingMonth = new Date(booking.date).getMonth();
            return bookingMonth === thisMonth;
        });
        
        const myThisMonthElement = document.getElementById('myThisMonth');
        if (myThisMonthElement) {
            myThisMonthElement.textContent = thisMonthBookings.length;
        }
        
        const totalHours = studentBookings.length; // 1 hour per booking
        const myHoursPlayedElement = document.getElementById('myHoursPlayed');
        if (myHoursPlayedElement) {
            myHoursPlayedElement.textContent = totalHours;
        }
        
        // Load comprehensive booking data
        loadMyBookingsDashboard(studentBookings);
        
        // Update student information display with error checking
        const studentNameDisplay = document.getElementById('studentNameDisplay');
        const studentIdCard = document.getElementById('studentIdCard');
        const studentProgramCard = document.getElementById('studentProgramCard');
        const studentNameHeader = document.getElementById('studentNameHeader');
        
        if (studentNameDisplay) {
            studentNameDisplay.textContent = currentUser.name || 'Unknown Student';
            console.log('✅ Updated studentNameDisplay:', currentUser.name);
        } else {
            console.error('❌ studentNameDisplay element not found');
        }
        
        if (studentIdCard) {
            studentIdCard.textContent = currentUser.studentId || 'Unknown ID';
            console.log('✅ Updated studentIdCard:', currentUser.studentId);
        } else {
            console.error('❌ studentIdCard element not found');
        }
        
        if (studentProgramCard) {
            studentProgramCard.textContent = currentUser.program || 'Unknown Program';
            console.log('✅ Updated studentProgramCard:', currentUser.program);
        } else {
            console.error('❌ studentProgramCard element not found');
        }
        
        if (studentNameHeader) {
            studentNameHeader.textContent = currentUser.name || 'Unknown Student';
            console.log('✅ Updated studentNameHeader:', currentUser.name);
        } else {
            console.error('❌ studentNameHeader element not found');
        }
        
        console.log('✅ Student data loaded successfully');
    } catch (error) {
        console.error('❌ Error loading student data:', error);
        showNotification('Error loading student data', 'error');
    }
}

// Load admin data
async function loadAdminData() {
    try {
        const stats = await getStatistics();
        
        const totalStudentsElement = document.getElementById('totalStudents');
        const totalBookingsElement = document.getElementById('totalBookings');
        const activeStudentsElement = document.getElementById('activeStudents');
        const todayBookingsElement = document.getElementById('todayBookings');
        
        if (totalStudentsElement) totalStudentsElement.textContent = stats.totalStudents;
        if (totalBookingsElement) totalBookingsElement.textContent = stats.totalBookings;
        if (activeStudentsElement) activeStudentsElement.textContent = stats.activeStudents;
        if (todayBookingsElement) todayBookingsElement.textContent = stats.todayBookings;
        
        console.log('✅ Admin data loaded successfully');
    } catch (error) {
        console.error('❌ Error loading admin data:', error);
        showNotification('Error loading admin data', 'error');
    }
}

// Update navigation based on login status
function updateNavigation() {
    const navActions = document.querySelector('.nav-actions');
    if (currentUser) {
        navActions.innerHTML = `
            <span class="user-info">
                <i class="fas fa-${currentUserType === 'admin' ? 'user-cog' : 'user-graduate'}"></i>
                ${currentUserType === 'admin' ? 'Admin' : currentUser.name}
            </span>
            <button class="logout-btn-nav" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i>
                Logout
            </button>
        `;
    } else {
        navActions.innerHTML = `
            <button class="login-btn-nav" onclick="openLoginModal()">
                <i class="fas fa-user-graduate"></i>
                Student Login
            </button>
            <button class="admin-btn-nav" onclick="openAdminModal()">
                <i class="fas fa-user-cog"></i>
                Admin
            </button>
        `;
    }
}

// Logout function
async function logout() {
    try {
        console.log('🔍 Logging out from Firebase...');
        
        // Clear current user
        currentUser = null;
        currentUserType = null;
        
        // Clear localStorage
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentUserType');
        
        // Hide dashboards
        document.getElementById('studentDashboard').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'none';
        
        // Show main content
        document.querySelectorAll('section').forEach(section => {
            section.style.display = 'block';
        });
        
        // Reset navigation
        updateNavigation();
        
        console.log('✅ Firebase logout successful');
        showNotification('Logged out successfully', 'success');
    } catch (error) {
        console.error('❌ Logout error:', error);
        showNotification('Error during logout', 'error');
    }
}

// Load my bookings dashboard
async function loadMyBookingsDashboard(bookings = null) {
    try {
        if (!bookings) {
            bookings = await getBookingsByStudent(currentUser.studentId);
        }
        
        // Filter bookings by status
        const activeBookings = bookings.filter(b => b.status === 'confirmed');
        const pastBookings = bookings.filter(b => b.status === 'completed');
        const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
        
        // Load each section
        loadActiveBookings(activeBookings);
        loadPastBookings(pastBookings);
        loadCancelledBookings(cancelledBookings);
        
        console.log('✅ My bookings dashboard loaded');
    } catch (error) {
        console.error('❌ Error loading my bookings dashboard:', error);
        showNotification('Error loading bookings', 'error');
    }
}

// Load active bookings
function loadActiveBookings(bookings) {
    const container = document.getElementById('activeBookings');
    if (!container) return;
    
    if (bookings.length === 0) {
        container.innerHTML = '<p class="no-bookings">No active bookings</p>';
        return;
    }
    
    let html = '';
    bookings.forEach(booking => {
        html += `
            <div class="booking-card active">
                <div class="booking-header">
                    <h4>${booking.date} at ${getTimeDisplay(booking.time)}</h4>
                    <span class="status-badge confirmed">Confirmed</span>
                </div>
                <div class="booking-details">
                    <p><strong>Team:</strong> ${booking.teamName}</p>
                    <p><strong>Phone:</strong> ${booking.phone}</p>
                    <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
                </div>
                <div class="booking-actions">
                    <button class="action-btn cancel" onclick="cancelMyBooking('${booking.bookingId}')">
                        <i class="fas fa-times"></i>
                        Cancel Booking
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Load past bookings
function loadPastBookings(bookings) {
    const container = document.getElementById('pastBookings');
    if (!container) return;
    
    if (bookings.length === 0) {
        container.innerHTML = '<p class="no-bookings">No past bookings</p>';
        return;
    }
    
    let html = '';
    bookings.forEach(booking => {
        html += `
            <div class="booking-card past">
                <div class="booking-header">
                    <h4>${booking.date} at ${getTimeDisplay(booking.time)}</h4>
                    <span class="status-badge completed">Completed</span>
                </div>
                <div class="booking-details">
                    <p><strong>Team:</strong> ${booking.teamName}</p>
                    <p><strong>Phone:</strong> ${booking.phone}</p>
                    <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Load cancelled bookings
function loadCancelledBookings(bookings) {
    const container = document.getElementById('cancelledBookings');
    if (!container) return;
    
    if (bookings.length === 0) {
        container.innerHTML = '<p class="no-bookings">No cancelled bookings</p>';
        return;
    }
    
    let html = '';
    bookings.forEach(booking => {
        html += `
            <div class="booking-card cancelled">
                <div class="booking-header">
                    <h4>${booking.date} at ${getTimeDisplay(booking.time)}</h4>
                    <span class="status-badge cancelled">Cancelled</span>
                </div>
                <div class="booking-details">
                    <p><strong>Team:</strong> ${booking.teamName}</p>
                    <p><strong>Phone:</strong> ${booking.phone}</p>
                    <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Cancel my booking
async function cancelMyBooking(bookingId) {
    try {
        if (confirm('Are you sure you want to cancel this booking?')) {
            const result = await cancelBooking(bookingId);
            
            if (result.success) {
                showNotification('Booking cancelled successfully', 'success');
                loadMyBookingsDashboard(); // Reload bookings
            } else {
                showNotification('Error cancelling booking', 'error');
            }
        }
    } catch (error) {
        console.error('❌ Error cancelling booking:', error);
        showNotification('Error cancelling booking', 'error');
    }
}

// Handle student registration
async function handleStudentRegistration(event) {
    event.preventDefault();
    
    const studentId = document.getElementById('newStudentId').value;
    const name = document.getElementById('newStudentName').value;
    const program = document.getElementById('newStudentProgram').value;
    const email = document.getElementById('newStudentEmail').value;
    const phone = document.getElementById('newStudentPhone').value;
    const password = document.getElementById('newStudentPassword').value;
    
    if (!studentId || !name || !program || !email || !phone || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const studentData = {
            studentId: studentId,
            name: name,
            program: program,
            email: email,
            phone: phone,
            password: password,
            registeredDate: new Date().toISOString().split('T')[0],
            status: 'active'
        };
        
        const result = await registerStudent(studentData);
        
        if (result.success) {
            showNotification('Student registered successfully!', 'success');
            showCredentials(studentId, name, password);
            document.getElementById('studentRegistrationForm').reset();
        } else {
            showNotification('Error registering student', 'error');
        }
    } catch (error) {
        console.error('❌ Error registering student:', error);
        showNotification('Error registering student', 'error');
    }
}

// Show credentials after registration
function showCredentials(studentId, name, password) {
    const message = `Student registered successfully!\n\nStudent ID: ${studentId}\nName: ${name}\nPassword: ${password}\n\nPlease save these credentials!`;
    alert(message);
}

// Generate password
function generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('newStudentPassword').value = password;
}

// Handle booking
async function handleBooking() {
    try {
        const date = document.getElementById('bookingDate').value;
        const time = document.getElementById('bookingTime').value;
        const teamName = document.getElementById('teamName').value;
        const phone = document.getElementById('bookingPhone').value;
        
        if (!date || !time || !teamName || !phone) {
            showNotification('Please fill in all booking details', 'error');
            return;
        }
        
        // Validate booking restrictions
        const validation = validateBookingRestrictions(date, time);
        if (!validation.valid) {
            showNotification(validation.message, 'error');
            return;
        }
        
        const bookingData = {
            studentId: currentUser.studentId,
            studentName: currentUser.name,
            date: date,
            time: time,
            teamName: teamName,
            phone: phone,
            status: 'confirmed'
        };
        
        const result = await createBooking(bookingData);
        
        if (result.success) {
            showNotification('Booking created successfully!', 'success');
            document.getElementById('bookingForm').reset();
            loadStudentData(); // Reload student data
        } else {
            showNotification('Error creating booking', 'error');
        }
    } catch (error) {
        console.error('❌ Error creating booking:', error);
        showNotification('Error creating booking', 'error');
    }
}

// Validate booking restrictions
function validateBookingRestrictions(date, time) {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        return { valid: false, message: 'Cannot book for past dates' };
    }
    
    const selectedTime = new Date(`2000-01-01T${time}`);
    const startTime = new Date('2000-01-01T06:00:00');
    const endTime = new Date('2000-01-01T22:00:00');
    
    if (selectedTime < startTime || selectedTime > endTime) {
        return { valid: false, message: 'Booking time must be between 6:00 AM and 10:00 PM' };
    }
    
    return { valid: true };
}

// Get time display
function getTimeDisplay(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Get notification icon
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Statistics functions
async function showStatisticsDashboard() {
    try {
        const statisticsModal = document.getElementById('statisticsModal');
        if (statisticsModal) {
            statisticsModal.style.display = 'block';
            await loadStatisticsData();
            console.log('✅ Statistics dashboard opened successfully');
        } else {
            console.error('❌ Statistics modal not found');
            showNotification('Statistics dashboard not available', 'error');
        }
    } catch (error) {
        console.error('❌ Error opening statistics dashboard:', error);
        showNotification('Error opening statistics dashboard', 'error');
    }
}

async function loadStatisticsData() {
    try {
        console.log('📊 Loading statistics data...');
        
        const stats = await getStatistics();
        const students = await getAllStudents();
        const bookings = await getAllBookings();
        
        console.log('📊 Statistics:', stats);
        console.log('👥 Students count:', Object.keys(students).length);
        console.log('📅 Bookings count:', bookings.length);
        
        // Update main statistics with error checking
        const statsTotalStudents = document.getElementById('statsTotalStudents');
        const statsTotalBookings = document.getElementById('statsTotalBookings');
        const statsTodayBookings = document.getElementById('statsTodayBookings');
        
        if (statsTotalStudents) statsTotalStudents.textContent = stats.totalStudents;
        if (statsTotalBookings) statsTotalBookings.textContent = stats.totalBookings;
        if (statsTodayBookings) statsTodayBookings.textContent = stats.todayBookings;
        
        // Calculate detailed statistics
        const activeStudents = Object.values(students).filter(s => s.status === 'active').length;
        const bannedStudents = Object.values(students).filter(s => s.status === 'banned').length;
        const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
        const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
        
        // Update detailed stats with error checking
        const statsActiveStudents = document.getElementById('statsActiveStudents');
        const statsBannedStudents = document.getElementById('statsBannedStudents');
        const statsConfirmedBookings = document.getElementById('statsConfirmedBookings');
        const statsCancelledBookings = document.getElementById('statsCancelledBookings');
        
        if (statsActiveStudents) statsActiveStudents.textContent = `${activeStudents} Active`;
        if (statsBannedStudents) statsBannedStudents.textContent = `${bannedStudents} Banned`;
        if (statsConfirmedBookings) statsConfirmedBookings.textContent = `${confirmedBookings} Confirmed`;
        if (statsCancelledBookings) statsCancelledBookings.textContent = `${cancelledBookings} Cancelled`;
        
        // Calculate usage percentage
        const totalDays = Math.max(1, Math.floor((new Date() - new Date('2024-01-01')) / (1000 * 60 * 60 * 24)));
        const avgDailyBookings = Math.round(stats.totalBookings / totalDays);
        const usagePercentage = Math.min(100, Math.round((avgDailyBookings / 17) * 100));
        
        const statsUsagePercentage = document.getElementById('statsUsagePercentage');
        if (statsUsagePercentage) statsUsagePercentage.textContent = `${usagePercentage}%`;
        
        console.log('✅ Statistics data loaded successfully');
    } catch (error) {
        console.error('❌ Error loading statistics data:', error);
        showNotification('Error loading statistics data', 'error');
    }
}

// Export statistics
async function exportStatistics() {
    try {
        const stats = await getStatistics();
        const students = await getAllStudents();
        const bookings = await getAllBookings();
        
        const exportData = {
            statistics: stats,
            students: students,
            bookings: bookings,
            exportDate: new Date().toISOString(),
            totalRecords: {
                students: Object.keys(students).length,
                bookings: bookings.length
            }
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `futsal_statistics_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        showNotification('Statistics exported successfully!', 'success');
    } catch (error) {
        console.error('❌ Error exporting statistics:', error);
        showNotification('Error exporting statistics', 'error');
    }
}

// Refresh statistics
async function refreshStatistics() {
    try {
        await loadStatisticsData();
        showNotification('Statistics refreshed successfully!', 'success');
    } catch (error) {
        console.error('❌ Error refreshing statistics:', error);
        showNotification('Error refreshing statistics', 'error');
    }
}

// Make functions globally available
window.openLoginModal = openLoginModal;
window.openAdminModal = openAdminModal;
window.closeLoginModal = closeLoginModal;
window.closeAdminModal = closeAdminModal;
window.handleLogin = handleLogin;
window.handleAdminLogin = handleAdminLogin;
window.logout = logout;
window.handleStudentRegistration = handleStudentRegistration;
window.generatePassword = generatePassword;
window.handleBooking = handleBooking;
window.cancelMyBooking = cancelMyBooking;
window.showStatisticsDashboard = showStatisticsDashboard;
window.exportStatistics = exportStatistics;
window.refreshStatistics = refreshStatistics;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

console.log('✅ Firebase script loaded successfully'); 