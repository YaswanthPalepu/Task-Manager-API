const API_BASE = 'http://localhost:5000/api';
let currentTaskId = null;
let allTasks = [];

// Load tasks and stats on page load
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    loadStats();
});

// API Functions
async function loadTasks() {
    try {
        const response = await fetch(`${API_BASE}/tasks`);
        if (!response.ok) throw new Error('Failed to load tasks');
        
        allTasks = await response.json();
        displayTasks(allTasks);
        loadStats();
    } catch (error) {
        console.error('Error loading tasks:', error);
        alert('Failed to load tasks. Please try again.');
    }
}

async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/tasks/stats`);
        if (!response.ok) throw new Error('Failed to load stats');
        
        const stats = await response.json();
        document.getElementById('total-tasks').textContent = stats.total;
        document.getElementById('completed-tasks').textContent = stats.completed;
        document.getElementById('pending-tasks').textContent = stats.pending;
        document.getElementById('progress-tasks').textContent = stats.in_progress;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function saveTask(taskData) {
    try {
        const url = currentTaskId ? 
            `${API_BASE}/tasks/${currentTaskId}` : 
            `${API_BASE}/tasks`;
        
        const method = currentTaskId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData)
        });
        
        if (!response.ok) throw new Error('Failed to save task');
        
        return await response.json();
    } catch (error) {
        console.error('Error saving task:', error);
        throw error;
    }
}

async function deleteTask(taskId) {
    try {
        const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete task');
        
        return await response.json();
    } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
    }
}

// UI Functions
function displayTasks(tasks) {
    const tasksGrid = document.getElementById('tasks-grid');
    const emptyState = document.getElementById('empty-state');
    
    if (tasks.length === 0) {
        tasksGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    tasksGrid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    tasksGrid.innerHTML = tasks.map(task => `
        <div class="task-card priority-${task.priority}">
            <div class="task-header">
                <div>
                    <h3 class="task-title">${task.title}</h3>
                    <div class="task-meta">
                        <span class="badge status-${task.status}">${formatStatus(task.status)}</span>
                        <span class="badge priority-${task.priority}">${formatPriority(task.priority)}</span>
                    </div>
                </div>
            </div>
            <p class="task-description">${task.description || 'No description provided'}</p>
            ${task.due_date ? `<p style="color: #64748b; font-size: 0.875rem; margin-bottom: 1rem;">📅 Due: ${formatDate(task.due_date)}</p>` : ''}
            <div class="task-actions">
                <button class="btn btn-small" onclick="editTask(${task.id})">✏ Edit</button>
                <button class="btn btn-small ${task.status === 'completed' ? 'btn-secondary' : ''}" onclick="toggleTaskStatus(${task.id}, '${task.status}')">
                    ${task.status === 'completed' ? '↩ Reopen' : '✅ Complete'}
                </button>
                <button class="btn btn-small btn-danger" onclick="confirmDeleteTask(${task.id})">🗑 Delete</button>
            </div>
        </div>
    `).join('');
}

function filterTasks() {
    const statusFilter = document.getElementById('status-filter').value;
    const priorityFilter = document.getElementById('priority-filter').value;
    
    let filteredTasks = allTasks;
    
    if (statusFilter) {
        filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
    }
    
    if (priorityFilter) {
        filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }
    
    displayTasks(filteredTasks);
}

function formatStatus(status) {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatPriority(priority) {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Modal Functions
function openModal(task = null) {
    currentTaskId = task ? task.id : null;
    const modal = document.getElementById('task-modal');
    const title = document.getElementById('modal-title');
    
    title.textContent = task ? 'Edit Task' : 'Add New Task';
    
    if (task) {
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-status').value = task.status;
        document.getElementById('task-priority').value = task.priority;
        
        if (task.due_date) {
            const date = new Date(task.due_date);
            document.getElementById('task-due-date').value = date.toISOString().slice(0, 16);
        }
    } else {
        document.getElementById('task-form').reset();
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('task-modal').style.display = 'none';
    currentTaskId = null;
}

// Event Handlers
document.getElementById('task-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const taskData = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-description').value,
        status: document.getElementById('task-status').value,
        priority: document.getElementById('task-priority').value,
        due_date: document.getElementById('task-due-date').value || null
    };
    
    try {
        await saveTask(taskData);
        closeModal();
        await loadTasks();
        alert(currentTaskId ? 'Task updated successfully!' : 'Task created successfully!');
    } catch (error) {
        alert('Failed to save task. Please try again.');
    }
});

async function editTask(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    if (task) {
        openModal(task);
    }
}

async function toggleTaskStatus(taskId, currentStatus) {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    
    try {
        await fetch(`${API_BASE}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        await loadTasks();
    } catch (error) {
        alert('Failed to update task status.');
    }
}

async function confirmDeleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            await deleteTask(taskId);
            await loadTasks();
            alert('Task deleted successfully!');
        } catch (error) {
            alert('Failed to delete task. Please try again.');
        }
    }
}

function refreshTasks() {
    loadTasks();
}

// Add event listeners for buttons
document.addEventListener('DOMContentLoaded', function() {
    const addTaskBtn = document.getElementById('add-task-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => openModal());
    }
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshTasks);
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('task-modal');
    if (event.target === modal) {
        closeModal();
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        openModal();
    }
});