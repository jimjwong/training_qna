// Initialize storage
function initializeStorage() {
    if (!localStorage.getItem('workshopResponses')) {
        localStorage.setItem('workshopResponses', JSON.stringify([]));
    }
    if (!localStorage.getItem('currentSessionId')) {
        const sessionId = generateSessionId();
        localStorage.setItem('currentSessionId', sessionId);
    }
    if (!localStorage.getItem('workshopSessions')) {
        localStorage.setItem('workshopSessions', JSON.stringify({}));
    }
}

// Generate session ID
function generateSessionId() {
    return 'session_' + new Date().toISOString().replace(/[:.]/g, '-');
}

// Get current session ID
function getCurrentSessionId() {
    return localStorage.getItem('currentSessionId');
}

// Save response
function saveResponse(data) {
    const responses = JSON.parse(localStorage.getItem('workshopResponses')) || [];
    const sessionId = getCurrentSessionId();
    
    const responseData = {
        ...data,
        timestamp: new Date().toISOString(),
        id: Date.now() + Math.random(),
        sessionId: sessionId
    };
    responses.push(responseData);
    localStorage.setItem('workshopResponses', JSON.stringify(responses));
    
    // Also save to file
    saveResponseToFile(responseData);
}

// Save response to downloadable JSON file
function saveResponseToFile(response) {
    const sessionId = getCurrentSessionId();
    const sessions = JSON.parse(localStorage.getItem('workshopSessions')) || {};
    
    if (!sessions[sessionId]) {
        sessions[sessionId] = {
            id: sessionId,
            startTime: response.timestamp,
            responses: []
        };
    }
    
    sessions[sessionId].responses.push(response);
    sessions[sessionId].lastUpdated = response.timestamp;
    
    localStorage.setItem('workshopSessions', JSON.stringify(sessions));
}

// Handle form submission
document.addEventListener('DOMContentLoaded', function() {
    initializeStorage();

    const form = document.getElementById('surveyForm');
    const successMessage = document.getElementById('successMessage');
    const hopeError = document.getElementById('hopeError');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(form);
        
        // Get multiple checkbox values for hope
        const hopeValues = [];
        const hopeCheckboxes = document.querySelectorAll('input[name="hope"]:checked');
        hopeCheckboxes.forEach(checkbox => {
            hopeValues.push(checkbox.value);
        });

        // Validate that at least one hope is selected
        if (hopeValues.length === 0) {
            hopeError.style.display = 'block';
            document.querySelector('input[name="hope"]').parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        hopeError.style.display = 'none';

        const responseData = {
            role: formData.get('role'),
            familiarity: formData.get('familiarity'),
            hope: hopeValues // Array of selected values
        };

        // Save response
        saveResponse(responseData);

        // Show success message
        successMessage.style.display = 'flex';

        // Reset form
        form.reset();

        // Hide success message after 3 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);
    });

    // Click outside success message to close
    successMessage.addEventListener('click', function(e) {
        if (e.target === successMessage) {
            successMessage.style.display = 'none';
        }
    });

    // Hide error when user selects a checkbox
    document.querySelectorAll('input[name="hope"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const anyChecked = document.querySelectorAll('input[name="hope"]:checked').length > 0;
            if (anyChecked) {
                hopeError.style.display = 'none';
            }
        });
    });
});
