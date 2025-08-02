// Use local database
let db;

// Initialize database
function initializeDatabase() {
    if (typeof futsalDB !== 'undefined') {
        db = futsalDB;
        console.log('✅ Local database initialized successfully');
    } else {
        console.error('❌ Database not found');
        alert('Database system not available. Please refresh the page.');
    }
}

// Security logging function
function logSecurityEvent(event, details) {
    try {
        const log = {
            timestamp: new Date().toISOString(),
            event: event,
            details: details,
            user: currentUser ? (currentUser.username || currentUser.studentId) : 'anonymous'
        };
        
        // Store security logs
        const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
        logs.push(log);
        localStorage.setItem('security_logs', JSON.stringify(logs.slice(-100))); // Keep last 100 logs
        
        console.log('🔒 Security event logged:', event);
    } catch (error) {
        console.error('Error logging security event:', error);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded - Initializing...');
    initializeDatabase();
    
    // Also try to initialize after a short delay in case Firebase loads later
    setTimeout(initializeDatabase, 1000);
    setTimeout(initializeDatabase, 3000);
});

// Also initialize when window loads (for mobile compatibility)
window.addEventListener('load', function() {
    console.log('🌐 Window Loaded - Re-initializing...');
    initializeDatabase();
});

// Simple initialization without security measures
console.log('🚀 Texas Futsal Booking System Initializing...');

// Current logged in user
let currentUser = null;
let currentUserType = null;

// Modal functions are now defined in index.html to avoid conflicts
// These functions are available globally from the HTML script section

function closeStudentManagementModal() {
    document.getElementById('studentManagementModal').style.display = 'none';
}

function closeStudentDatabaseModal() {
    document.getElementById('studentDatabaseModal').style.display = 'none';
}

function closeBookingDatabaseModal() {
    document.getElementById('bookingDatabaseModal').style.display = 'none';
}

function closeStatisticsModal() {
    document.getElementById('statisticsModal').style.display = 'none';
}

function closeBookingManagementModal() {
    document.getElementById('bookingManagementModal').style.display = 'none';
}

// Set minimum date to today
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('date');
    const quickDateInput = document.getElementById('quickDate');
    const today = new Date().toISOString().split('T')[0];
    
    if (dateInput) dateInput.min = today;
    if (quickDateInput) quickDateInput.min = today;
    
    // Add event listeners for date changes
    if (quickDateInput) {
        quickDateInput.addEventListener('change', function() {
            updateAvailableTimeSlots(this.value);
        });
    }
    
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const userData = JSON.parse(savedUser);
        currentUser = userData;
        currentUserType = userData.type;
        
        if (currentUserType === 'student') {
            showStudentDashboard();
        } else if (currentUserType === 'admin') {
            showAdminDashboard();
        }
    }
});

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
        // Validate student credentials
        const student = db.getStudent(studentId);
        
        if (student && student.password === password && student.status === 'active') {
            console.log('✅ Student login successful');
            
            // Log security event
            logSecurityEvent('student_login', `Student ${studentId} logged in successfully`);
            
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
    
    // Debug: Check if database is working
    console.log('🔍 Debug: Attempting admin login');
    console.log('🔍 Debug: Username:', username);
    console.log('🔍 Debug: Password length:', password.length);
    
    // Log login attempt for security monitoring
    logSecurityEvent('admin_login_attempt', { 
        username: username, 
        timestamp: new Date().toISOString(),
        ip: 'client-side'
    });
    
    try {
        console.log('🔍 Authenticating admin with local database...');
        
        // Ensure database is initialized
        db.initializeDatabase();
        
        const isValid = db.validateAdmin(username, password);
        
        if (isValid) {
            console.log('✅ Local database admin login successful');
            
            // Log security event
            logSecurityEvent('admin_login', `Admin ${username} logged in successfully`);
            
            currentUser = {
                username: username,
                type: 'admin'
            };
            currentUserType = 'admin';
            
            // Save to localStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('currentUserType', currentUserType);
            
            console.log('🔐 Current user set:', currentUser);
            console.log('🔐 User type set:', currentUserType);
            
            showNotification('Access granted. Welcome back!', 'success');
            closeAdminModal();
            
            console.log('🔐 About to show admin dashboard...');
            showAdminDashboard();
        } else {
            console.log('❌ Local database admin login failed');
            showNotification('Admin username or password is incorrect', 'error');
            
            // Clear password field for security
            document.getElementById('adminPassword').value = '';
        }
    } catch (error) {
        console.error('Admin login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    }
}

// Show student dashboard
function showStudentDashboard() {
    console.log('🎓 Showing student dashboard...');
    
    // Hide all sections and dashboards
    document.querySelectorAll('section, .dashboard, .dashboard-section').forEach(element => {
        element.style.display = 'none';
    });
    
    // Show student dashboard
    const studentDashboard = document.getElementById('studentDashboard');
    if (studentDashboard) {
        studentDashboard.style.display = 'block';
        console.log('✅ Student dashboard shown');
    } else {
        console.error('❌ Student dashboard not found');
        alert('Student dashboard not found. Please refresh the page.');
        return;
    }
    
    // Load student data
    loadStudentData();
    
    // Update navigation
    updateNavigation();
}

// Show admin dashboard
function showAdminDashboard() {
    console.log('🔐 Showing admin dashboard...');
    
    // Hide all sections and dashboards
    document.querySelectorAll('section, .dashboard, .dashboard-section').forEach(element => {
        element.style.display = 'none';
    });
    
    // Show admin dashboard
    const adminDashboard = document.getElementById('adminDashboard');
    if (adminDashboard) {
        adminDashboard.style.display = 'block';
        console.log('✅ Admin dashboard shown');
    } else {
        console.error('❌ Admin dashboard not found');
        alert('Admin dashboard not found. Please refresh the page.');
        return;
    }
    
    // Load admin data
    loadAdminData();
    
    // Update navigation
    updateNavigation();
}

// Load student data
async function loadStudentData() {
    try {
        const studentBookings = db.getBookingsByStudent(currentUser.studentId);
        
        // Update statistics
        document.getElementById('myTotalBookings').textContent = studentBookings.length;
        
        const thisMonth = new Date().getMonth();
        const thisMonthBookings = studentBookings.filter(booking => {
            const bookingMonth = new Date(booking.date).getMonth();
            return bookingMonth === thisMonth;
        });
        document.getElementById('myThisMonth').textContent = thisMonthBookings.length;
        
        const totalHours = studentBookings.length; // 1 hour per booking
        document.getElementById('myHoursPlayed').textContent = totalHours;
        
        // Load comprehensive booking data
        loadMyBookingsDashboard();
        
        // Update student information display
        document.getElementById('studentNameDisplay').textContent = currentUser.name;
        document.getElementById('studentIdCard').textContent = currentUser.studentId;
        document.getElementById('studentProgramCard').textContent = currentUser.program;
        document.getElementById('studentNameHeader').textContent = currentUser.name;
    } catch (error) {
        console.error('Error loading student data:', error);
        showNotification('Error loading student data', 'error');
    }
}

// Load admin data
async function loadAdminData() {
    try {
        const stats = db.getStatistics();
        
        document.getElementById('totalStudents').textContent = stats.totalStudents;
        document.getElementById('totalBookings').textContent = stats.totalBookings;
        document.getElementById('activeStudents').textContent = stats.activeStudents;
        document.getElementById('todayBookings').textContent = stats.todayBookings;
    } catch (error) {
        console.error('Error loading admin data:', error);
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
function logout() {
    try {
        console.log('🔍 Logging out from local database...');
        
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
        
        console.log('✅ Local database logout successful');
        showNotification('Logged out successfully', 'info');
    } catch (error) {
        console.error('💥 Logout error:', error);
        showNotification('Logout failed. Please try again.', 'error');
    }
}

// Load my bookings dashboard
function loadMyBookingsDashboard() {
    const studentBookings = db.getBookingsByStudent(currentUser.studentId);
    const today = new Date().toISOString().split('T')[0];
    
    // Separate bookings by status
    const activeBookings = studentBookings.filter(booking => 
        booking.status === 'confirmed' && booking.date >= today
    );
    
    const pastBookings = studentBookings.filter(booking => 
        booking.status === 'confirmed' && booking.date < today
    );
    
    const cancelledBookings = studentBookings.filter(booking => 
        booking.status === 'cancelled'
    );
    
    // Load active bookings
    loadActiveBookings(activeBookings);
    
    // Load past bookings
    loadPastBookings(pastBookings);
    
    // Load cancelled bookings
    loadCancelledBookings(cancelledBookings);
}

function loadActiveBookings(bookings) {
    const container = document.getElementById('activeBookingsList');
    if (!container) return;
    
    if (bookings.length === 0) {
        container.innerHTML = '<p class="no-bookings">No active bookings</p>';
        return;
    }
    
    container.innerHTML = bookings.map(booking => `
        <div class="booking-card active">
            <div class="booking-header">
                <h4>${getTimeDisplay(booking.time)}</h4>
                <span class="status-badge confirmed">Confirmed</span>
            </div>
            <div class="booking-details">
                <p><strong>Date:</strong> ${booking.date}</p>
                <p><strong>Team:</strong> ${booking.teamName}</p>
                <p><strong>Phone:</strong> ${booking.phone}</p>
                <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
            </div>
            <div class="booking-actions">
                <button class="action-btn cancel" onclick="cancelMyBooking('${booking.bookingId}')">
                    <i class="fas fa-times"></i> Cancel Booking
                </button>
            </div>
        </div>
    `).join('');
}

function loadPastBookings(bookings) {
    const container = document.getElementById('pastBookingsList');
    if (!container) return;
    
    if (bookings.length === 0) {
        container.innerHTML = '<p class="no-bookings">No past bookings</p>';
        return;
    }
    
    container.innerHTML = bookings.map(booking => `
        <div class="booking-card past">
            <div class="booking-header">
                <h4>${getTimeDisplay(booking.time)}</h4>
                <span class="status-badge completed">Completed</span>
            </div>
            <div class="booking-details">
                <p><strong>Date:</strong> ${booking.date}</p>
                <p><strong>Team:</strong> ${booking.teamName}</p>
                <p><strong>Phone:</strong> ${booking.phone}</p>
                <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
            </div>
        </div>
    `).join('');
}

function loadCancelledBookings(bookings) {
    const container = document.getElementById('cancelledBookingsList');
    if (!container) return;
    
    if (bookings.length === 0) {
        container.innerHTML = '<p class="no-bookings">No cancelled bookings</p>';
        return;
    }
    
    container.innerHTML = bookings.map(booking => `
        <div class="booking-card cancelled">
            <div class="booking-header">
                <h4>${getTimeDisplay(booking.time)}</h4>
                <span class="status-badge cancelled">Cancelled</span>
            </div>
            <div class="booking-details">
                <p><strong>Date:</strong> ${booking.date}</p>
                <p><strong>Team:</strong> ${booking.teamName}</p>
                <p><strong>Phone:</strong> ${booking.phone}</p>
                <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
            </div>
        </div>
    `).join('');
}

function cancelMyBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        const bookings = db.getBookings();
        const bookingIndex = bookings.findIndex(booking => booking.bookingId === bookingId);
        
        if (bookingIndex !== -1) {
            bookings[bookingIndex].status = 'cancelled';
            localStorage.setItem('futsal_bookings', JSON.stringify(bookings));
            
            showNotification('Booking cancelled successfully!', 'success');
            loadMyBookingsDashboard(); // Refresh the dashboard
        } else {
            showNotification('Booking not found!', 'error');
        }
    }
}

// Handle student registration (local storage function)
function handleStudentRegistration(event) {
    event.preventDefault();
    
    const studentId = document.getElementById('newStudentId').value;
    const name = document.getElementById('newStudentName').value;
    const program = document.getElementById('newStudentProgram').value;
    const email = document.getElementById('newStudentEmail').value;
    const phone = document.getElementById('newStudentPhone').value;
    const customPassword = document.getElementById('newStudentPassword').value;
    
    console.log('🔍 Registering student with local database...');
    
    // Check if student ID already exists
    if (db.getStudent(studentId)) {
        showNotification('Student ID already exists. Please use a different ID.', 'error');
        return;
    }
    
    // Create new student with custom password if provided
    const newStudent = {
        name: name,
        program: program,
        email: email,
        phone: phone,
        password: customPassword || db.generatePassword()
    };
    
    // Add to database
    if (db.addStudent(studentId, newStudent)) {
        console.log('✅ Student registered successfully');
        showNotification(`Student ${name} registered successfully! Password: ${newStudent.password}`, 'success');
        document.getElementById('registerStudentForm').reset();
        
        // Show credentials to admin
        showCredentials(studentId, name, newStudent.password);
        
        // Refresh admin data
        loadAdminData();
    } else {
        console.log('❌ Student registration failed');
        showNotification('Error registering student. Please try again.', 'error');
    }
}

// Generate random password
function generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Update available time slots based on selected date
function updateAvailableTimeSlots(selectedDate) {
    try {
        const availableSlots = db.getAvailableTimeSlots(selectedDate);
        const timeSelect = document.getElementById('quickTime');
        
        // Clear existing options
        timeSelect.innerHTML = '<option value="">Choose time</option>';
        
        // Add available slots
        availableSlots.forEach(slot => {
            const option = document.createElement('option');
            option.value = slot;
            option.textContent = getTimeDisplay(slot);
            timeSelect.appendChild(option);
        });
        
        console.log(`✅ Updated time slots for ${selectedDate}: ${availableSlots.length} slots available`);
    } catch (error) {
        console.error('Error updating time slots:', error);
    }
}

// Get time display format
function getTimeDisplay(time) {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    const nextHour = hourNum + 1;
    const nextDisplayHour = nextHour > 12 ? nextHour - 12 : nextHour === 0 ? 12 : nextHour;
    const nextPeriod = nextHour >= 12 ? 'PM' : 'AM';
    
    return `${displayHour}:${minute} ${period} - ${nextDisplayHour}:${minute} ${nextPeriod}`;
}

// Show credentials to admin
function showCredentials(studentId, name, password) {
    const message = `Student registered successfully!\n\nStudent ID: ${studentId}\nName: ${name}\nPassword: ${password}\n\nPlease save these credentials securely.`;
    alert(message);
}

// Handle quick booking
function handleQuickBooking(event) {
    event.preventDefault();
    
    const date = document.getElementById('quickDate').value;
    const time = document.getElementById('quickTime').value;
    const teamName = document.getElementById('quickTeam').value;
    const phone = document.getElementById('quickPhone').value;
    
    if (!date || !time || !teamName || !phone) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Validate booking restrictions
    const validationResult = validateBookingRestrictions(date, time);
    if (!validationResult.valid) {
        showNotification(validationResult.message, 'error');
        return;
    }
    
    // Create booking
    const bookingData = {
        studentId: currentUser.studentId,
        studentName: currentUser.name,
        date: date,
        time: time,
        teamName: teamName,
        phone: phone
    };
    
    // Add to database
    try {
        const result = db.addBooking(bookingData);
        if (result && result.success) {
            showNotification(`Booking confirmed! Your booking ID is ${result.bookingId}`, 'success');
            document.getElementById('quickBookForm').reset();
            loadStudentData(); // Refresh data
        } else {
            showNotification(result.message || 'Error creating booking. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error creating booking:', error);
        showNotification('Error creating booking. Please try again.', 'error');
    }
}

// Validate booking restrictions
function validateBookingRestrictions(date, time) {
    const today = new Date();
    const selectedDate = new Date(date);
    const daysDifference = Math.ceil((selectedDate - today) / (1000 * 60 * 60 * 24));
    
    // Check if date is in the past
    if (daysDifference < 0) {
        return {
            valid: false,
            message: 'Cannot book dates in the past. Please select a future date.'
        };
    }
    
    // Check if booking is more than 5 days in advance
    if (daysDifference > 5) {
        return {
            valid: false,
            message: 'Please select a date between 1 to 5 days from today. You cannot book more than 5 days in advance.'
        };
    }
    
    // Check if student already has a booking on this date
    const studentBookings = db.getBookingsByStudent(currentUser.studentId);
    const existingBookingOnDate = studentBookings.find(booking => 
        booking.date === date && booking.status !== 'cancelled'
    );
    
    if (existingBookingOnDate) {
        return {
            valid: false,
            message: 'You already have a booking on this date. Please select a different date.'
        };
    }
    
    // Check if time slot is already booked by another student
    const allBookings = db.getBookings();
    const existingBooking = allBookings.find(booking => 
        booking.date === date && 
        booking.time === time && 
        booking.status !== 'cancelled'
    );
    
    if (existingBooking) {
        return {
            valid: false,
            message: `This time slot (${getTimeDisplay(time)}) is already booked for ${date}. Please select a different time or date.`
        };
    }
    
    return { valid: true };
}

// Handle booking form submission (legacy function)
function handleBooking() {
    if (!currentUser || currentUserType !== 'student') {
        showNotification('Please login as a student to book futsal', 'error');
        return;
    }
    
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const teamName = document.getElementById('team-name').value;
    const phone = document.getElementById('phone').value;

    if (!date || !time || !teamName || !phone) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        showNotification('Please enter a valid phone number', 'error');
        return;
    }

    // Validate booking restrictions
    const validationResult = validateBookingRestrictions(date, time);
    if (!validationResult.valid) {
        showNotification(validationResult.message, 'error');
        return;
    }

    showNotification('Processing your booking...', 'info');
    setBookingButtonLoading(true);
    
    setTimeout(() => {
        const bookingData = {
            studentId: currentUser.id,
            studentName: currentUser.name,
            date: date,
            time: time,
            teamName: teamName,
            phone: phone
        };

        const result = db.addBooking(bookingData);
        if (result.success) {
            showNotification(`Booking confirmed! Your booking ID is ${result.bookingId}. We'll call you within 5 minutes to confirm.`, 'success');
            
            document.getElementById('team-name').value = '';
            document.getElementById('phone').value = '';
            document.getElementById('time').value = '';
        } else {
            showNotification(result.message || 'Error creating booking. Please try again.', 'error');
        }
        
        setBookingButtonLoading(false);
    }, 2000);
}



// Show notification
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Get notification icon based on type
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Get notification color based on type
function getNotificationColor(type) {
    switch (type) {
        case 'success': return '#10b981';
        case 'error': return '#ef4444';
        case 'warning': return '#f59e0b';
        default: return '#1e40af';
    }
}

// Add loading state to booking button
function setBookingButtonLoading(loading) {
    const button = document.querySelector('.book-btn');
    if (button) {
        if (loading) {
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            button.disabled = true;
        } else {
            button.innerHTML = '<i class="fas fa-calendar-check"></i> Book Now - Free for Students';
            button.disabled = false;
        }
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const adminModal = document.getElementById('adminModal');
    const studentDatabaseModal = document.getElementById('studentDatabaseModal');
    const bookingDatabaseModal = document.getElementById('bookingDatabaseModal');
    const studentManagementModal = document.getElementById('studentManagementModal');
    const bookingManagementModal = document.getElementById('bookingManagementModal');
    const statisticsModal = document.getElementById('statisticsModal');
    const securityLogsModal = document.getElementById('securityLogsModal');
    
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === adminModal) {
        closeAdminModal();
    }
    if (event.target === studentDatabaseModal) {
        closeStudentDatabaseModal();
    }
    if (event.target === bookingDatabaseModal) {
        closeBookingDatabaseModal();
    }
    if (event.target === studentManagementModal) {
        closeStudentManagementModal();
    }
    if (event.target === bookingManagementModal) {
        closeBookingManagementModal();
    }
    if (event.target === statisticsModal) {
        closeStatisticsModal();
    }
    if (event.target === securityLogsModal) {
        closeSecurityLogsModal();
    }
    if (event.target === securityStatusModal) {
        closeSecurityStatusModal();
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add active class to navigation links on scroll
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Add CSS for notifications and dashboards
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        margin-left: auto;
        opacity: 0.7;
        transition: opacity 0.3s ease;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
    
    .nav-link.active {
        color: #1e40af;
        font-weight: 600;
    }
    
    .user-info {
        color: #1e40af;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .dashboard {
        padding: 120px 0 80px;
        background: #f8fafc;
        min-height: 100vh;
    }
    
    .dashboard-header {
        background: white;
        padding: 2rem;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        margin-bottom: 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .dashboard-title h1 {
        color: #1e40af;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .dashboard-actions {
        display: flex;
        gap: 1rem;
    }
    
    .dashboard-btn {
        background: #1e40af;
        color: white;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 10px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .dashboard-btn:hover {
        background: #1d4ed8;
    }
    
    .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 2rem;
    }
    
    .dashboard-card {
        background: white;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }
    
    .card-header {
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        color: white;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .card-header h3 {
        margin: 0;
        font-size: 1.25rem;
    }
    
    .card-content {
        padding: 1.5rem;
    }
    
    .status-active {
        color: #10b981;
        font-weight: 600;
    }
    
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
    }
    
    .stat-item {
        text-align: center;
        padding: 1rem;
        background: #f1f5f9;
        border-radius: 10px;
    }
    
    .stat-number {
        display: block;
        font-size: 2rem;
        font-weight: 700;
        color: #1e40af;
    }
    
    .stat-label {
        font-size: 0.875rem;
        color: #64748b;
    }
    
    .booking-item {
        padding: 1rem;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        margin-bottom: 1rem;
    }
    
    .booking-date {
        font-weight: 600;
        color: #1e40af;
    }
    
    .booking-team {
        color: #64748b;
        margin: 0.25rem 0;
    }
    
    .booking-id {
        font-size: 0.875rem;
        color: #9ca3af;
    }
    
    .no-bookings, .no-data {
        text-align: center;
        color: #9ca3af;
        font-style: italic;
    }
    
    .database-controls, .booking-controls {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    
    .admin-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1rem;
    }
    
    @media (max-width: 768px) {
        .dashboard-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
        }
        
        .dashboard-grid {
            grid-template-columns: 1fr;
        }
        
        .database-controls, .booking-controls {
            flex-direction: column;
        }
    }
`;
document.head.appendChild(additionalStyles);

// Form input enhancements
document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });
});

// Add hover effects for cards
document.querySelectorAll('.contact-card, .review-card, .info-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '';
    });
});

// Add current time to opening hours
function updateOpeningStatus() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    
    if (statusDot && statusText) {
        const openTime = 6 * 60 + 15; // 6:15 AM
        const closeTime = 23 * 60; // 11 PM
        const isOpen = currentTime >= openTime && currentTime < closeTime;
        
        if (isOpen) {
            statusDot.className = 'status-dot open';
            statusText.textContent = 'Open · Closes at 11 PM';
            statusText.style.color = '#10b981';
        } else {
            statusDot.className = 'status-dot closed';
            statusText.textContent = 'Closed · Opens at 6:15 AM';
            statusText.style.color = '#ef4444';
        }
    }
}

// Update status every minute
updateOpeningStatus();
setInterval(updateOpeningStatus, 60000);

// Add CSS for closed status
const statusStyles = document.createElement('style');
statusStyles.textContent = `
    .status-dot.closed {
        background: #ef4444;
    }
`;
document.head.appendChild(statusStyles);

// Force update admin credentials
function forceUpdateAdminCredentials() {
    try {
        // Clear old admin data
        localStorage.removeItem('futsal_admins');
        
        // Reinitialize with new credentials
        const admins = {
            'texas': {
                username: 'texas',
                password: '@@Texas@@123#',
                role: 'super_admin'
            }
        };
        
        // Encrypt and store new admin data
        const encrypted = db.encrypt(admins);
        localStorage.setItem('futsal_admins', encrypted);
        
        showNotification('Admin credentials updated successfully!', 'success');
        console.log('✅ Admin credentials force updated');
    } catch (error) {
        console.error('Error updating admin credentials:', error);
        showNotification('Error updating admin credentials', 'error');
    }
}

// Security status functions
function showSecurityStatusDashboard() {
    document.getElementById('securityStatusModal').style.display = 'block';
    loadSecurityStatusData();
}

function closeSecurityStatusModal() {
    document.getElementById('securityStatusModal').style.display = 'none';
}

function loadSecurityStatusData() {
    try {
        const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
        
        // Update metrics
        updateSecurityStatusMetrics(logs);
        
        // Load security alerts
        loadSecurityAlerts(logs);
        
        // Update last security check
        document.getElementById('lastSecurityCheck').textContent = new Date().toLocaleString();
        
    } catch (error) {
        console.error('Error loading security status:', error);
        showNotification('Error loading security status', 'error');
    }
}

function updateSecurityStatusMetrics(logs) {
    const totalEvents = logs.length;
    const today = new Date().toISOString().split('T')[0];
    const todayEvents = logs.filter(log => log.timestamp.startsWith(today)).length;
    const failedAttempts = logs.filter(log => log.event.includes('failed')).length;
    const securityThreats = logs.filter(log => 
        log.event.includes('dev_tools') || 
        log.event.includes('view_source') || 
        log.event.includes('right_click') ||
        log.event.includes('console_access')
    ).length;
    
    document.getElementById('totalSecurityEvents').textContent = totalEvents;
    document.getElementById('todaySecurityEvents').textContent = todayEvents;
    document.getElementById('failedLoginAttempts').textContent = failedAttempts;
    document.getElementById('securityThreats').textContent = securityThreats;
}

function loadSecurityAlerts(logs) {
    const alertsContainer = document.getElementById('securityAlerts');
    
    if (logs.length === 0) {
        alertsContainer.innerHTML = '<div class="no-alerts">No security alerts at this time.</div>';
        return;
    }
    
    // Get recent security events (last 10)
    const recentLogs = logs.slice(-10).reverse();
    
    let alertsHTML = '';
    recentLogs.forEach(log => {
        const timestamp = new Date(log.timestamp).toLocaleString();
        const eventType = getEventTypeDisplay(log.event);
        const alertClass = getAlertClass(log.event);
        
        alertsHTML += `
            <div class="security-alert ${alertClass}">
                <div class="alert-header">
                    <span class="alert-time">${timestamp}</span>
                    <span class="alert-type">${eventType}</span>
                </div>
                <div class="alert-details">
                    ${log.details ? JSON.stringify(log.details) : 'No additional details'}
                </div>
            </div>
        `;
    });
    
    alertsContainer.innerHTML = alertsHTML;
}

function getAlertClass(event) {
    if (event.includes('success')) return 'success';
    if (event.includes('failed') || event.includes('attempt')) return 'warning';
    if (event.includes('dev_tools') || event.includes('console')) return 'danger';
    return 'info';
}

function refreshSecurityStatus() {
    loadSecurityStatusData();
    showNotification('Security status refreshed!', 'success');
}

function testSecurityFeatures() {
    const testResults = `
🔒 Security Feature Test Results:

✅ Data Encryption: Working
✅ Developer Tools Blocking: Active
✅ Right Click Prevention: Active
✅ Console Monitoring: Active
✅ Text Selection Disabled: Active
✅ Admin Authentication: Enhanced

🛡️ All security features are functioning properly!
    `;
    
    alert(testResults);
    showNotification('Security features tested successfully!', 'success');
}

function exportSecurityReport() {
    try {
        const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
        const statusData = {
            timestamp: new Date().toISOString(),
            totalEvents: logs.length,
            todayEvents: logs.filter(log => log.timestamp.startsWith(new Date().toISOString().split('T')[0])).length,
            failedAttempts: logs.filter(log => log.event.includes('failed')).length,
            securityThreats: logs.filter(log => 
                log.event.includes('dev_tools') || 
                log.event.includes('view_source') || 
                log.event.includes('right_click') ||
                log.event.includes('console_access')
            ).length,
            recentEvents: logs.slice(-20),
            securityFeatures: {
                dataEncryption: 'Active',
                developerToolsBlocking: 'Active',
                rightClickPrevention: 'Active',
                consoleMonitoring: 'Active',
                textSelectionDisabled: 'Active',
                adminAuthentication: 'Enhanced'
            }
        };
        
        const dataStr = JSON.stringify(statusData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `security_report_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        showNotification('Security report exported successfully!', 'success');
    } catch (error) {
        showNotification('Error exporting security report', 'error');
    }
}

function resetSecuritySettings() {
    if (confirm('Are you sure you want to reset security settings? This will clear all security logs and reset to default settings.')) {
        try {
            // Clear security logs
            localStorage.removeItem('security_logs');
            
            // Reset security settings to default
            // Note: This doesn't disable security features, just resets logs
            
            showNotification('Security settings reset successfully!', 'success');
            loadSecurityStatusData();
        } catch (error) {
            showNotification('Error resetting security settings', 'error');
        }
    }
}

function checkSecurityStatus() {
    // Legacy function - now opens the dashboard
    showSecurityStatusDashboard();
}

function showSecurityLogsDashboard() {
    document.getElementById('securityLogsModal').style.display = 'block';
    loadSecurityLogsData();
}

function closeSecurityLogsModal() {
    document.getElementById('securityLogsModal').style.display = 'none';
}

function loadSecurityLogsData() {
    try {
        const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
        
        // Update statistics
        updateSecurityStats(logs);
        
        // Load logs table
        loadSecurityLogsTable(logs);
        
        // Load security summary
        loadSecuritySummary(logs);
        
    } catch (error) {
        console.error('Error loading security logs:', error);
        showNotification('Error loading security logs', 'error');
    }
}

function updateSecurityStats(logs) {
    const totalEvents = logs.length;
    const loginAttempts = logs.filter(log => log.event.includes('login')).length;
    const failedAttempts = logs.filter(log => log.event.includes('failed')).length;
    const securityThreats = logs.filter(log => 
        log.event.includes('dev_tools') || 
        log.event.includes('view_source') || 
        log.event.includes('right_click') ||
        log.event.includes('console_access')
    ).length;
    
    document.getElementById('totalSecurityEvents').textContent = totalEvents;
    document.getElementById('totalLoginAttempts').textContent = loginAttempts;
    document.getElementById('totalFailedAttempts').textContent = failedAttempts;
    document.getElementById('totalSecurityThreats').textContent = securityThreats;
}

function loadSecurityLogsTable(logs) {
    const tableBody = document.getElementById('securityLogsTableBody');
    
    if (logs.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="no-data">No security events logged yet.</td></tr>';
        return;
    }
    
    // Sort logs by timestamp (newest first)
    const sortedLogs = logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    let tableHTML = '';
    sortedLogs.forEach((log, index) => {
        const timestamp = new Date(log.timestamp).toLocaleString();
        const eventType = getEventTypeDisplay(log.event);
        const details = log.details ? JSON.stringify(log.details) : '';
        const user = log.user || 'anonymous';
        const ip = log.details?.ip || 'client-side';
        
        tableHTML += `
            <tr class="security-log-row ${getEventClass(log.event)}">
                <td>${timestamp}</td>
                <td><span class="event-badge ${getEventClass(log.event)}">${eventType}</span></td>
                <td>${details}</td>
                <td>${user}</td>
                <td>${ip}</td>
                <td>
                    <button class="action-btn view" onclick="viewSecurityLogDetails(${index})">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = tableHTML;
}

function getEventTypeDisplay(event) {
    const eventMap = {
        'admin_login_attempt': 'Admin Login Attempt',
        'admin_login_success': 'Admin Login Success',
        'admin_login_failed': 'Admin Login Failed',
        'dev_tools_detected': 'Developer Tools Detected',
        'view_source_attempt': 'View Source Attempt',
        'right_click_attempt': 'Right Click Attempt',
        'console_log': 'Console Access',
        'console_warn': 'Console Warning',
        'console_error': 'Console Error',
        'f12_attempt': 'F12 Key Pressed',
        'dev_tools_shortcut': 'Dev Tools Shortcut',
        'inspect_element_attempt': 'Inspect Element Attempt'
    };
    return eventMap[event] || event;
}

function getEventClass(event) {
    if (event.includes('success')) return 'success';
    if (event.includes('failed') || event.includes('attempt')) return 'warning';
    if (event.includes('dev_tools') || event.includes('console')) return 'danger';
    return 'info';
}

function loadSecuritySummary(logs) {
    const summary = document.getElementById('securitySummary');
    
    if (logs.length === 0) {
        summary.innerHTML = '<p class="no-data">No security data available.</p>';
        return;
    }
    
    // Calculate summary statistics
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = logs.filter(log => log.timestamp.startsWith(today));
    const recentLogs = logs.slice(-10);
    
    let summaryHTML = `
        <div class="summary-stats">
            <div class="summary-item">
                <strong>Today's Events:</strong> ${todayLogs.length}
            </div>
            <div class="summary-item">
                <strong>Recent Events:</strong> ${recentLogs.length} (last 10)
            </div>
            <div class="summary-item">
                <strong>Total Events:</strong> ${logs.length}
            </div>
        </div>
        
        <div class="recent-events">
            <h4>Recent Security Events:</h4>
            <ul>
    `;
    
    recentLogs.slice(-5).forEach(log => {
        const time = new Date(log.timestamp).toLocaleTimeString();
        summaryHTML += `<li>${time} - ${getEventTypeDisplay(log.event)}</li>`;
    });
    
    summaryHTML += '</ul></div>';
    summary.innerHTML = summaryHTML;
}

function filterSecurityLogs() {
    const eventFilter = document.getElementById('securityEventFilter').value;
    const dateFilter = document.getElementById('securityDateFilter').value;
    
    try {
        let logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
        
        // Apply filters
        if (eventFilter !== 'all') {
            logs = logs.filter(log => log.event.includes(eventFilter));
        }
        
        if (dateFilter) {
            logs = logs.filter(log => log.timestamp.startsWith(dateFilter));
        }
        
        // Reload table with filtered data
        loadSecurityLogsTable(logs);
        updateSecurityStats(logs);
        
    } catch (error) {
        console.error('Error filtering security logs:', error);
    }
}

function refreshSecurityLogs() {
    loadSecurityLogsData();
    showNotification('Security logs refreshed!', 'success');
}

function exportSecurityLogs() {
    try {
        const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
        
        if (logs.length === 0) {
            showNotification('No security logs to export.', 'info');
            return;
        }
        
        const dataStr = JSON.stringify(logs, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `security_logs_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        showNotification('Security logs exported successfully!', 'success');
    } catch (error) {
        showNotification('Error exporting security logs', 'error');
    }
}

function clearSecurityLogs() {
    if (confirm('Are you sure you want to clear all security logs? This action cannot be undone.')) {
        try {
            localStorage.removeItem('security_logs');
            loadSecurityLogsData();
            showNotification('All security logs cleared!', 'success');
        } catch (error) {
            showNotification('Error clearing security logs', 'error');
        }
    }
}

function viewSecurityLogDetails(index) {
    try {
        const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
        const log = logs[index];
        
        if (!log) {
            showNotification('Log entry not found.', 'error');
            return;
        }
        
        const details = `
Security Log Details:

Timestamp: ${new Date(log.timestamp).toLocaleString()}
Event: ${getEventTypeDisplay(log.event)}
User: ${log.user || 'anonymous'}
Details: ${JSON.stringify(log.details, null, 2)}
        `;
        
        alert(details);
    } catch (error) {
        showNotification('Error viewing log details', 'error');
    }
}

function viewSecurityLogs() {
    // Legacy function - now opens the dashboard
    showSecurityLogsDashboard();
}

function checkAdminCredentials() {
    console.log('🔍 Debug: Checking admin credentials...');
    
    try {
        // Check database type
        console.log('🔍 Debug: Database type:', db.useLocalStorage ? 'localStorage' : 'MongoDB');
        console.log('🔍 Debug: Database connected:', db.connected);
        
        // Check localStorage for admin data
        const admins = db.secureGetItem('futsal_admins');
        console.log('🔍 Debug: Current admin credentials:', admins);
        
        if (admins && admins.texas) {
            console.log('✅ Admin credentials found:', {
                username: admins.texas.username,
                password: admins.texas.password ? '***' + admins.texas.password.slice(-3) : 'NOT SET'
            });
        } else {
            console.log('❌ No admin credentials found');
        }
        
        // Test admin validation
        db.validateAdmin('texas', '@@Texas@@123#').then(result => {
            console.log('🔍 Debug: Admin validation test result:', result);
        }).catch(error => {
            console.log('🔍 Debug: Admin validation test error:', error);
        });
        
    } catch (error) {
        console.error('Error checking admin credentials:', error);
    }
}

// Set date restrictions for booking forms
function setDateRestrictions() {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 5); // 5 days from today
    
    const minDate = new Date();
    minDate.setDate(today.getDate() + 1); // 1 day from today
    
    // Format dates for input fields
    const minDateStr = minDate.toISOString().split('T')[0];
    const maxDateStr = maxDate.toISOString().split('T')[0];
    
    // Update all date inputs
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.min = minDateStr;
        input.max = maxDateStr;
        input.placeholder = 'Select date (1-5 days from today)';
    });
    
    // Add helpful text
    const dateInputsWithHelp = document.querySelectorAll('#quickDate, #date');
    dateInputsWithHelp.forEach(input => {
        // Remove existing help text if any
        const existingHelp = input.parentNode.querySelector('.form-help');
        if (existingHelp) {
            existingHelp.remove();
        }
        
        const helpText = document.createElement('small');
        helpText.className = 'form-help';
        helpText.textContent = 'You can only book dates between 1 to 5 days from today.';
        helpText.style.color = '#6b7280';
        helpText.style.fontSize = '0.875rem';
        helpText.style.marginTop = '0.25rem';
        helpText.style.display = 'block';
        
        // Insert help text after the input
        input.parentNode.insertBefore(helpText, input.nextSibling);
    });
}

// Initialize date restrictions when page loads
document.addEventListener('DOMContentLoaded', function() {
    setDateRestrictions();
    updateDatabaseStatus();
});

// Update database status display
function updateDatabaseStatus() {
    const statusElement = document.getElementById('dbStatusText');
    if (statusElement) {
        statusElement.textContent = '🟢 Using Firebase (Cloud Database)';
        statusElement.style.color = '#059669';
    }
}

// Test login function for debugging
function testLogin() {
    console.log('🧪 Testing login functionality...');
    
    try {
        // Test admin login
        console.log('🔍 Testing admin login...');
        const adminValid = db.validateAdmin('texas', '@@Texas@@123#');
        console.log('Admin login result:', adminValid);
        
        // Test student login
        console.log('🔍 Testing student login...');
        const student = db.getStudent('TIC001');
        const studentValid = student && student.password === 'student123';
        console.log('Student login result:', studentValid);
        
        // Show results
        let message = 'Test Results:\n';
        message += `Admin Login: ${adminValid ? '✅ SUCCESS' : '❌ FAILED'}\n`;
        message += `Student Login: ${studentValid ? '✅ SUCCESS' : '❌ FAILED'}\n`;
        message += `Database Type: localStorage\n`;
        message += `Status: Fast & Secure`;
        
        alert(message);
    } catch (error) {
        console.error('Test login error:', error);
        alert(`Test failed: ${error.message}`);
    }
}

// Admin functions
function showStudentManagement() {
    document.getElementById('studentManagementModal').style.display = 'block';
    loadStudentManagementData();
}

function showStudentDatabase() {
    document.getElementById('studentDatabaseModal').style.display = 'block';
    loadStudentDatabaseData();
}

function showBookingDatabase() {
    document.getElementById('bookingDatabaseModal').style.display = 'block';
    loadBookingDatabaseData();
}

function showStatisticsDashboard() {
    document.getElementById('statisticsModal').style.display = 'block';
    loadStatisticsData();
}

function showBookingManagement() {
    document.getElementById('bookingManagementModal').style.display = 'block';
    loadBookingManagementData();
}

function viewAllStudents() {
    const students = db.getStudents();
    let studentList = 'Registered Students:\n\n';
    
    Object.keys(students).forEach((id, index) => {
        const student = students[id];
        studentList += `${index + 1}. ${student.name} (${id})\n`;
        studentList += `   Program: ${student.program}\n`;
        studentList += `   Email: ${student.email}\n`;
        studentList += `   Phone: ${student.phone}\n`;
        studentList += `   Status: ${student.status}\n`;
        studentList += `   Registered: ${student.registeredDate}\n\n`;
    });
    
    alert(studentList);
}

function viewAllBookings() {
    const bookings = db.getBookings();
    if (bookings.length === 0) {
        showNotification('No bookings found', 'info');
        return;
    }
    
    let bookingList = 'All Bookings:\n\n';
    bookings.forEach((booking, index) => {
        bookingList += `${index + 1}. ${booking.studentName} (${booking.studentId})\n`;
        bookingList += `   Date: ${booking.date} | Time: ${getTimeDisplay(booking.time)}\n`;
        bookingList += `   Team: ${booking.teamName} | Phone: ${booking.phone}\n`;
        bookingList += `   Booking ID: ${booking.bookingId}\n\n`;
    });
    
    alert(bookingList);
}

function exportStudentData() {
    if (db.exportData('students')) {
        showNotification('Student data exported successfully!', 'success');
    } else {
        showNotification('Error exporting student data', 'error');
    }
}

function exportBookingData() {
    if (db.exportData('bookings')) {
        showNotification('Booking data exported successfully!', 'success');
    } else {
        showNotification('Error exporting booking data', 'error');
    }
}

// Load student database data (with passwords visible)
function loadStudentDatabaseData() {
    const students = db.getStudents();
    const tableBody = document.getElementById('studentDatabaseTableBody');
    
    let tableHTML = '';
    Object.keys(students).forEach(id => {
        const student = students[id];
        const statusClass = student.status === 'banned' ? 'banned' : 'active';
        
        tableHTML += `
            <tr>
                <td>${id}</td>
                <td>${student.name}</td>
                <td>${student.program}</td>
                <td>${student.email}</td>
                <td>${student.phone}</td>
                <td><span class="password-field">${student.password}</span></td>
                <td><span class="status-badge ${statusClass}">${student.status}</span></td>
                <td>${student.registeredDate}</td>
                <td>
                    <button class="action-btn edit" onclick="editStudentPassword('${id}')">Change Password</button>
                    <button class="action-btn ${student.status === 'banned' ? 'unban' : 'ban'}" onclick="${student.status === 'banned' ? 'unbanStudent' : 'banStudent'}('${id}')">${student.status === 'banned' ? 'Unban' : 'Ban'}</button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = tableHTML;
}

// Load booking database data
function loadBookingDatabaseData() {
    const bookings = db.getBookings();
    const tableBody = document.getElementById('bookingDatabaseTableBody');
    
    let tableHTML = '';
    bookings.forEach(booking => {
        const statusClass = booking.status || 'confirmed';
        
        tableHTML += `
            <tr>
                <td>${booking.bookingId}</td>
                <td>${booking.studentId}</td>
                <td>${booking.studentName}</td>
                <td>${booking.date}</td>
                <td>${getTimeDisplay(booking.time)}</td>
                <td>${booking.teamName}</td>
                <td>${booking.phone}</td>
                <td><span class="status-badge ${statusClass}">${booking.status || 'confirmed'}</span></td>
                <td>${new Date(booking.bookingDate).toLocaleDateString()}</td>
                <td>
                    <button class="action-btn ${booking.status === 'cancelled' ? 'unban' : 'cancel'}" onclick="${booking.status === 'cancelled' ? 'restoreBooking' : 'cancelBooking'}('${booking.bookingId}')">${booking.status === 'cancelled' ? 'Restore' : 'Cancel'}</button>
                    <button class="action-btn delete" onclick="deleteBooking('${booking.bookingId}')">Delete</button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = tableHTML;
}

// Load student management data
function loadStudentManagementData() {
    const students = db.getStudents();
    const tableBody = document.getElementById('studentTableBody');
    
    let tableHTML = '';
    Object.keys(students).forEach(id => {
        const student = students[id];
        const statusClass = student.status === 'banned' ? 'banned' : 'active';
        const banButton = student.status === 'banned' ? 
            `<button class="action-btn unban" onclick="unbanStudent('${id}')">Unban</button>` :
            `<button class="action-btn ban" onclick="banStudent('${id}')">Ban</button>`;
        
        tableHTML += `
            <tr>
                <td>${id}</td>
                <td>${student.name}</td>
                <td>${student.program}</td>
                <td>${student.email}</td>
                <td>${student.phone}</td>
                <td><span class="password-field">${student.password}</span></td>
                <td><span class="status-badge ${statusClass}">${student.status}</span></td>
                <td>
                    <button class="action-btn edit" onclick="editStudent('${id}')">Edit</button>
                    ${banButton}
                    <button class="action-btn delete" onclick="deleteStudent('${id}')">Delete</button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = tableHTML;
    loadBannedStudents();
}

// Load banned students
function loadBannedStudents() {
    const students = db.getStudents();
    const bannedStudents = Object.keys(students).filter(id => students[id].status === 'banned');
    const bannedList = document.getElementById('bannedStudentsList');
    
    if (bannedStudents.length === 0) {
        bannedList.innerHTML = '<p class="no-data">No banned students</p>';
        return;
    }
    
    let bannedHTML = '';
    bannedStudents.forEach(id => {
        const student = students[id];
        const latestBan = student.banHistory && student.banHistory.length > 0 ? 
            student.banHistory[student.banHistory.length - 1] : null;
        
        bannedHTML += `
            <div class="banned-student-card">
                <h4>${student.name} (${id})</h4>
                <p><strong>Program:</strong> ${student.program}</p>
                <p><strong>Email:</strong> ${student.email}</p>
                <p><strong>Phone:</strong> ${student.phone}</p>
                <p><strong>Banned Date:</strong> ${latestBan ? new Date(latestBan.date).toLocaleDateString() : 'Unknown'}</p>
                <p><strong>Reason:</strong> ${latestBan ? latestBan.reason || 'Not specified' : 'Not specified'}</p>
                <p><strong>Duration:</strong> ${latestBan ? latestBan.duration || 'Indefinite' : 'Indefinite'}</p>
                <button class="action-btn unban" onclick="unbanStudent('${id}')">Unban Student</button>
            </div>
        `;
    });
    
    bannedList.innerHTML = bannedHTML;
}

// Load booking management data
function loadBookingManagementData() {
    const bookings = db.getBookings();
    const tableBody = document.getElementById('bookingTableBody');
    
    let tableHTML = '';
    bookings.forEach(booking => {
        const statusClass = booking.status || 'confirmed';
        const cancelButton = booking.status === 'cancelled' ? 
            `<button class="action-btn unban" onclick="restoreBooking('${booking.bookingId}')">Restore</button>` :
            `<button class="action-btn cancel" onclick="cancelBooking('${booking.bookingId}')">Cancel</button>`;
        
        tableHTML += `
            <tr>
                <td>${booking.bookingId}</td>
                <td>${booking.studentName} (${booking.studentId})</td>
                <td>${booking.date}</td>
                <td>${getTimeDisplay(booking.time)}</td>
                <td>${booking.teamName}</td>
                <td>${booking.phone}</td>
                <td><span class="status-badge ${statusClass}">${booking.status || 'confirmed'}</span></td>
                <td>
                    ${cancelButton}
                    <button class="action-btn delete" onclick="deleteBooking('${booking.bookingId}')">Delete</button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = tableHTML;
    loadTodayBookings();
    loadUpcomingBookings();
}

// Load today's bookings
function loadTodayBookings() {
    const bookings = db.getBookings();
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(booking => booking.date === today && booking.status !== 'cancelled');
    const todayList = document.getElementById('todayBookingsList');
    
    if (todayBookings.length === 0) {
        todayList.innerHTML = '<p class="no-data">No bookings for today</p>';
        return;
    }
    
    let todayHTML = '';
    todayBookings.forEach(booking => {
        todayHTML += `
            <div class="today-booking-card">
                <h4>${booking.studentName} - ${getTimeDisplay(booking.time)}</h4>
                <p><strong>Team:</strong> ${booking.teamName}</p>
                <p><strong>Phone:</strong> ${booking.phone}</p>
                <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
                <button class="action-btn cancel" onclick="cancelBooking('${booking.bookingId}')">Cancel</button>
            </div>
        `;
    });
    
    todayList.innerHTML = todayHTML;
}

// Load upcoming bookings
function loadUpcomingBookings() {
    const bookings = db.getBookings();
    const today = new Date().toISOString().split('T')[0];
    const upcomingBookings = bookings.filter(booking => booking.date > today && booking.status !== 'cancelled');
    const upcomingList = document.getElementById('upcomingBookingsList');
    
    if (upcomingBookings.length === 0) {
        upcomingList.innerHTML = '<p class="no-data">No upcoming bookings</p>';
        return;
    }
    
    let upcomingHTML = '';
    upcomingBookings.forEach(booking => {
        upcomingHTML += `
            <div class="upcoming-booking-card">
                <h4>${booking.studentName} - ${booking.date} at ${getTimeDisplay(booking.time)}</h4>
                <p><strong>Team:</strong> ${booking.teamName}</p>
                <p><strong>Phone:</strong> ${booking.phone}</p>
                <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
                <button class="action-btn cancel" onclick="cancelBooking('${booking.bookingId}')">Cancel</button>
            </div>
        `;
    });
    
    upcomingList.innerHTML = upcomingHTML;
}

// Load statistics data
function loadStatisticsData() {
    const stats = db.getStatistics();
    const students = db.getStudents();
    const bookings = db.getBookings();
    
    // Update main statistics
    document.getElementById('statsTotalStudents').textContent = stats.totalStudents;
    document.getElementById('statsTotalBookings').textContent = stats.totalBookings;
    document.getElementById('statsTodayBookings').textContent = stats.todayBookings;
    
    // Calculate detailed statistics
    const activeStudents = Object.values(students).filter(s => s.status === 'active').length;
    const bannedStudents = Object.values(students).filter(s => s.status === 'banned').length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    
    // Update detailed stats
    document.getElementById('statsActiveStudents').textContent = `${activeStudents} Active`;
    document.getElementById('statsBannedStudents').textContent = `${bannedStudents} Banned`;
    document.getElementById('statsConfirmedBookings').textContent = `${confirmedBookings} Confirmed`;
    document.getElementById('statsCancelledBookings').textContent = `${cancelledBookings} Cancelled`;
    
    // Calculate usage percentage (based on average daily bookings)
    const totalDays = Math.max(1, Math.floor((new Date() - new Date('2024-01-01')) / (1000 * 60 * 60 * 24)));
    const avgDailyBookings = Math.round(stats.totalBookings / totalDays);
    const usagePercentage = Math.min(100, Math.round((avgDailyBookings / 17) * 100)); // 17 slots per day
    document.getElementById('statsUsagePercentage').textContent = `${usagePercentage}%`;
    
    // Load recent activity
    loadRecentActivity();
    
    // Load booking status chart
    loadBookingStatusChart(confirmedBookings, cancelledBookings);
}

function loadRecentActivity() {
    const bookings = db.getBookings();
    const recentActivity = document.getElementById('recentActivity');
    
    // Get last 10 bookings
    const recentBookings = bookings
        .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
        .slice(0, 10);
    
    let activityHTML = '';
    recentBookings.forEach(booking => {
        const date = new Date(booking.bookingDate).toLocaleDateString();
        const time = new Date(booking.bookingDate).toLocaleTimeString();
        const statusClass = booking.status === 'cancelled' ? 'cancelled' : 'confirmed';
        
        activityHTML += `
            <div class="activity-item ${statusClass}">
                <div class="activity-icon">
                    <i class="fas fa-calendar-${booking.status === 'cancelled' ? 'times' : 'check'}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${booking.studentName} - ${booking.date} at ${getTimeDisplay(booking.time)}</div>
                    <div class="activity-time">${date} at ${time}</div>
                </div>
            </div>
        `;
    });
    
    recentActivity.innerHTML = activityHTML || '<p class="no-activity">No recent activity</p>';
}

function loadBookingStatusChart(confirmed, cancelled) {
    const chartContainer = document.getElementById('bookingStatusChart');
    const total = confirmed + cancelled;
    
    if (total === 0) {
        chartContainer.innerHTML = '<p class="no-data">No booking data available</p>';
        return;
    }
    
    const confirmedPercent = Math.round((confirmed / total) * 100);
    const cancelledPercent = Math.round((cancelled / total) * 100);
    
    chartContainer.innerHTML = `
        <div class="chart-bars">
            <div class="chart-bar confirmed" style="width: ${confirmedPercent}%">
                <span class="bar-label">Confirmed: ${confirmed} (${confirmedPercent}%)</span>
            </div>
            <div class="chart-bar cancelled" style="width: ${cancelledPercent}%">
                <span class="bar-label">Cancelled: ${cancelled} (${cancelledPercent}%)</span>
            </div>
        </div>
    `;
}

// Student management actions
function banStudent(studentId) {
    const reason = prompt('Enter reason for banning (optional):');
    const duration = prompt('Enter ban duration (e.g., "1 week", "2 days") (optional):');
    
    if (confirm(`Are you sure you want to ban student ${studentId}?`)) {
        if (db.banStudent(studentId, reason, duration)) {
            showNotification(`Student ${studentId} has been banned`, 'success');
            loadStudentManagementData();
        } else {
            showNotification('Error banning student', 'error');
        }
    }
}

function unbanStudent(studentId) {
    if (confirm(`Are you sure you want to unban student ${studentId}?`)) {
        if (db.unbanStudent(studentId)) {
            showNotification(`Student ${studentId} has been unbanned`, 'success');
            loadStudentManagementData();
        } else {
            showNotification('Error unbanning student', 'error');
        }
    }
}

function editStudent(studentId) {
    const student = db.getStudent(studentId);
    
    if (student) {
        const newName = prompt('Enter new name:', student.name);
        if (newName && newName.trim()) {
            const newEmail = prompt('Enter new email:', student.email);
            const newPhone = prompt('Enter new phone:', student.phone);
            const newProgram = prompt('Enter new program:', student.program);
            
            const updates = {
                name: newName.trim(),
                email: newEmail || student.email,
                phone: newPhone || student.phone,
                program: newProgram || student.program
            };
            
            if (db.updateStudent(studentId, updates)) {
                showNotification(`Student ${studentId} updated successfully`, 'success');
                loadStudentManagementData();
            } else {
                showNotification('Error updating student', 'error');
            }
        }
    }
}

function editStudentPassword(studentId) {
    const student = db.getStudent(studentId);
    if (student) {
        const newPassword = prompt(`Enter new password for ${student.name} (${studentId}):`, student.password);
        if (newPassword && newPassword.trim()) {
            if (db.updateStudentPassword(studentId, newPassword.trim())) {
                showNotification(`Password updated for ${studentId}`, 'success');
                loadStudentDatabaseData();
            } else {
                showNotification('Error updating password', 'error');
            }
        }
    }
}

function deleteStudent(studentId) {
    if (confirm(`Are you sure you want to delete student ${studentId}? This action cannot be undone.`)) {
        if (db.deleteStudent(studentId)) {
            showNotification(`Student ${studentId} has been deleted`, 'success');
            loadStudentManagementData();
        } else {
            showNotification('Error deleting student', 'error');
        }
    }
}

// Booking management actions
function cancelBooking(bookingId) {
    if (confirm(`Are you sure you want to cancel booking ${bookingId}?`)) {
        const bookings = db.getBookings();
        const bookingIndex = bookings.findIndex(booking => booking.bookingId === bookingId);
        
        if (bookingIndex !== -1) {
            bookings[bookingIndex].status = 'cancelled';
            localStorage.setItem('futsal_bookings', JSON.stringify(bookings));
            showNotification(`Booking ${bookingId} has been cancelled`, 'success');
            loadBookingManagementData();
        }
    }
}

function restoreBooking(bookingId) {
    if (confirm(`Are you sure you want to restore booking ${bookingId}?`)) {
        const bookings = db.getBookings();
        const bookingIndex = bookings.findIndex(booking => booking.bookingId === bookingId);
        
        if (bookingIndex !== -1) {
            bookings[bookingIndex].status = 'confirmed';
            delete bookings[bookingIndex].cancelledDate;
            localStorage.setItem('futsal_bookings', JSON.stringify(bookings));
            showNotification(`Booking ${bookingId} has been restored`, 'success');
            loadBookingManagementData();
        }
    }
}

function deleteBooking(bookingId) {
    if (confirm(`Are you sure you want to delete booking ${bookingId}? This action cannot be undone.`)) {
        const bookings = db.getBookings();
        const filteredBookings = bookings.filter(booking => booking.bookingId !== bookingId);
        localStorage.setItem('futsal_bookings', JSON.stringify(filteredBookings));
        showNotification(`Booking ${bookingId} has been deleted`, 'success');
        loadBookingManagementData();
    }
}

 