// Chart.js configuration
const chartColors = ['#003d7a', '#ff6b35', '#4a90e2', '#27ae60', '#e74c3c', '#9b59b6', '#f39c12'];
let charts = {};

// Session start time
const sessionStart = Date.now();

// Initialize dashboard
function initializeDashboard() {
    updateStats();
    updateCharts();
    updateResponseList();
    startSessionTimer();
}

// Get responses from localStorage
function getResponses() {
    return JSON.parse(localStorage.getItem('workshopResponses')) || [];
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
    a.download = `workshop-responses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Clear all data
function clearData() {
    if (confirm('Are you sure you want to clear all responses? This action cannot be undone.')) {
        localStorage.setItem('workshopResponses', JSON.stringify([]));
        initializeDashboard();
    }
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

    document.getElementById('refreshBtn').addEventListener('click', () => {
        initializeDashboard();
    });

    document.getElementById('exportBtn').addEventListener('click', exportToCSV);

    document.getElementById('clearBtn').addEventListener('click', clearData);
});
