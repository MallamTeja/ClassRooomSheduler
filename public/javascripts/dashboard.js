/**
 * Dashboard JavaScript Controller
 * Handles dashboard data loading and UI interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Fetch dashboard stats from the server
    fetchDashboardStats();
    
    // Set up event listeners
    document.getElementById('generate-timetable').addEventListener('click', generateTimetable);
    document.getElementById('enforce-constraints').addEventListener('click', enforceConstraints);
    document.getElementById('logout-link').addEventListener('click', logout);
    
    // Set active navigation
    setActiveNavigation();
});

/**
 * Sets the active navigation item
 */
function setActiveNavigation() {
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.id === 'dashboard-link') {
            link.classList.add('active');
        }
    });
}

/**
 * Fetches dashboard statistics from the server
 */
function fetchDashboardStats() {
    fetch('/api/dashboard/stats')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch dashboard stats');
            }
            return response.json();
        })
        .then(data => {
            // Update the dashboard stats
            document.getElementById('classroom-count').textContent = data.classrooms || 0;
            document.getElementById('course-count').textContent = data.courses || 0;
            document.getElementById('semester-count').textContent = data.semesters || 0;
            document.getElementById('faculty-count').textContent = data.faculty || 0;
            
            // Check if user is logged in
            if (data.user) {
                document.getElementById('user-name').textContent = data.user.name;
            } else {
                // Redirect to login if not authenticated
                window.location.href = '/login.html';
            }
        })
        .catch(error => {
            console.error('Error fetching dashboard stats:', error);
            // Handle offline mode or display error notification
            showErrorNotification('Could not connect to server. You may be in offline mode.');
        });
}

/**
 * Initiates timetable generation process
 */
function generateTimetable() {
    window.location.href = '/timetable.html?action=generate';
}

/**
 * Enforces constraints on the timetable
 */
function enforceConstraints() {
    fetch('/api/timetable/enforce-constraints', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to enforce constraints');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showNotification('Constraints enforced successfully');
        } else {
            showErrorNotification('Failed to enforce constraints: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error enforcing constraints:', error);
        showErrorNotification('Could not enforce constraints. Please try again.');
    });
}

/**
 * Handles user logout
 */
function logout() {
    fetch('/api/auth/logout', {
        method: 'POST'
    })
    .then(() => {
        window.location.href = '/login.html';
    })
    .catch(error => {
        console.error('Logout error:', error);
        // Force redirect to login even if API call fails
        window.location.href = '/login.html';
    });
}

/**
 * Shows a notification message
 * @param {string} message - The message to display
 */
function showNotification(message) {
    // Implementation depends on your UI design
    alert(message);
}

/**
 * Shows an error notification message
 * @param {string} message - The error message to display
 */
function showErrorNotification(message) {
    // Implementation depends on your UI design
    alert('Error: ' + message);
}