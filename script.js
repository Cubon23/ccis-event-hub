"use strict";


const ADMIN_KEY = "12345678"; // <<-- Your Secret Access Code!
const AUTH_TOKEN_KEY = 'isAdminAuthenticated'; 


const loginForm = document.getElementById('login-form');
const adminLoginDiv = document.getElementById('admin-login');
const eventSubmissionPanel = document.getElementById('event-submission-panel');
const loginMessage = document.getElementById('login-message');
const logoutButton = document.getElementById('logout-btn');


const eventForm = document.getElementById('event-form');
const eventListContainer = document.getElementById('event-list');
const adminTableContainer = document.getElementById('admin-event-table-container'); 


function checkAdminStatus() {
    const isAuthenticated = localStorage.getItem(AUTH_TOKEN_KEY) === 'true';

    if (isAuthenticated) {
        
        adminLoginDiv.style.display = 'none';
        eventSubmissionPanel.style.display = 'block';
        renderAdminTable(); 
        
    } else {
        
        adminLoginDiv.style.display = 'block';
        eventSubmissionPanel.style.display = 'none';
        loginMessage.textContent = ''; 
    }
   
    renderEvents();
}


function handleLogin(e) {
    e.preventDefault(); 
    const enteredCode = document.getElementById('admin-code').value.trim();

    if (enteredCode === ADMIN_KEY) {
        localStorage.setItem(AUTH_TOKEN_KEY, 'true');
        document.getElementById('admin-code').value = ''; 
        checkAdminStatus();
    } else {
        loginMessage.textContent = 'Error: Invalid access code.';
    }
}


function handleLogout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    checkAdminStatus();
    alert('Logged out from Admin access.');
}

// C. Core Functions for Data Management
function getEvents() {
    const eventsJson = localStorage.getItem('campusEvents');
    return eventsJson ? JSON.parse(eventsJson) : [];
}

function saveEvents(events) {
    localStorage.setItem('campusEvents', JSON.stringify(events));
}

// D. Function to Display Events (STUDENT VIEW - READ ONLY LIST/CARDS)
function renderEvents() {
    const events = getEvents();
    eventListContainer.innerHTML = '';
    
    if (events.length === 0) {
        eventListContainer.innerHTML = '<p class="empty-message">No events scheduled. Check back soon!</p>';
        return;
    }

    // Sort events by date (upcoming first)
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    events.forEach((event) => {
        const dateObj = new Date(event.date);
        const formattedDate = dateObj.toLocaleDateString() + ' : ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        
        // Student View HTML (NO DELETE BUTTON)
        let cardHTML = `
            <div class="event-details">
                <h3>${event.title}</h3>
                <p><strong>When:</strong> ${formattedDate}</p>
                <p><strong>Where:</strong> ${event.location}</p>
                <p><strong>By:</strong> ${event.organizer}</p>
            </div>`;
        
        eventCard.innerHTML = cardHTML;
        eventListContainer.appendChild(eventCard);
    });
}


// E. Function to Display Events (ADMIN VIEW - MANAGEMENT TABLE)
function renderAdminTable() {
    const events = getEvents();
    adminTableContainer.innerHTML = ''; // Clear previous table

    if (events.length === 0) {
        adminTableContainer.innerHTML = '<p class="empty-message">No events to manage.</p>';
        return;
    }

    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Create the HTML table structure
    let tableHTML = `
        <table id="admin-event-table">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>`;
    
    events.forEach((event, index) => {
        const dateObj = new Date(event.date);
        const formattedDate = dateObj.toLocaleDateString();

        tableHTML += `
            <tr>
                <td class="admin-table-title">${event.title}</td>
                <td class="admin-table-date">${formattedDate}</td>
                <td><button class="delete-btn" data-index="${index}">Delete</button></td>
            </tr>`;
    });

    tableHTML += `</tbody></table>`;
    adminTableContainer.innerHTML = tableHTML;
}


// F. Function to Add New Event
function addEvent(e) {
    e.preventDefault(); 
    
    const title = document.getElementById('event-title').value.trim();
    const date = document.getElementById('event-date').value;
    const location = document.getElementById('event-location').value.trim();
    const organizer = document.getElementById('event-organizer').value.trim();
    
    if (!title || !date || !location || !organizer) {
        alert("Please fill in all event details.");
        return;
    }

    const newEvent = { title, date, location, organizer };

    const events = getEvents();
    events.push(newEvent);
    saveEvents(events);

    renderEvents();      // Update Student View
    renderAdminTable();  // Update Admin Table
    eventForm.reset();
}

// G. Function to Handle Event Deletion
function deleteEvent(index) {
    // Basic security check
    if (localStorage.getItem(AUTH_TOKEN_KEY) !== 'true') return; 
    
    if (!confirm("Are you sure you want to delete this event?")) return;

    const events = getEvents();
    events.splice(index, 1);
    saveEvents(events);
    
    renderEvents();      // Update Student View
    renderAdminTable();  // Update Admin View
}


// H. Event Listeners 
loginForm.addEventListener('submit', handleLogin);
logoutButton.addEventListener('click', handleLogout);
eventForm.addEventListener('submit', addEvent);

// Use event delegation on the Admin Table container for delete button clicks
adminTableContainer.addEventListener('click', function(e) {
    // Only respond if the element is a delete button and the user is authenticated
    if (e.target && e.target.classList.contains('delete-btn') && localStorage.getItem(AUTH_TOKEN_KEY) === 'true') {
        const indexToDelete = parseInt(e.target.dataset.index, 10);
        deleteEvent(indexToDelete);
    }
});

// Search Functionality
document.getElementById("search-input").addEventListener("keyup", function () {
    const filter = this.value.toLowerCase();
    const events = document.querySelectorAll(".event-card");

    events.forEach(event => {
        const text = event.innerText.toLowerCase();
        event.style.display = text.includes(filter) ? "flex" : "none";
    });
});

// I. Initialization: Start the application
checkAdminStatus();