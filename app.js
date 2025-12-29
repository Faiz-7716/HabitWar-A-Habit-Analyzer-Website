/* =====================================================
   HABITWAR - Core Application Logic
   ===================================================== */

// =====================================================
// CONFIGURATION & STATE
// =====================================================
const CONFIG = {
    STORAGE_KEYS: {
        HABITS: 'habitsData',
        COMPLETIONS: 'habitData',
        GRATITUDE: 'gratitudeData',
        THEME: 'habitWarTheme'
    },
    ICONS: {
        dumbbell: '💪', 'book-open': '📖', droplet: '💧', moon: '🌙',
        brain: '🧠', utensils: '🍽️', bike: '🚴', pencil: '✏️',
        code: '💻', music: '🎵'
    },
    // Use extended quotes from quotes.js, fallback to basic set
    QUOTES: (typeof MOTIVATIONAL_QUOTES !== 'undefined') ? MOTIVATIONAL_QUOTES : [
        { text: "The secret of your future is hidden in your daily routine.", author: "Mike Murdock" },
        { text: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
        { text: "Small disciplines repeated with consistency lead to great achievements.", author: "John Maxwell" },
        { text: "Motivation gets you going, but discipline keeps you growing.", author: "John Maxwell" },
        { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" }
    ]
};

let state = {
    currentPage: 'daily',
    habits: [],
    completions: {},
    gratitude: [],
    charts: {}
};

// =====================================================
// INITIALIZATION
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initializeUI();
    loadPage('daily');
    initParticles();
});

function loadData() {
    const habitsStr = localStorage.getItem(CONFIG.STORAGE_KEYS.HABITS);
    const completionsStr = localStorage.getItem(CONFIG.STORAGE_KEYS.COMPLETIONS);
    const gratitudeStr = localStorage.getItem(CONFIG.STORAGE_KEYS.GRATITUDE);
    
    state.habits = habitsStr ? JSON.parse(habitsStr) : [];
    state.completions = completionsStr ? JSON.parse(completionsStr) : {};
    state.gratitude = gratitudeStr ? JSON.parse(gratitudeStr) : [];
}

function saveData() {
    localStorage.setItem(CONFIG.STORAGE_KEYS.HABITS, JSON.stringify(state.habits));
    localStorage.setItem(CONFIG.STORAGE_KEYS.COMPLETIONS, JSON.stringify(state.completions));
    localStorage.setItem(CONFIG.STORAGE_KEYS.GRATITUDE, JSON.stringify(state.gratitude));
}
// =====================================================
// UI INITIALIZATION
// =====================================================
function initializeUI() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            switchDashboard(page);
        });
    });
    
    // Mobile menu
    const hamburger = document.getElementById('hamburgerMenu');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobileOverlay');
    const closeBtn = document.getElementById('closeSidebar');
    
    hamburger?.addEventListener('click', () => {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    });
    
    [overlay, closeBtn].forEach(el => {
        el?.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    });
    
    // Modals
    setupModals();
    
    // Theme toggle
    initializeTheme();
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    
    // Notifications
    initializeNotifications();
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// =====================================================
// NOTIFICATION SYSTEM
// =====================================================
function initializeNotifications() {
    const btn = document.getElementById('notificationsBtn');
    const dropdown = document.getElementById('notificationDropdown');
    const clearBtn = document.getElementById('clearAllNotifications');
    
    // Toggle dropdown
    btn?.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown?.classList.toggle('active');
        if (dropdown?.classList.contains('active')) {
            updateNotifications();
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.notification-wrapper')) {
            dropdown?.classList.remove('active');
        }
    });
    
    // Clear all notifications
    clearBtn?.addEventListener('click', () => {
        localStorage.setItem('notificationsDismissed', Date.now().toString());
        updateNotifications();
        showToast('Notifications cleared', 'success');
    });
    
    // Initial update
    updateNotifications();
}

function updateNotifications() {
    const list = document.getElementById('notificationList');
    const badge = document.getElementById('notificationBadge');
    const emptyState = document.getElementById('notificationEmpty');
    
    if (!list) return;
    
    const notifications = generateNotifications();
    
    // Update badge
    if (badge) {
        badge.textContent = notifications.length;
        badge.style.display = notifications.length > 0 ? 'flex' : 'none';
    }
    
    // Update list
    if (notifications.length === 0) {
        list.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
    } else {
        if (emptyState) emptyState.style.display = 'none';
        list.innerHTML = notifications.map(n => `
            <div class="notification-item" onclick="${n.action || ''}">
                <div class="notification-item-icon ${n.type}">
                    <i data-lucide="${n.icon}"></i>
                </div>
                <div class="notification-item-content">
                    <div class="notification-item-title">${n.title}</div>
                    <div class="notification-item-text">${n.text}</div>
                    <div class="notification-item-time">${n.time}</div>
                </div>
            </div>
        `).join('');
    }
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function generateNotifications() {
    const notifications = [];
    const today = getTodayString();
    const todayData = state.completions[today] || {};
    const dismissedTime = parseInt(localStorage.getItem('notificationsDismissed') || '0');
    const now = Date.now();
    
    // Only show notifications if not dismissed in last hour
    if (now - dismissedTime < 3600000) {
        return [];
    }
    
    // Pending habits
    const pendingHabits = state.habits.filter(h => !todayData[h.id]);
    if (pendingHabits.length > 0) {
        notifications.push({
            type: 'pending',
            icon: 'clock',
            title: 'Pending Habits',
            text: `You have ${pendingHabits.length} habit${pendingHabits.length > 1 ? 's' : ''} left to complete today.`,
            time: 'Today',
            action: "switchDashboard('daily')"
        });
    }
    
    // Streak notification
    const streak = calculateGlobalStreak();
    if (streak >= 3) {
        notifications.push({
            type: 'streak',
            icon: 'flame',
            title: `${streak} Day Streak! 🔥`,
            text: 'Keep up the momentum! Complete today\'s habits to extend your streak.',
            time: 'Now',
            action: ''
        });
    }
    
    // Motivational tip
    const tips = [
        'Start with your easiest habit to build momentum.',
        'Consistency beats perfection. Show up every day!',
        'Link new habits to existing routines.',
        'Celebrate small wins to stay motivated.',
        'Track your progress to see how far you\'ve come.'
    ];
    const tipIndex = new Date().getDay() % tips.length;
    notifications.push({
        type: 'tip',
        icon: 'lightbulb',
        title: 'Daily Tip',
        text: tips[tipIndex],
        time: 'Today',
        action: ''
    });
    
    // All habits completed
    if (pendingHabits.length === 0 && state.habits.length > 0) {
        notifications.unshift({
            type: 'success',
            icon: 'trophy',
            title: 'All Habits Complete! 🎉',
            text: 'Amazing work! You\'ve conquered all your habits today.',
            time: 'Just now',
            action: ''
        });
    }
    
    return notifications;
}


// =====================================================
// THEME MANAGEMENT
// =====================================================
function initializeTheme() {
    const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    applyTheme(theme);
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    applyTheme(newTheme);
    localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, newTheme);
    showToast(`Switched to ${newTheme} mode`, 'success');
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    } else {
        document.body.removeAttribute('data-theme');
    }
    
    updateThemeIcon(theme);
    updateParticlesForTheme(theme);
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    // Update the icon based on theme
    const iconName = theme === 'dark' ? 'sun' : 'moon';
    themeToggle.innerHTML = `<i data-lucide="${iconName}"></i>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function updateParticlesForTheme(theme) {
    if (typeof particlesJS === 'undefined') return;
    
    // Reinitialize particles with theme-appropriate colors
    const particleColor = theme === 'dark' ? '#c5ff00' : '#9acc00';
    const particleOpacity = theme === 'dark' ? 0.3 : 0.5;
    
    particlesJS('particles-js', {
        particles: {
            number: { value: 50 },
            color: { value: particleColor },
            opacity: { value: particleOpacity },
            size: { value: 2 },
            move: { enable: true, speed: 1 }
        }
    });
}

function setupModals() {
    const addModal = document.getElementById('addHabitModal');
    const editModal = document.getElementById('editHabitModal');
    
    // Close modals
    document.querySelectorAll('.modal-close, .modal-backdrop, #cancelAddHabit, #cancelEditHabit').forEach(el => {
        el?.addEventListener('click', closeAllModals);
    });
    
    // Add habit form
    document.getElementById('addHabitForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        addNewHabit();
    });
    
    // Edit habit form
    document.getElementById('editHabitForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        saveEditedHabit();
    });
    
    document.getElementById('deleteHabitBtn')?.addEventListener('click', deleteHabit);
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
}

function openAddHabitModal() {
    document.getElementById('addHabitForm')?.reset();
    document.getElementById('addHabitModal')?.classList.add('active');
}

function openEditHabitModal(habitId) {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;
    
    document.getElementById('editHabitId').value = habit.id;
    document.getElementById('editHabitName').value = habit.name;
    document.getElementById('editHabitIcon').value = habit.icon;
    document.getElementById('editHabitCategory').value = habit.category;
    document.getElementById('editHabitGoal').value = habit.goal;
    document.getElementById('editHabitModal')?.classList.add('active');
}

// =====================================================
// PAGE LOADING
// =====================================================
async function loadPage(page) {
    const container = document.getElementById('pageContent');
    const loading = document.getElementById('loadingState');
    const error = document.getElementById('errorState');
    
    loading.style.display = 'flex';
    container.innerHTML = '';
    error.style.display = 'none';
    
    try {
        const response = await fetch(`pages/${page}.html`);
        if (!response.ok) throw new Error('Page not found');
        
        const html = await response.text();
        container.innerHTML = html;
        loading.style.display = 'none';
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
        loadDashboard(page);
    } catch (err) {
        loading.style.display = 'none';
        error.style.display = 'flex';
        console.error('Error loading page:', err);
    }
}

function switchDashboard(page) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });
    
    // Close mobile menu
    document.getElementById('sidebar')?.classList.remove('active');
    document.getElementById('mobileOverlay')?.classList.remove('active');
    
    destroyCharts();
    state.currentPage = page;
    loadPage(page);
}

function destroyCharts() {
    Object.values(state.charts).forEach(chart => chart?.destroy?.());
    state.charts = {};
}

function loadDashboard(page) {
    switch(page) {
        case 'daily': loadDailyDashboard(); break;
        case 'analytics': loadAnalyticsDashboard(); break;
        case 'habits': loadHabitsPage(); break;
        case 'streaks': loadStreaksPage(); break;
        case 'gratitude': loadGratitudePage(); break;
    }
}

// =====================================================
// DAILY DASHBOARD
// =====================================================
function loadDailyDashboard() {
    const today = getTodayString();
    const todayData = state.completions[today] || {};
    
    const completed = state.habits.filter(h => todayData[h.id]).length;
    const total = state.habits.length;
    const pending = total - completed;
    const score = total > 0 ? Math.round((completed / total) * 100) : 0;
    const streak = calculateGlobalStreak();
    
    // Update stats
    setText('completedCount', completed);
    setText('pendingCount', pending);
    setText('currentStreak', streak);
    setText('dailyScore', `${score}%`);
    
    // Render habits list
    renderTodayHabits();
    
    // Create habit wheel chart
    createHabitWheelChart();
    
    // Set random quote
    setRandomQuote();
    
    // Add habit button
    document.getElementById('addHabitBtn')?.addEventListener('click', openAddHabitModal);
}

function renderTodayHabits() {
    const container = document.getElementById('todayHabitsList');
    if (!container) return;
    
    const today = getTodayString();
    const todayData = state.completions[today] || {};
    
    container.innerHTML = state.habits.map(habit => {
        const isCompleted = todayData[habit.id] || false;
        const streak = calculateHabitStreak(habit.id);
        const icon = CONFIG.ICONS[habit.icon] || '📌';
        
        return `
            <div class="habit-item ${isCompleted ? 'completed' : ''}" data-habit-id="${habit.id}">
                <div class="habit-main" onclick="toggleHabit(${habit.id})">
                    <div class="habit-checkbox">
                        <i data-lucide="check"></i>
                    </div>
                    <div class="habit-icon ${habit.category}">${icon}</div>
                    <div class="habit-info">
                        <span class="habit-name">${habit.name}</span>
                        <span class="habit-category">${habit.category}</span>
                    </div>
                    ${streak > 0 ? `<div class="habit-streak"><i data-lucide="flame"></i>${streak}</div>` : ''}
                </div>
                <div class="habit-actions">
                    <button class="habit-action-btn edit" onclick="event.stopPropagation(); openEditHabitModal(${habit.id})" title="Edit">
                        <i data-lucide="pencil"></i>
                    </button>
                    <button class="habit-action-btn delete" onclick="event.stopPropagation(); quickDeleteHabit(${habit.id})" title="Delete">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function toggleHabit(habitId) {
    const today = getTodayString();
    if (!state.completions[today]) state.completions[today] = {};
    
    state.completions[today][habitId] = !state.completions[today][habitId];
    saveData();
    
    // Update UI
    loadDailyDashboard();
    showToast(state.completions[today][habitId] ? 'Habit completed! 🎉' : 'Habit unchecked', 'success');
}

function createHabitWheelChart() {
    const canvas = document.getElementById('habitWheelChart');
    if (!canvas) return;
    
    const today = getTodayString();
    const todayData = state.completions[today] || {};
    
    const labels = state.habits.map(h => h.name);
    const data = state.habits.map(h => todayData[h.id] ? 100 : 30);
    const colors = state.habits.map(h => todayData[h.id] ? '#c5ff00' : '#334155');
    
    state.charts.habitWheel = new Chart(canvas, {
        type: 'polarArea',
        data: {
            labels,
            datasets: [{ data, backgroundColor: colors, borderWidth: 0 }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { r: { display: false } }
        }
    });
}

// =====================================================
// ANALYTICS DASHBOARD
// =====================================================
function loadAnalyticsDashboard() {
    setupAnalyticsTabs();
    loadWeeklyAnalytics();
}

function setupAnalyticsTabs() {
    document.querySelectorAll('#analyticsTabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#analyticsTabs .tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const tab = btn.dataset.tab;
            document.getElementById(`${tab}-content`)?.classList.add('active');
            
            destroyCharts();
            switch(tab) {
                case 'weekly': loadWeeklyAnalytics(); break;
                case 'monthly': loadMonthlyAnalytics(); break;
                case 'yearly': loadYearlyAnalytics(); break;
                case 'custom': setupCustomDateRange(); break;
            }
        });
    });
}

function loadWeeklyAnalytics() {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weekData = getWeekData();
    
    const canvas = document.getElementById('weeklyChart');
    if (canvas) {
        state.charts.weekly = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: days,
                datasets: [{
                    label: 'Completion %',
                    data: weekData.rates,
                    backgroundColor: '#c5ff00',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });
    }
    
    // Best/Worst day
    const maxIdx = weekData.rates.indexOf(Math.max(...weekData.rates));
    const minIdx = weekData.rates.indexOf(Math.min(...weekData.rates.filter(r => r > 0)));
    
    setText('bestDay', days[maxIdx] || '-');
    setText('worstDay', days[minIdx >= 0 ? minIdx : 0] || '-');
    
    const avg = weekData.rates.reduce((a, b) => a + b, 0) / 7;
    setText('weeklyAvgText', `${Math.round(avg)}% completion rate`);
    const avgBar = document.getElementById('weeklyAvgBar');
    if (avgBar) avgBar.style.width = `${avg}%`;
}

function getWeekData() {
    const rates = [];
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - dayOfWeek + i);
        const dateStr = formatDateString(date);
        const dayData = state.completions[dateStr] || {};
        
        const completed = state.habits.filter(h => dayData[h.id]).length;
        const rate = state.habits.length > 0 ? (completed / state.habits.length) * 100 : 0;
        rates.push(Math.round(rate));
    }
    
    return { rates };
}

function loadMonthlyAnalytics() {
    generateMonthlyHeatmap();
    createMonthlyTrendChart();
    calculateMonthlyStats();
}

function generateMonthlyHeatmap() {
    const container = document.getElementById('monthlyHeatmap');
    if (!container) return;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    setText('monthName', now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
    
    let html = '';
    // Empty cells for alignment
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="heatmap-day" style="opacity:0"></div>';
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = formatDateString(date);
        const dayData = state.completions[dateStr] || {};
        
        const completed = state.habits.filter(h => dayData[h.id]).length;
        const rate = state.habits.length > 0 ? completed / state.habits.length : 0;
        const level = rate === 0 ? 0 : rate < 0.25 ? 1 : rate < 0.5 ? 2 : rate < 0.75 ? 3 : 4;
        
        html += `<div class="heatmap-day level-${level}" title="${dateStr}: ${Math.round(rate*100)}%"></div>`;
    }
    
    container.innerHTML = html;
}

function createMonthlyTrendChart() {
    const canvas = document.getElementById('monthlyTrendChart');
    if (!canvas) return;
    
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const data = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(now.getFullYear(), now.getMonth(), day);
        const dateStr = formatDateString(date);
        const dayData = state.completions[dateStr] || {};
        const completed = state.habits.filter(h => dayData[h.id]).length;
        const rate = state.habits.length > 0 ? (completed / state.habits.length) * 100 : 0;
        data.push(Math.round(rate));
    }
    
    state.charts.monthlyTrend = new Chart(canvas, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Daily Rate',
                data,
                borderColor: '#c5ff00',
                backgroundColor: 'rgba(197, 255, 0, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });
}

function calculateMonthlyStats() {
    const now = new Date();
    let totalCompletions = 0, perfectDays = 0;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(now.getFullYear(), now.getMonth(), day);
        const dateStr = formatDateString(date);
        const dayData = state.completions[dateStr] || {};
        const completed = state.habits.filter(h => dayData[h.id]).length;
        totalCompletions += completed;
        if (completed === state.habits.length && state.habits.length > 0) perfectDays++;
    }
    
    const rate = state.habits.length > 0 ? Math.round((totalCompletions / (state.habits.length * now.getDate())) * 100) : 0;
    
    setText('monthlyCompletions', totalCompletions);
    setText('monthlyRate', `${rate}%`);
    setText('perfectDays', perfectDays);
    setText('monthlyBestStreak', calculateGlobalStreak());
}

function loadYearlyAnalytics() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const data = [];
    let totalDays = 0, totalHabits = 0;
    
    for (let m = 0; m <= now.getMonth(); m++) {
        let monthTotal = 0;
        const daysInMonth = new Date(now.getFullYear(), m + 1, 0).getDate();
        const maxDay = m === now.getMonth() ? now.getDate() : daysInMonth;
        
        for (let d = 1; d <= maxDay; d++) {
            const date = new Date(now.getFullYear(), m, d);
            const dateStr = formatDateString(date);
            const dayData = state.completions[dateStr] || {};
            monthTotal += state.habits.filter(h => dayData[h.id]).length;
            if (Object.keys(dayData).length > 0) totalDays++;
        }
        
        totalHabits += monthTotal;
        const rate = state.habits.length > 0 ? (monthTotal / (state.habits.length * maxDay)) * 100 : 0;
        data.push(Math.round(rate));
    }
    
    setText('yearlyDaysActive', totalDays);
    setText('yearlyHabitsDone', totalHabits);
    setText('yearlyLongestStreak', calculateGlobalStreak());
    setText('yearlyRate', `${Math.round(data.reduce((a,b) => a+b, 0) / data.length) || 0}%`);
    
    const canvas = document.getElementById('yearlyChart');
    if (canvas) {
        state.charts.yearly = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: months.slice(0, now.getMonth() + 1),
                datasets: [{ label: 'Completion %', data, backgroundColor: '#c5ff00', borderRadius: 8 }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, max: 100 } }
            }
        });
    }
}

function setupCustomDateRange() {
    const startInput = document.getElementById('startDate');
    const endInput = document.getElementById('endDate');
    const btn = document.getElementById('applyDateRange');
    
    if (startInput && endInput) {
        const today = new Date();
        endInput.value = formatDateString(today);
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        startInput.value = formatDateString(weekAgo);
    }
    
    btn?.addEventListener('click', analyzeCustomRange);
}

function analyzeCustomRange() {
    const start = new Date(document.getElementById('startDate').value);
    const end = new Date(document.getElementById('endDate').value);
    
    if (isNaN(start) || isNaN(end) || start > end) {
        showToast('Please select valid dates', 'error');
        return;
    }
    
    const results = document.getElementById('customRangeResults');
    results.style.display = 'block';
    
    let days = 0, completions = 0;
    const labels = [], data = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days++;
        const dateStr = formatDateString(d);
        const dayData = state.completions[dateStr] || {};
        const completed = state.habits.filter(h => dayData[h.id]).length;
        completions += completed;
        labels.push(d.getDate());
        data.push(state.habits.length > 0 ? Math.round((completed / state.habits.length) * 100) : 0);
    }
    
    const rate = state.habits.length > 0 ? Math.round((completions / (state.habits.length * days)) * 100) : 0;
    
    setText('customDays', days);
    setText('customCompletions', completions);
    setText('customRate', `${rate}%`);
    
    destroyCharts();
    const canvas = document.getElementById('customRangeChart');
    if (canvas) {
        state.charts.custom = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{ label: 'Daily %', data, borderColor: '#c5ff00', tension: 0.4, fill: true, backgroundColor: 'rgba(197,255,0,0.1)' }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } } }
        });
    }
}

// =====================================================
// HABITS PAGE
// =====================================================
function loadHabitsPage() {
    renderHabitsGrid();
    setupHabitsPageEvents();
}

function renderHabitsGrid() {
    const grid = document.getElementById('habitsGrid');
    const emptyState = document.getElementById('emptyHabitsState');
    
    if (!grid) return;
    
    const filter = document.querySelector('#categoryFilter .tab-btn.active')?.dataset.category || 'all';
    const filteredHabits = filter === 'all' ? state.habits : state.habits.filter(h => h.category === filter);
    
    if (filteredHabits.length === 0) {
        grid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    // Check view mode
    const isListView = localStorage.getItem('habitsViewMode') === 'list';
    grid.className = isListView ? 'habits-list-view' : 'habits-grid';
    if (emptyState) emptyState.style.display = 'none';
    
    if (isListView) {
        // List View
        grid.innerHTML = filteredHabits.map(habit => {
            const icon = CONFIG.ICONS[habit.icon] || '📌';
            const progress = calculateHabitMonthlyProgress(habit.id);
            const streak = calculateHabitStreak(habit.id);
            
            return `
                <div class="habit-list-item" onclick="openEditHabitModal(${habit.id})">
                    <div class="habit-list-icon ${habit.category}">${icon}</div>
                    <div class="habit-list-info">
                        <div class="habit-list-name">${habit.name}</div>
                        <div class="habit-list-meta">
                            <span class="habit-list-category">${habit.category}</span>
                            ${streak > 0 ? `<span class="habit-list-streak">🔥 ${streak} days</span>` : ''}
                        </div>
                    </div>
                    <div class="habit-list-progress">
                        <div class="progress-bar-mini">
                            <div class="progress-bar-fill" style="width: ${progress}%"></div>
                        </div>
                        <span class="habit-list-percent">${Math.round(progress)}%</span>
                    </div>
                    <div class="habit-list-goal">Goal: ${habit.goal} days</div>
                </div>
            `;
        }).join('');
    } else {
        // Grid View
        grid.innerHTML = filteredHabits.map(habit => {
            const icon = CONFIG.ICONS[habit.icon] || '📌';
            const progress = calculateHabitMonthlyProgress(habit.id);
            
            return `
                <div class="habit-card" onclick="openEditHabitModal(${habit.id})">
                    <div class="habit-card-header">
                        <div class="habit-card-icon ${habit.category}">${icon}</div>
                        <div>
                            <div class="habit-card-title">${habit.name}</div>
                            <div class="habit-card-category">${habit.category}</div>
                        </div>
                    </div>
                    <div class="habit-card-progress">
                        <div class="progress-bar">
                            <div class="progress-bar-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-label">
                            <span>${Math.round(progress)}% this month</span>
                            <span>Goal: ${habit.goal} days</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

function setupHabitsPageEvents() {
    document.getElementById('openAddHabitModal')?.addEventListener('click', openAddHabitModal);
    document.getElementById('emptyStateAddBtn')?.addEventListener('click', openAddHabitModal);
    
    // Category filter
    document.querySelectorAll('#categoryFilter .tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#categoryFilter .tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderHabitsGrid();
        });
    });
    
    // View toggle
    const toggleBtn = document.getElementById('toggleViewBtn');
    if (toggleBtn) {
        updateViewToggleButton();
        toggleBtn.addEventListener('click', toggleHabitsView);
    }
}

function toggleHabitsView() {
    const currentMode = localStorage.getItem('habitsViewMode') || 'grid';
    const newMode = currentMode === 'grid' ? 'list' : 'grid';
    localStorage.setItem('habitsViewMode', newMode);
    updateViewToggleButton();
    renderHabitsGrid();
}

function updateViewToggleButton() {
    const toggleBtn = document.getElementById('toggleViewBtn');
    if (!toggleBtn) return;
    
    const isListView = localStorage.getItem('habitsViewMode') === 'list';
    toggleBtn.innerHTML = isListView 
        ? '<i data-lucide="layout-grid"></i> Grid View'
        : '<i data-lucide="list"></i> List View';
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}


function addNewHabit() {
    const name = document.getElementById('habitName').value.trim();
    const icon = document.getElementById('habitIcon').value;
    const category = document.getElementById('habitCategory').value;
    const goal = parseInt(document.getElementById('habitGoal').value) || 20;
    
    if (!name) { showToast('Please enter a habit name', 'error'); return; }
    
    const newId = state.habits.length > 0 ? Math.max(...state.habits.map(h => h.id)) + 1 : 1;
    state.habits.push({ id: newId, name, icon, category, goal });
    saveData();
    
    closeAllModals();
    showToast('Habit added successfully!', 'success');
    
    if (state.currentPage === 'habits') renderHabitsGrid();
    else if (state.currentPage === 'daily') loadDailyDashboard();
}

function saveEditedHabit() {
    const id = parseInt(document.getElementById('editHabitId').value);
    const habit = state.habits.find(h => h.id === id);
    if (!habit) return;
    
    habit.name = document.getElementById('editHabitName').value.trim();
    habit.icon = document.getElementById('editHabitIcon').value;
    habit.category = document.getElementById('editHabitCategory').value;
    habit.goal = parseInt(document.getElementById('editHabitGoal').value) || 20;
    
    saveData();
    closeAllModals();
    showToast('Habit updated!', 'success');
    
    if (state.currentPage === 'habits') renderHabitsGrid();
    else if (state.currentPage === 'daily') loadDailyDashboard();
}

function deleteHabit() {
    const id = parseInt(document.getElementById('editHabitId').value);
    if (!confirm('Are you sure you want to delete this habit?')) return;
    
    state.habits = state.habits.filter(h => h.id !== id);
    saveData();
    closeAllModals();
    showToast('Habit deleted', 'warning');
    
    if (state.currentPage === 'habits') renderHabitsGrid();
    else if (state.currentPage === 'daily') loadDailyDashboard();
}

// =====================================================
// STREAKS PAGE
// =====================================================
function loadStreaksPage() {
    const globalStreak = calculateGlobalStreak();
    setText('globalStreakCount', globalStreak);
    setText('longestStreak', globalStreak); // Simplified
    setText('totalPerfectDays', countPerfectDays());
    setText('streaksStarted', state.habits.length);
    
    setText('currentMonth', new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
    
    renderHabitStreaks();
    renderGoalsList();
    renderBadges();
    createStreakHistoryChart();
}

function renderHabitStreaks() {
    const container = document.getElementById('habitStreaksList');
    if (!container) return;
    
    container.innerHTML = state.habits.map(habit => {
        const streak = calculateHabitStreak(habit.id);
        const icon = CONFIG.ICONS[habit.icon] || '📌';
        
        return `
            <div style="display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md) 0; border-bottom: 1px solid var(--bg-tertiary);">
                <div class="habit-icon ${habit.category}">${icon}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 600;">${habit.name}</div>
                </div>
                <div class="streak-badge">
                    <i data-lucide="flame"></i>
                    ${streak} days
                </div>
            </div>
        `;
    }).join('');
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderGoalsList() {
    const container = document.getElementById('goalsList');
    if (!container) return;
    
    container.innerHTML = state.habits.map(habit => {
        const progress = calculateHabitMonthlyProgress(habit.id);
        const icon = CONFIG.ICONS[habit.icon] || '📌';
        
        return `
            <div style="margin-bottom: var(--space-md);">
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-xs);">
                    <span>${icon} ${habit.name}</span>
                    <span style="font-size: var(--font-size-xs); color: var(--text-secondary);">${Math.round(progress)}% of ${habit.goal} days</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-fill" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

function renderBadges() {
    const container = document.getElementById('badgesGrid');
    if (!container) return;
    
    const streak = calculateGlobalStreak();
    const badges = [
        { name: 'First Step', icon: '🎯', desc: 'Complete first habit', unlocked: countTotalCompletions() > 0 },
        { name: '3-Day Warrior', icon: '⚔️', desc: '3 day streak', unlocked: streak >= 3 },
        { name: 'Week Champion', icon: '🏆', desc: '7 day streak', unlocked: streak >= 7 },
        { name: 'Fortnight Fighter', icon: '🔥', desc: '14 day streak', unlocked: streak >= 14 },
        { name: 'Month Master', icon: '👑', desc: '30 day streak', unlocked: streak >= 30 }
    ];
    
    container.innerHTML = badges.map(badge => `
        <div style="text-align: center; padding: var(--space-md); background: ${badge.unlocked ? 'linear-gradient(135deg, rgba(197,255,0,0.1), rgba(16,185,129,0.1))' : 'var(--bg-tertiary)'}; border-radius: var(--radius-md); opacity: ${badge.unlocked ? 1 : 0.5};">
            <div style="font-size: 32px; margin-bottom: var(--space-sm);">${badge.icon}</div>
            <div style="font-weight: 600; font-size: var(--font-size-sm);">${badge.name}</div>
            <div style="font-size: var(--font-size-xs); color: var(--text-secondary);">${badge.desc}</div>
        </div>
    `).join('');
}

function createStreakHistoryChart() {
    const canvas = document.getElementById('streakHistoryChart');
    if (!canvas) return;
    
    const days = 14;
    const labels = [], data = [];
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        
        const dateStr = formatDateString(date);
        const dayData = state.completions[dateStr] || {};
        const completed = state.habits.filter(h => dayData[h.id]).length;
        data.push(completed);
    }
    
    state.charts.streakHistory = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [{ label: 'Habits Completed', data, backgroundColor: '#c5ff00', borderRadius: 6 }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: Math.max(state.habits.length, 5) } }
        }
    });
}

// =====================================================
// GRATITUDE PAGE
// =====================================================
function loadGratitudePage() {
    setText('totalEntries', state.gratitude.length);
    setText('monthlyEntries', countMonthlyGratitude());
    setText('journalStreak', calculateGratitudeStreak());
    setText('todayDate', new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
    
    setupGratitudeForm();
    renderGratitudeTimeline();
    createMoodChart();
}

function setupGratitudeForm() {
    // Mood selector
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });
    
    // Form submit
    document.getElementById('gratitudeForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        saveGratitudeEntry();
    });
}

function saveGratitudeEntry() {
    const mood = document.querySelector('.mood-btn.selected')?.dataset.mood || 'okay';
    const entry = document.getElementById('gratitudeEntry')?.value.trim();
    const highlight = document.getElementById('gratitudeHighlight')?.value.trim();
    
    if (!entry) { showToast('Please write what you are grateful for', 'error'); return; }
    
    state.gratitude.unshift({
        id: Date.now(),
        date: getTodayString(),
        mood,
        entry,
        highlight
    });
    
    saveData();
    showToast('Gratitude saved! 💚', 'success');
    
    // Reset form
    document.getElementById('gratitudeForm')?.reset();
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    
    loadGratitudePage();
}

function renderGratitudeTimeline() {
    const container = document.getElementById('gratitudeTimeline');
    const emptyState = document.getElementById('emptyGratitudeState');
    
    if (!container) return;
    
    if (state.gratitude.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    const moodEmoji = { amazing: '🤩', good: '😊', okay: '😐', low: '😔', tough: '😢' };
    
    container.innerHTML = state.gratitude.slice(0, 5).map(g => `
        <div class="gratitude-entry">
            <div class="date">${moodEmoji[g.mood] || '😊'} ${new Date(g.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
            <div class="content">${g.entry}</div>
            ${g.highlight ? `<div style="margin-top: var(--space-sm); font-size: var(--font-size-sm); color: var(--accent-lime-dark);">✨ ${g.highlight}</div>` : ''}
        </div>
    `).join('');
}

function createMoodChart() {
    const canvas = document.getElementById('moodChart');
    if (!canvas) return;
    
    const moodCounts = { amazing: 0, good: 0, okay: 0, low: 0, tough: 0 };
    state.gratitude.forEach(g => { if (moodCounts[g.mood] !== undefined) moodCounts[g.mood]++; });
    
    state.charts.mood = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Amazing', 'Good', 'Okay', 'Low', 'Tough'],
            datasets: [{
                data: Object.values(moodCounts),
                backgroundColor: ['#10b981', '#c5ff00', '#f59e0b', '#6366f1', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
        }
    });
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================
function getTodayString() { return formatDateString(new Date()); }

function formatDateString(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function calculateGlobalStreak() {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = formatDateString(date);
        const dayData = state.completions[dateStr] || {};
        
        const completed = state.habits.filter(h => dayData[h.id]).length;
        if (completed === state.habits.length && state.habits.length > 0) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }
    
    return streak;
}

function calculateHabitStreak(habitId) {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = formatDateString(date);
        const dayData = state.completions[dateStr] || {};
        
        if (dayData[habitId]) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }
    
    return streak;
}

function calculateHabitMonthlyProgress(habitId) {
    const now = new Date();
    let completedDays = 0;
    
    for (let day = 1; day <= now.getDate(); day++) {
        const date = new Date(now.getFullYear(), now.getMonth(), day);
        const dateStr = formatDateString(date);
        if (state.completions[dateStr]?.[habitId]) completedDays++;
    }
    
    const habit = state.habits.find(h => h.id === habitId);
    const goal = habit?.goal || 20;
    return Math.min((completedDays / goal) * 100, 100);
}

function countPerfectDays() {
    let count = 0;
    Object.entries(state.completions).forEach(([date, data]) => {
        const completed = state.habits.filter(h => data[h.id]).length;
        if (completed === state.habits.length && state.habits.length > 0) count++;
    });
    return count;
}

function countTotalCompletions() {
    let total = 0;
    Object.values(state.completions).forEach(data => {
        total += Object.values(data).filter(Boolean).length;
    });
    return total;
}

function countMonthlyGratitude() {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return state.gratitude.filter(g => g.date.startsWith(thisMonth)).length;
}

function calculateGratitudeStreak() {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = formatDateString(date);
        
        if (state.gratitude.some(g => g.date === dateStr)) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }
    
    return streak;
}

function setRandomQuote() {
    initQuoteCarousel();
}

// Quote Carousel with Typewriter Effect
let quoteCarouselInterval = null;
let currentQuoteIndex = 0;
let isTyping = false;

function initQuoteCarousel() {
    const carousel = document.getElementById('quoteCarousel');
    if (!carousel) return;
    
    // Clear any existing interval
    if (quoteCarouselInterval) clearInterval(quoteCarouselInterval);
    
    // Render indicators
    const indicators = document.getElementById('quoteIndicators');
    if (indicators) {
        indicators.innerHTML = CONFIG.QUOTES.map((_, i) => 
            `<button class="quote-dot ${i === 0 ? 'active' : ''}" onclick="goToQuote(${i})"></button>`
        ).join('');
    }
    
    // Show first quote immediately (no animation for first load)
    const quoteText = document.getElementById('dailyQuote');
    const quoteAuthor = document.getElementById('quoteAuthor');
    if (quoteText && quoteAuthor) {
        quoteText.textContent = CONFIG.QUOTES[0].text;
        quoteAuthor.textContent = `— ${CONFIG.QUOTES[0].author}`;
    }
    
    // Start auto-rotation
    quoteCarouselInterval = setInterval(() => {
        if (!isTyping) {
            currentQuoteIndex = (currentQuoteIndex + 1) % CONFIG.QUOTES.length;
            showQuote(currentQuoteIndex);
        }
    }, 8000); // Longer interval to account for typing animation
}

function showQuote(index) {
    if (isTyping) return;
    isTyping = true;
    
    const quoteText = document.getElementById('dailyQuote');
    const quoteAuthor = document.getElementById('quoteAuthor');
    const dots = document.querySelectorAll('.quote-dot');
    
    if (!quoteText || !quoteAuthor) {
        isTyping = false;
        return;
    }
    
    const newQuote = CONFIG.QUOTES[index];
    currentQuoteIndex = index;
    
    // Update dots
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    
    // Fade out author first
    quoteAuthor.classList.add('fade-out');
    
    // Erase current quote text (backspace effect)
    eraseText(quoteText, () => {
        // Type new quote text
        typeText(quoteText, newQuote.text, 30, () => {
            // Fade in author
            quoteAuthor.textContent = `— ${newQuote.author}`;
            quoteAuthor.classList.remove('fade-out');
            quoteAuthor.classList.add('fade-up');
            
            setTimeout(() => {
                quoteAuthor.classList.remove('fade-up');
                isTyping = false;
            }, 500);
        });
    }, 15);
}

function eraseText(element, callback, speed = 20) {
    const text = element.textContent;
    let i = text.length;
    
    element.classList.add('typing');
    
    const eraseInterval = setInterval(() => {
        if (i > 0) {
            element.textContent = text.substring(0, i - 1);
            i--;
        } else {
            clearInterval(eraseInterval);
            element.classList.remove('typing');
            if (callback) callback();
        }
    }, speed);
}

function typeText(element, text, speed = 30, callback) {
    let i = 0;
    element.textContent = '';
    element.classList.add('typing');
    
    const typeInterval = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(typeInterval);
            element.classList.remove('typing');
            if (callback) callback();
        }
    }, speed);
}

function goToQuote(index) {
    if (isTyping || index === currentQuoteIndex) return;
    
    // Reset interval
    if (quoteCarouselInterval) clearInterval(quoteCarouselInterval);
    showQuote(index);
    quoteCarouselInterval = setInterval(() => {
        if (!isTyping) {
            currentQuoteIndex = (currentQuoteIndex + 1) % CONFIG.QUOTES.length;
            showQuote(currentQuoteIndex);
        }
    }, 8000);
}



function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const icons = { success: 'check-circle', error: 'x-circle', warning: 'alert-circle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i data-lucide="${icons[type]}"></i><span>${message}</span>`;
    
    container.appendChild(toast);
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    setTimeout(() => toast.remove(), 3000);
}

function initParticles() {
    if (typeof particlesJS === 'undefined') return;
    
    particlesJS('particles-js', {
        particles: {
            number: { value: 50 },
            color: { value: '#c5ff00' },
            opacity: { value: 0.3 },
            size: { value: 2 },
            move: { enable: true, speed: 1 }
        }
    });
}

// Quick delete habit from daily view
function quickDeleteHabit(habitId) {
    if (!confirm('Are you sure you want to delete this habit?')) return;
    
    state.habits = state.habits.filter(h => h.id !== habitId);
    saveData();
    showToast('Habit deleted', 'warning');
    loadDailyDashboard();
    updateNotifications();
}

// Make functions globally available
window.toggleHabit = toggleHabit;
window.openEditHabitModal = openEditHabitModal;
window.toggleTheme = toggleTheme;
window.quickDeleteHabit = quickDeleteHabit;
window.goToQuote = goToQuote;
