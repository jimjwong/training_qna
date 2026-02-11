// Chart.js configuration
const chartColors = ['#003d7a', '#ff6b35', '#4a90e2', '#27ae60', '#e74c3c', '#9b59b6', '#f39c12'];
let charts = {};

// Session start time
const sessionStart = Date.now();

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

// Format session name
function formatSessionName(sessionId) {
    const parts = sessionId.replace('session_', '').split('T');
    const date = parts[0];
    const time = parts[1].split('-').slice(0, 3).join(':');
    return `${date} ${time}`;
}

// Initialize dashboard
function initializeDashboard() {
    initializeStorage();
    updateSessionDisplay();
    updateStats();
    updateCharts();
    updateResponseList();
    startSessionTimer();
}

// Update session display
function updateSessionDisplay() {
    const sessionId = getCurrentSessionId();
    document.getElementById('currentSessionName').textContent = formatSessionName(sessionId);
}

// Get responses from localStorage (current session only)
function getResponses() {
    const allResponses = JSON.parse(localStorage.getItem('workshopResponses')) || [];
    const currentSessionId = getCurrentSessionId();
    return allResponses.filter(r => r.sessionId === currentSessionId);
}

// Get all sessions
function getAllSessions() {
    return JSON.parse(localStorage.getItem('workshopSessions')) || {};
}

// Update statistics
function updateStats() {
    const responses = getResponses();
    document.getElementById('totalResponses').textContent = responses.length;

    if (responses.length > 0) {
        const lastResponse = responses[responses.length - 1];
        const lastTime = new Date(lastResponse.timestamp);
        document.getElementById('lastResponse').textContent = formatTimeAgo(lastTime);
    } else {
        document.getElementById('lastResponse').textContent = '--';
    }
}

// Format time ago
function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return date.toLocaleDateString();
}

// Session timer
function startSessionTimer() {
    setInterval(() => {
        const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById('sessionTime').textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// Count answers
function countAnswers(responses, key) {
    const counts = {};
    responses.forEach(response => {
        const value = response[key];
        // Handle array values (for multiple selections like hope)
        if (Array.isArray(value)) {
            value.forEach(item => {
                counts[item] = (counts[item] || 0) + 1;
            });
        } else {
            counts[value] = (counts[value] || 0) + 1;
        }
    });
    return counts;
}

// Create or update chart
function createChart(canvasId, data, title) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Destroy existing chart if it exists
    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }

    const labels = Object.keys(data);
    const values = Object.values(data);
    const colors = labels.map((_, i) => chartColors[i % chartColors.length]);

    charts[canvasId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 3,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Create stats list
function createStatsList(containerId, data, total) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]);

    sortedData.forEach(([label, count]) => {
        const percentage = ((count / total) * 100).toFixed(1);
        const item = document.createElement('div');
        item.className = 'stat-item';
        item.innerHTML = `
            <span class="stat-item-label">${label}</span>
            <div class="stat-item-value">
                <span class="stat-count">${count}</span>
                <span class="stat-percentage">(${percentage}%)</span>
            </div>
        `;
        container.appendChild(item);
    });
}

// Update charts
function updateCharts() {
    const responses = getResponses();
    
    if (responses.length === 0) {
        ['roleChart', 'familiarityChart', 'hopeChart'].forEach(id => {
            const canvas = document.getElementById(id);
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = '16px Arial';
            ctx.fillStyle = '#999';
            ctx.textAlign = 'center';
            ctx.fillText('No data yet', canvas.width / 2, canvas.height / 2);
        });
        return;
    }

    const roleData = countAnswers(responses, 'role');
    const familiarityData = countAnswers(responses, 'familiarity');
    const hopeData = countAnswers(responses, 'hope');

    createChart('roleChart', roleData, 'Primary Role');
    createChart('familiarityChart', familiarityData, 'AI Familiarity');
    createChart('hopeChart', hopeData, 'Expected Takeaways');

    createStatsList('roleStats', roleData, responses.length);
    createStatsList('familiarityStats', familiarityData, responses.length);
    createStatsList('hopeStats', hopeData, responses.length);
}

// Update response list
function updateResponseList() {
    const responses = getResponses();
    const container = document.getElementById('responseList');
    
    if (responses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <h3>No responses yet</h3>
                <p>Responses will appear here as participants submit their answers</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    
    // Show most recent first
    const sortedResponses = [...responses].reverse();
    
    sortedResponses.forEach((response, index) => {
        const item = document.createElement('div');
        item.className = 'response-item';
        const responseTime = new Date(response.timestamp);
        
        item.innerHTML = `
            <div class="response-time">
                Response #${responses.length - index} • ${responseTime.toLocaleString()}
            </div>
            <div class="response-answers">
                <div class="response-answer">
                    <div class="response-answer-label">Primary Role</div>
                    <div class="response-answer-value">${response.role}</div>
                </div>
                <div class="response-answer">
                    <div class="response-answer-label">AI Familiarity</div>
                    <div class="response-answer-value">${response.familiarity}</div>
                </div>
                <div class="response-answer">
                    <div class="response-answer-label">Expected Takeaways</div>
                    <div class="response-answer-value">${Array.isArray(response.hope) ? response.hope.join(', ') : response.hope}</div>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

// Export to CSV
function exportToCSV() {
    const responses = getResponses();
    
    if (responses.length === 0) {
        alert('No data to export');
        return;
    }

    const sessionId = getCurrentSessionId();
    const headers = ['Timestamp', 'Primary Role', 'AI Familiarity', 'Expected Takeaways'];
    const rows = responses.map(r => [
        new Date(r.timestamp).toLocaleString(),
        r.role,
        r.familiarity,
        Array.isArray(r.hope) ? r.hope.join('; ') : r.hope
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workshop-${sessionId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Download JSON for current session
function downloadSessionJSON() {
    const sessionId = getCurrentSessionId();
    const sessions = getAllSessions();
    const sessionData = sessions[sessionId];
    
    if (!sessionData || sessionData.responses.length === 0) {
        alert('No data to download');
        return;
    }

    const json = JSON.stringify(sessionData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workshop-${sessionId}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Start new session
function startNewSession() {
    const currentResponses = getResponses();
    
    if (currentResponses.length === 0) {
        if (!confirm('Current session has no responses. Start a new session anyway?')) {
            return;
        }
    } else {
        if (!confirm(`Current session has ${currentResponses.length} response(s). Starting a new session will archive the current one. Continue?`)) {
            return;
        }
    }

    // Archive current session
    const currentSessionId = getCurrentSessionId();
    const sessions = getAllSessions();
    
    if (sessions[currentSessionId]) {
        sessions[currentSessionId].archived = true;
        sessions[currentSessionId].archivedAt = new Date().toISOString();
        localStorage.setItem('workshopSessions', JSON.stringify(sessions));
    }

    // Create new session
    const newSessionId = generateSessionId();
    localStorage.setItem('currentSessionId', newSessionId);
    
    // Initialize new session in sessions storage
    sessions[newSessionId] = {
        id: newSessionId,
        startTime: new Date().toISOString(),
        responses: [],
        archived: false
    };
    localStorage.setItem('workshopSessions', JSON.stringify(sessions));

    // Refresh dashboard
    initializeDashboard();
    alert('New session started successfully!');
}

// View all sessions
function viewSessions() {
    const sessions = getAllSessions();
    const modal = document.getElementById('sessionsModal');
    const container = document.getElementById('sessionsListContainer');
    
    const sessionsList = Object.values(sessions).sort((a, b) => 
        new Date(b.startTime) - new Date(a.startTime)
    );

    if (sessionsList.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">No sessions found</p>';
    } else {
        container.innerHTML = '<div class="sessions-list">' + sessionsList.map(session => {
            const isActive = session.id === getCurrentSessionId();
            const startDate = new Date(session.startTime).toLocaleString();
            const responseCount = session.responses?.length || 0;
            
            return `
                <div class="session-card ${isActive ? 'active' : ''}">
                    <div class="session-card-header">
                        <div class="session-title">${formatSessionName(session.id)}</div>
                        <span class="session-badge ${isActive ? 'active' : 'archived'}">${isActive ? 'Active' : 'Archived'}</span>
                    </div>
                    <div class="session-info-row">
                        <div class="session-info-item">
                            <div class="session-info-label">Started</div>
                            <div class="session-info-value">${startDate}</div>
                        </div>
                        <div class="session-info-item">
                            <div class="session-info-label">Responses</div>
                            <div class="session-info-value">${responseCount}</div>
                        </div>
                        ${session.archived ? `
                        <div class="session-info-item">
                            <div class="session-info-label">Archived</div>
                            <div class="session-info-value">${new Date(session.archivedAt).toLocaleString()}</div>
                        </div>
                        ` : ''}
                    </div>
                    <div class="session-actions">
                        ${!isActive ? `<button class="session-action-btn" onclick="loadSession('${session.id}')">Load Session</button>` : ''}
                        <button class="session-action-btn" onclick="downloadSessionData('${session.id}', 'json')">Download JSON</button>
                        <button class="session-action-btn" onclick="downloadSessionData('${session.id}', 'csv')">Download CSV</button>
                        ${!isActive ? `<button class="session-action-btn danger" onclick="deleteSession('${session.id}')">Delete</button>` : ''}
                    </div>
                </div>
            `;
        }).join('') + '</div>';
    }

    modal.style.display = 'flex';
}

// Close sessions modal
function closeSessionsModal() {
    document.getElementById('sessionsModal').style.display = 'none';
}

// Load a specific session
function loadSession(sessionId) {
    if (confirm('Switch to this session? (Current session will remain in the background)')) {
        localStorage.setItem('currentSessionId', sessionId);
        closeSessionsModal();
        initializeDashboard();
    }
}

// Download session data
function downloadSessionData(sessionId, format) {
    const sessions = getAllSessions();
    const session = sessions[sessionId];
    
    if (!session || !session.responses || session.responses.length === 0) {
        alert('No data to download');
        return;
    }

    if (format === 'json') {
        const json = JSON.stringify(session, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workshop-${sessionId}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    } else if (format === 'csv') {
        const headers = ['Timestamp', 'Primary Role', 'AI Familiarity', 'Expected Takeaways'];
        const rows = session.responses.map(r => [
            new Date(r.timestamp).toLocaleString(),
            r.role,
            r.familiarity,
            Array.isArray(r.hope) ? r.hope.join('; ') : r.hope
        ]);

        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.map(cell => `"${cell}"`).join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workshop-${sessionId}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}

// Delete session
function deleteSession(sessionId) {
    if (confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
        const sessions = getAllSessions();
        delete sessions[sessionId];
        localStorage.setItem('workshopSessions', JSON.stringify(sessions));
        
        // Also remove from responses array
        const allResponses = JSON.parse(localStorage.getItem('workshopResponses')) || [];
        const filteredResponses = allResponses.filter(r => r.sessionId !== sessionId);
        localStorage.setItem('workshopResponses', JSON.stringify(filteredResponses));
        
        viewSessions(); // Refresh the modal
    }
}

// Clear all data
function clearData() {
    alert('To clear data, please use the "New Session" button to start fresh, or delete individual sessions from "View Sessions".');
}

// Auto-refresh
function startAutoRefresh() {
    setInterval(() => {
        updateStats();
        updateCharts();
        updateResponseList();
    }, 5000); // Refresh every 5 seconds
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    startAutoRefresh();

    document.getElementById('newSessionBtn').addEventListener('click', startNewSession);
    document.getElementById('viewSessionsBtn').addEventListener('click', viewSessions);
    document.getElementById('refreshBtn').addEventListener('click', () => {
        initializeDashboard();
    });
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
    document.getElementById('downloadJsonBtn').addEventListener('click', downloadSessionJSON);

    // Close modal when clicking outside
    document.getElementById('sessionsModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeSessionsModal();
        }
    });
});
