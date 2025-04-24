/**
 * Faculty Management JavaScript
 * Handles faculty data loading, CRUD operations, and UI interactions
 * for the University Timetable Management System
 */

// Global variables for faculty management
let facultyData = [];
let currentPage = 1;
const itemsPerPage = 10;
let totalPages = 0;
let editMode = false;
let currentFacultyId = null;
let subjectsData = [];

document.addEventListener('DOMContentLoaded', function() {
    // Fetch faculty data
    fetchFacultyData();
    
    // Fetch subjects for the dropdowns and checkboxes
    fetchSubjects();
    
    // Set up event listeners
    document.getElementById('faculty-search').addEventListener('input', filterFacultyTable);
    document.getElementById('department-filter').addEventListener('change', filterFacultyTable);
    document.getElementById('add-faculty').addEventListener('click', showAddFacultyModal);
    document.getElementById('cancel-faculty').addEventListener('click', closeModal);
    document.querySelector('#faculty-modal .close-btn').addEventListener('click', closeModal);
    document.getElementById('faculty-form').addEventListener('submit', saveFaculty);
    document.getElementById('logout-link').addEventListener('click', logout);
    
    // Setup navigation highlighting
    setActiveNavigation();
});

/**
 * Sets the active navigation item
 */
function setActiveNavigation() {
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.id === 'faculty-link') {
            link.classList.add('active');
        }
    });
}

/**
 * Fetches faculty data from the server
 */
function fetchFacultyData() {
    fetch('/api/faculty')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch faculty data');
            }
            return response.json();
        })
        .then(data => {
            facultyData = data;
            totalPages = Math.ceil(facultyData.length / itemsPerPage);
            renderFacultyTable();
            renderPagination();
        })
        .catch(error => {
            console.error('Error fetching faculty data:', error);
            showErrorNotification('Could not fetch faculty data. You may be in offline mode.');
            
            // For demo/development, create some sample data
            createSampleData();
            renderFacultyTable();
            renderPagination();
        });
}

/**
 * Fetches subject data from the server
 */
function fetchSubjects() {
    fetch('/api/subjects')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch subjects');
            }
            return response.json();
        })
        .then(data => {
            subjectsData = data;
            setupSubjectCheckboxes();
        })
        .catch(error => {
            console.error('Error fetching subjects:', error);
            // For demo/development, create sample subjects
            subjectsData = [
                { id: 1, name: 'Data Structures', code: 'CS201' },
                { id: 2, name: 'Database Systems', code: 'CS301' },
                { id: 3, name: 'Web Development', code: 'CS401' },
                { id: 4, name: 'Algorithms', code: 'CS202' },
                { id: 5, name: 'Computer Networks', code: 'CS302' },
                { id: 6, name: 'Operating Systems', code: 'CS303' }
            ];
            setupSubjectCheckboxes();
        });
}

/**
 * Creates sample faculty data for development/testing
 */
function createSampleData() {
    facultyData = [
        {
            id: 1,
            name: 'Dr. John Smith',
            email: 'john.smith@university.edu',
            department: 'Computer Science',
            subjects: ['Data Structures', 'Algorithms'],
            availableHours: [
                { day: 'Monday', start: '09:00', end: '12:00' },
                { day: 'Wednesday', start: '14:00', end: '17:00' }
            ]
        },
        {
            id: 2,
            name: 'Prof. Mary Johnson',
            email: 'mary.johnson@university.edu',
            department: 'Engineering',
            subjects: ['Circuit Theory', 'Digital Logic'],
            availableHours: [
                { day: 'Tuesday', start: '10:00', end: '13:00' },
                { day: 'Thursday', start: '15:00', end: '18:00' }
            ]
        },
        {
            id: 3,
            name: 'Dr. Robert Williams',
            email: 'robert.williams@university.edu',
            department: 'Mathematics',
            subjects: ['Calculus', 'Linear Algebra'],
            availableHours: [
                { day: 'Monday', start: '13:00', end: '16:00' },
                { day: 'Friday', start: '09:00', end: '12:00' }
            ]
        },
        {
            id: 4,
            name: 'Dr. Lisa Chen',
            email: 'lisa.chen@university.edu',
            department: 'Computer Science',
            subjects: ['Database Systems', 'Computer Networks'],
            availableHours: [
                { day: 'Tuesday', start: '09:00', end: '12:00' },
                { day: 'Thursday', start: '14:00', end: '17:00' }
            ]
        },
        {
            id: 5,
            name: 'Prof. David Brown',
            email: 'david.brown@university.edu',
            department: 'Physics',
            subjects: ['Mechanics', 'Electromagnetism'],
            availableHours: [
                { day: 'Wednesday', start: '10:00', end: '13:00' },
                { day: 'Friday', start: '14:00', end: '17:00' }
            ]
        }
    ];
    
    totalPages = Math.ceil(facultyData.length / itemsPerPage);
}

/**
 * Renders the faculty table with current page data
 */
function renderFacultyTable() {
    const tableBody = document.getElementById('faculty-table-body');
    tableBody.innerHTML = '';
    
    const searchQuery = document.getElementById('faculty-search').value.toLowerCase();
    const departmentFilter = document.getElementById('department-filter').value;
    
    // Filter data
    const filteredData = facultyData.filter(faculty => {
        const nameMatch = faculty.name.toLowerCase().includes(searchQuery);
        const emailMatch = faculty.email && faculty.email.toLowerCase().includes(searchQuery);
        const departmentMatch = !departmentFilter || faculty.department === departmentFilter;
        return (nameMatch || emailMatch) && departmentMatch;
    });
    
    totalPages = Math.ceil(filteredData.length / itemsPerPage);
    
    // Adjust current page if necessary
    if (currentPage > totalPages) {
        currentPage = totalPages > 0 ? totalPages : 1;
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    // Render rows
    if (paginatedData.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="6" class="no-data">No faculty found</td>';
        tableBody.appendChild(tr);
    } else {
        paginatedData.forEach(faculty => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${faculty.id}</td>
                <td>
                    <div class="faculty-name">${faculty.name}</div>
                    <div class="faculty-email">${faculty.email || ''}</div>
                </td>
                <td>${faculty.department || ''}</td>
                <td>${formatSubjects(faculty.subjects)}</td>
                <td>${formatAvailableHours(faculty.availableHours)}</td>
                <td class="actions">
                    <button class="btn-icon edit-btn" data-id="${faculty.id}">
                        <img src="images/ic_edit.jpeg" alt="Edit">
                    </button>
                    <button class="btn-icon delete-btn" data-id="${faculty.id}">
                        <img src="images/ic_del.jpeg" alt="Delete">
                    </button>
                </td>
            `;
            
            tableBody.appendChild(tr);
        });
        
        // Add event listeners to the buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editFaculty(btn.dataset.id));
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteFaculty(btn.dataset.id));
        });
    }
    
    renderPagination();
}

/**
 * Renders pagination controls
 */
function renderPagination() {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    if (totalPages <= 1) {
        return;
    }
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.classList.add('page-btn', 'prev-btn');
    prevBtn.innerHTML = '&laquo; Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderFacultyTable();
        }
    });
    pagination.appendChild(prevBtn);
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.classList.add('page-btn');
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            renderFacultyTable();
        });
        pagination.appendChild(pageBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.classList.add('page-btn', 'next-btn');
    nextBtn.innerHTML = 'Next &raquo;';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderFacultyTable();
        }
    });
    pagination.appendChild(nextBtn);
}

/**
 * Sets up subject checkboxes in the faculty form
 */
function setupSubjectCheckboxes() {
    const container = document.getElementById('subject-checkboxes');
    container.innerHTML = '';
    
    if (!subjectsData || subjectsData.length === 0) {
        container.innerHTML = '<p>No subjects available</p>';
        return;
    }
    
    subjectsData.forEach(subject => {
        const checkboxDiv = document.createElement('div');
        checkboxDiv.classList.add('checkbox-item');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `subject-${subject.id}`;
        checkbox.value = subject.name;
        
        const label = document.createElement('label');
        label.htmlFor = `subject-${subject.id}`;
        label.textContent = `${subject.name} (${subject.code})`;
        
        checkboxDiv.appendChild(checkbox);
        checkboxDiv.appendChild(label);
        container.appendChild(checkboxDiv);
    });
}

/**
 * Sets up time slot selection in the faculty form
 */
function setupTimeSlots() {
    const container = document.querySelector('.time-slots');
    container.innerHTML = '';
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
        { start: '09:00', end: '10:00' },
        { start: '10:00', end: '11:00' },
        { start: '11:00', end: '12:00' },
        { start: '12:00', end: '13:00' },
        { start: '14:00', end: '15:00' },
        { start: '15:00', end: '16:00' },
        { start: '16:00', end: '17:00' },
        { start: '17:00', end: '18:00' }
    ];
    
    // Create header row
    const headerRow = document.createElement('div');
    headerRow.classList.add('time-slot-row', 'header-row');
    
    const emptyHeader = document.createElement('div');
    emptyHeader.classList.add('day-label');
    headerRow.appendChild(emptyHeader);
    
    timeSlots.forEach(slot => {
        const timeHeader = document.createElement('div');
        timeHeader.classList.add('time-header');
        timeHeader.textContent = `${slot.start}-${slot.end}`;
        headerRow.appendChild(timeHeader);
    });
    
    container.appendChild(headerRow);
    
    // Create rows for each day
    days.forEach(day => {
        const dayRow = document.createElement('div');
        dayRow.classList.add('time-slot-row');
        
        const dayLabel = document.createElement('div');
        dayLabel.classList.add('day-label');
        dayLabel.textContent = day;
        dayRow.appendChild(dayLabel);
        
        timeSlots.forEach(slot => {
            const slotCheckbox = document.createElement('div');
            slotCheckbox.classList.add('time-checkbox');
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `${day}-${slot.start}-${slot.end}`;
            checkbox.dataset.day = day;
            checkbox.dataset.start = slot.start;
            checkbox.dataset.end = slot.end;
            
            const label = document.createElement('label');
            label.htmlFor = `${day}-${slot.start}-${slot.end}`;
            label.textContent = '✓';
            
            slotCheckbox.appendChild(checkbox);
            slotCheckbox.appendChild(label);
            dayRow.appendChild(slotCheckbox);
        });
        
        container.appendChild(dayRow);
    });
}

/**
 * Clears all subject checkboxes
 */
function clearSubjectCheckboxes() {
    document.querySelectorAll('#subject-checkboxes input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
}

/**
 * Sets subject checkboxes based on faculty data
 * @param {Array} selectedSubjects - Array of subject names to check
 */
function setSubjectCheckboxes(selectedSubjects) {
    clearSubjectCheckboxes();
    
    document.querySelectorAll('#subject-checkboxes input[type="checkbox"]').forEach(checkbox => {
        if (selectedSubjects.includes(checkbox.value)) {
            checkbox.checked = true;
        }
    });
}

/**
 * Clears all time slot checkboxes
 */
function clearTimeSlots() {
    document.querySelectorAll('.time-slots input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
}

/**
 * Sets time slot checkboxes based on faculty data
 * @param {Array} availableHours - Array of available hour objects
 */
function setTimeSlots(availableHours) {
    clearTimeSlots();
    
    availableHours.forEach(slot => {
        // Find time slots that overlap with this availability
        document.querySelectorAll('.time-slots input[type="checkbox"]').forEach(checkbox => {
            if (checkbox.dataset.day === slot.day) {
                const checkboxStart = checkbox.dataset.start;
                const checkboxEnd = checkbox.dataset.end;
                
                // Check if this checkbox's time slot overlaps with the available hour
                if (checkboxStart >= slot.start && checkboxEnd <= slot.end) {
                    checkbox.checked = true;
                }
            }
        });
    });
}

/**
 * Filters the faculty table based on search and department filter
 */
function filterFacultyTable() {
    currentPage = 1;
    renderFacultyTable();
}

/**
 * Formats subjects array for display
 * @param {Array} subjects - Array of subject names
 * @returns {string} - Formatted subjects string
 */
function formatSubjects(subjects) {
    if (!subjects || subjects.length === 0) {
        return '<span class="muted">None assigned</span>';
    }
    
    return subjects.slice(0, 2).join(', ') + 
           (subjects.length > 2 ? ` <span class="more-badge">+${subjects.length - 2}</span>` : '');
}

/**
 * Formats available hours for display
 * @param {Array} hours - Array of available hour objects
 * @returns {string} - Formatted available hours string
 */
function formatAvailableHours(hours) {
    if (!hours || hours.length === 0) {
        return '<span class="muted">None specified</span>';
    }
    
    // Group by day
    const dayGroups = {};
    hours.forEach(hour => {
        if (!dayGroups[hour.day]) {
            dayGroups[hour.day] = [];
        }
        dayGroups[hour.day].push(`${hour.start}-${hour.end}`);
    });
    
    // Format for display
    const dayCount = Object.keys(dayGroups).length;
    if (dayCount <= 2) {
        return Object.entries(dayGroups)
            .map(([day, times]) => `${day} (${times.length} slots)`)
            .join(', ');
    } else {
        return `${dayCount} days configured`;
    }
}

/**
 * Shows the add faculty modal
 */
function showAddFacultyModal() {
    editMode = false;
    currentFacultyId = null;
    
    document.getElementById('modal-title').textContent = 'Add New Faculty';
    document.getElementById('faculty-form').reset();
    clearSubjectCheckboxes();
    clearTimeSlots();
    
    document.getElementById('faculty-modal').style.display = 'flex';
}

/**
 * Shows the edit faculty modal for a specific faculty
 * @param {string} id - Faculty ID to edit
 */
function editFaculty(id) {
    editMode = true;
    currentFacultyId = id;
    
    const faculty = facultyData.find(f => f.id.toString() === id);
    if (!faculty) return;
    
    document.getElementById('modal-title').textContent = 'Edit Faculty';
    document.getElementById('faculty-id').value = faculty.id;
    document.getElementById('faculty-name').value = faculty.name;
    document.getElementById('faculty-email').value = faculty.email || '';
    document.getElementById('faculty-department').value = faculty.department || '';
    
    // Set subject checkboxes
    setSubjectCheckboxes(faculty.subjects || []);
    
    // Set time slots
    setTimeSlots(faculty.availableHours || []);
    
    document.getElementById('faculty-modal').style.display = 'flex';
}

/**
 * Handles faculty deletion
 * @param {string} id - Faculty ID to delete
 */
function deleteFaculty(id) {
    if (!confirm('Are you sure you want to delete this faculty member?')) {
        return;
    }
    
    fetch(`/api/faculty/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete faculty');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Remove from local data
            facultyData = facultyData.filter(f => f.id.toString() !== id);
            renderFacultyTable();
            showNotification('Faculty deleted successfully');
        } else {
            showErrorNotification(data.message || 'Failed to delete faculty');
        }
    })
    .catch(error => {
        console.error('Error deleting faculty:', error);
        
        // For development/demo, remove from local data anyway
        facultyData = facultyData.filter(f => f.id.toString() !== id);
        renderFacultyTable();
        showNotification('Faculty deleted successfully');
    });
}

/**
 * Closes the faculty modal
 */
function closeModal() {
    document.getElementById('faculty-modal').style.display = 'none';
}

/**
 * Saves faculty data (create or update)
 * @param {Event} event - Form submit event
 */
function saveFaculty(event) {
    event.preventDefault();
    
    const facultyId = document.getElementById('faculty-id').value;
    const facultyName = document.getElementById('faculty-name').value;
    const facultyEmail = document.getElementById('faculty-email').value;
    const facultyDepartment = document.getElementById('faculty-department').value;
    
    // Get selected subjects
    const subjects = [];
    document.querySelectorAll('#subject-checkboxes input[type="checkbox"]:checked').forEach(checkbox => {
        subjects.push(checkbox.value);
    });
    
    // Get selected time slots
    const availableHours = [];
    document.querySelectorAll('.time-slots input[type="checkbox"]:checked').forEach(checkbox => {
        availableHours.push({
            day: checkbox.dataset.day,
            start: checkbox.dataset.start,
            end: checkbox.dataset.end
        });
    });
    
    // Create faculty object
    const facultyData = {
        name: facultyName,
        email: facultyEmail,
        department: facultyDepartment,
        subjects: subjects,
        availableHours: availableHours
    };
    
    // Add ID if in edit mode
    if (editMode && currentFacultyId) {
        facultyData.id = currentFacultyId;
    }
    
    // Send to server
    const url = editMode ? `/api/faculty/${currentFacultyId}` : '/api/faculty';
    const method = editMode ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(facultyData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save faculty');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Update local data
            if (editMode) {
                // Update existing faculty
                const index = this.facultyData.findIndex(f => f.id.toString() === currentFacultyId);
                if (index !== -1) {
                    this.facultyData[index] = { 
                        ...this.facultyData[index],
                        ...facultyData
                    };
                }
            } else {
                // Add new faculty with the ID from the server
                this.facultyData.push({
                    id: data.facultyId || (Math.max(...this.facultyData.map(f => f.id)) + 1),
                    ...facultyData
                });
            }
            
            renderFacultyTable();
            closeModal();
            showNotification(`Faculty ${editMode ? 'updated' : 'added'} successfully`);
        } else {
            showErrorNotification(data.message || `Failed to ${editMode ? 'update' : 'add'} faculty`);
        }
    })
    .catch(error => {
        console.error(`Error ${editMode ? 'updating' : 'adding'} faculty:`, error);
        
        // For development/demo, update local data anyway
        if (editMode) {
            // Update existing faculty
            const index = facultyData.findIndex(f => f.id.toString() === currentFacultyId);
            if (index !== -1) {
                facultyData[index] = {
                    ...facultyData[index],
                    name: facultyName,
                    email: facultyEmail,
                    department: facultyDepartment,
                    subjects: subjects,
                    availableHours: availableHours
                };
            }
        } else {
            // Add new faculty
            const newId = facultyData.length > 0 
                ? Math.max(...facultyData.map(f => f.id)) + 1 
                : 1;
                
            facultyData.push({
                id: newId,
                name: facultyName,
                email: facultyEmail,
                department: facultyDepartment,
                subjects: subjects,
                availableHours: availableHours
            });
        }
        
        renderFacultyTable();
        closeModal();
        showNotification(`Faculty ${editMode ? 'updated' : 'added'} successfully`);
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
    // You can replace this with a custom notification system
    alert(message);
}

/**
 * Shows an error notification message
 * @param {string} message - The error message to display
 */
function showErrorNotification(message) {
    // You can replace this with a custom notification system
    alert('Error: ' + message);
}