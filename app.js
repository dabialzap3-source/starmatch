// Telegram WebApp initialization
const tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// Global state
let currentUser = null;
let currentMatch = null;

// API Base URL
const API_URL = window.location.origin;

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await initializeApp();
});

async function initializeApp() {
    try {
        // Authenticate user
        const initData = tg.initData || '';
        
        if (!initData) {
            // For testing without Telegram
            console.warn('Running without Telegram WebApp');
            setTimeout(() => showScreen('home'), 1500);
            return;
        }

        const response = await fetch(`${API_URL}/api/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData })
        });

        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            await loadUserData();
            setTimeout(() => showScreen('home'), 1500);
            setupEventListeners();
        } else {
            throw new Error('Authentication failed');
        }
    } catch (error) {
        console.error('Initialization error:', error);
        setTimeout(() => showScreen('home'), 1500);
        setupEventListeners();
    }
}

async function loadUserData() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_URL}/api/user/${currentUser.telegramId}`);
        const userData = await response.json();
        
        currentUser = userData;
        updateUserUI();
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

function updateUserUI() {
    if (!currentUser) return;

    // Update header stats
    document.getElementById('stars-count').textContent = currentUser.starsBalance || 0;
    document.getElementById('free-matches-count').textContent = currentUser.freeMatchesEarned || 0;
    document.getElementById('streak-count').textContent = currentUser.dailyLoginStreak || 0;

    // Update welcome name
    document.getElementById('user-name').textContent = currentUser.firstName || 'Friend';

    // Update profile stats
    document.getElementById('profile-stars').textContent = currentUser.starsBalance || 0;
    document.getElementById('profile-referrals').textContent = currentUser.referralCount || 0;
    document.getElementById('profile-streak').textContent = currentUser.dailyLoginStreak || 0;

    // Update profile form
    if (currentUser.age) document.getElementById('age').value = currentUser.age;
    if (currentUser.gender) document.getElementById('gender').value = currentUser.gender;
    if (currentUser.location) document.getElementById('location').value = currentUser.location;
    if (currentUser.interests) document.getElementById('interests').value = currentUser.interests.join(', ');
    if (currentUser.bio) document.getElementById('bio').value = currentUser.bio;
}

function setupEventListeners() {
    // Navigation buttons
    document.getElementById('random-match-btn').addEventListener('click', handleRandomMatch);
    document.getElementById('filtered-match-btn').addEventListener('click', () => showScreen('filters'));
    document.getElementById('profile-btn').addEventListener('click', () => showScreen('profile'));
    document.getElementById('matches-btn').addEventListener('click', loadMatchesList);
    document.getElementById('buy-stars-btn').addEventListener('click', handleBuyStars);
    document.getElementById('referral-btn').addEventListener('click', handleReferral);

    // Back buttons
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetScreen = e.target.getAttribute('data-back');
            showScreen(targetScreen);
        });
    });

    // Profile form
    document.getElementById('profile-form').addEventListener('submit', handleProfileUpdate);

    // Filters form
    document.getElementById('filters-form').addEventListener('submit', handleFilteredMatch);

    // Match actions
    document.getElementById('pass-btn').addEventListener('click', () => handleMatchReaction('passed'));
    document.getElementById('like-btn').addEventListener('click', () => handleMatchReaction('interested'));

    // Check if admin
    if (currentUser && currentUser.telegramId === 7806240300) {
        // Add admin button
        const adminBtn = document.createElement('button');
        adminBtn.className = 'action-btn';
        adminBtn.innerHTML = '<span class="action-icon">⚙️</span><span>Admin</span>';
        adminBtn.addEventListener('click', loadAdminPanel);
        document.querySelector('.quick-actions').appendChild(adminBtn);
    }
}

function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(`${screenName}-screen`).classList.add('active');
}

async function handleRandomMatch() {
    if (!currentUser) {
        tg.showAlert('Please complete your profile first');
        return;
    }

    try {
        tg.MainButton.showProgress();
        
        const response = await fetch(`${API_URL}/api/match/random`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId: currentUser.telegramId })
        });

        const data = await response.json();
        tg.MainButton.hideProgress();

        if (data.success && data.match) {
            currentMatch = data.match;
            displayMatch(data.match);
            showScreen('match');
        } else {
            tg.showAlert(data.message || 'No matches available at the moment');
        }
    } catch (error) {
        tg.MainButton.hideProgress();
        console.error('Random match error:', error);
        tg.showAlert('Failed to find a match. Please try again.');
    }
}

async function handleFilteredMatch(e) {
    e.preventDefault();

    if (!currentUser) {
        tg.showAlert('Please complete your profile first');
        return;
    }

    const filters = {
        gender: document.getElementById('filter-gender').value,
        location: document.getElementById('filter-location').value,
        interests: document.getElementById('filter-interests').value.split(',').map(i => i.trim()).filter(i => i)
    };

    const minAge = parseInt(document.getElementById('filter-age-min').value);
    const maxAge = parseInt(document.getElementById('filter-age-max').value);

    if (minAge && maxAge) {
        filters.ageRange = { min: minAge, max: maxAge };
    }

    try {
        tg.MainButton.showProgress();
        
        const response = await fetch(`${API_URL}/api/match/filtered`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                telegramId: currentUser.telegramId,
                filters 
            })
        });

        const data = await response.json();
        tg.MainButton.hideProgress();

        if (data.success && data.match) {
            currentMatch = data.match;
            displayMatch(data.match);
            showScreen('match');
            await loadUserData(); // Refresh user data
        } else {
            tg.showAlert(data.message || data.error || 'No matches found with these filters');
        }
    } catch (error) {
        tg.MainButton.hideProgress();
        console.error('Filtered match error:', error);
        tg.showAlert('Failed to find a match. Please try again.');
    }
}

function displayMatch(match) {
    // Determine which user is the match
    const matchedUser = match.user1.telegramId === currentUser.telegramId ? match.user2 : match.user1;

    document.getElementById('match-name').textContent = `${matchedUser.firstName} ${matchedUser.lastName || ''}`.trim();
    document.getElementById('match-age').textContent = matchedUser.age || 'N/A';
    document.getElementById('match-gender').textContent = matchedUser.gender || 'N/A';
    document.getElementById('match-location').textContent = `📍 ${matchedUser.location || 'Unknown'}`;
    document.getElementById('match-bio').textContent = matchedUser.bio || 'No bio available';

    // Display interests
    const interestsContainer = document.getElementById('match-interests');
    interestsContainer.innerHTML = '';
    if (matchedUser.interests && matchedUser.interests.length > 0) {
        matchedUser.interests.forEach(interest => {
            const tag = document.createElement('span');
            tag.className = 'interest-tag';
            tag.textContent = interest;
            interestsContainer.appendChild(tag);
        });
    }
}

async function handleMatchReaction(reaction) {
    if (!currentMatch) return;

    try {
        const response = await fetch(`${API_URL}/api/match/${currentMatch._id}/react`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                telegramId: currentUser.telegramId,
                reaction 
            })
        });

        const data = await response.json();

        if (data.success) {
            if (data.match.status === 'accepted') {
                tg.showAlert('🎉 It\'s a match! You can now chat with each other.');
            } else if (reaction === 'interested') {
                tg.showAlert('👍 Your interest has been sent!');
            }
            showScreen('home');
            currentMatch = null;
        }
    } catch (error) {
        console.error('Match reaction error:', error);
        tg.showAlert('Failed to send reaction. Please try again.');
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();

    if (!currentUser) return;

    const profileData = {
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        location: document.getElementById('location').value,
        interests: document.getElementById('interests').value.split(',').map(i => i.trim()).filter(i => i),
        bio: document.getElementById('bio').value
    };

    try {
        const response = await fetch(`${API_URL}/api/user/${currentUser.telegramId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });

        const data = await response.json();

        if (data) {
            currentUser = data;
            updateUserUI();
            tg.showAlert('✅ Profile updated successfully!');
            showScreen('home');
        }
    } catch (error) {
        console.error('Profile update error:', error);
        tg.showAlert('Failed to update profile. Please try again.');
    }
}

async function loadMatchesList() {
    if (!currentUser) return;

    showScreen('matches-list');

    try {
        const response = await fetch(`${API_URL}/api/matches/${currentUser.telegramId}`);
        const matches = await response.json();

        const listContainer = document.getElementById('matches-list');
        listContainer.innerHTML = '';

        if (matches.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💔</div>
                    <p>No matches yet. Start matching now!</p>
                </div>
            `;
            return;
        }

        matches.forEach(match => {
            const matchedUser = match.user1.telegramId === currentUser.telegramId ? match.user2 : match.user1;
            const isUser1 = match.user1.telegramId === currentUser.telegramId;
            const userStatus = isUser1 ? match.user1Status : match.user2Status;

            const matchItem = document.createElement('div');
            matchItem.className = 'match-item';
            matchItem.innerHTML = `
                <div class="match-item-photo">💝</div>
                <div class="match-item-info">
                    <h4>${matchedUser.firstName} ${matchedUser.lastName || ''}</h4>
                    <p class="match-item-status">
                        ${match.matchType === 'filtered' ? '🎯 Filtered' : '🎲 Random'} • 
                        ${new Date(match.createdAt).toLocaleDateString()}
                    </p>
                    <span class="match-status-badge status-${match.status}">
                        ${match.status === 'accepted' ? '✅ Matched!' : 
                          match.status === 'rejected' ? '❌ Not matched' : 
                          userStatus === 'interested' ? '⏳ Waiting' : '👀 New'}
                    </span>
                </div>
            `;
            listContainer.appendChild(matchItem);
        });
    } catch (error) {
        console.error('Load matches error:', error);
        document.getElementById('matches-list').innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <p>Failed to load matches</p>
            </div>
        `;
    }
}

async function handleBuyStars() {
    if (!currentUser) return;

    tg.showPopup({
        title: 'Buy Stars',
        message: 'Choose the amount of Stars you want to purchase:',
        buttons: [
            { id: 'buy_15', type: 'default', text: '15 Stars - $1.99' },
            { id: 'buy_50', type: 'default', text: '50 Stars - $4.99' },
            { id: 'buy_100', type: 'default', text: '100 Stars - $7.99' },
            { id: 'cancel', type: 'cancel' }
        ]
    }, async (buttonId) => {
        if (buttonId === 'cancel') return;

        const amounts = { buy_15: 15, buy_50: 50, buy_100: 100 };
        const amount = amounts[buttonId];

        try {
            const response = await fetch(`${API_URL}/api/payment/invoice`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegramId: currentUser.telegramId,
                    amount,
                    description: `${amount} Stars`
                })
            });

            const data = await response.json();

            if (data.success && data.invoiceUrl) {
                tg.openLink(data.invoiceUrl);
            }
        } catch (error) {
            console.error('Payment error:', error);
            tg.showAlert('Failed to create payment. Please try again.');
        }
    });
}

function handleReferral() {
    if (!currentUser || !currentUser.referralCode) return;

    const botUsername = 'YOUR_BOT_USERNAME'; // Replace with actual bot username
    const referralLink = `https://t.me/${botUsername}?start=${currentUser.referralCode}`;

    tg.showPopup({
        title: 'Invite Friends',
        message: `Share your referral link and earn 5 Stars for each friend who joins!\n\nYour code: ${currentUser.referralCode}\n\nReferrals: ${currentUser.referralCount}`,
        buttons: [
            { id: 'share', type: 'default', text: 'Share Link' },
            { id: 'copy', type: 'default', text: 'Copy Link' },
            { id: 'close', type: 'cancel' }
        ]
    }, (buttonId) => {
        if (buttonId === 'share') {
            tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Join me on StarMatch and find your perfect match! 💝')}`);
        } else if (buttonId === 'copy') {
            navigator.clipboard.writeText(referralLink);
            tg.showAlert('✅ Link copied to clipboard!');
        }
    });
}

async function loadAdminPanel() {
    if (!currentUser || currentUser.telegramId !== 7806240300) return;

    showScreen('admin');

    try {
        // Load users
        const usersResponse = await fetch(`${API_URL}/api/admin/users?telegramId=${currentUser.telegramId}`);
        const users = await usersResponse.json();

        // Load transactions
        const transactionsResponse = await fetch(`${API_URL}/api/admin/transactions?telegramId=${currentUser.telegramId}`);
        const transactions = await transactionsResponse.json();

        // Calculate stats
        const totalUsers = users.length;
        const activeUsers = users.filter(u => u.isActive).length;
        const totalRevenue = transactions
            .filter(t => t.type === 'payment' && t.status === 'completed')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        // Update admin stats
        document.getElementById('admin-total-users').textContent = totalUsers;
        document.getElementById('admin-active-users').textContent = activeUsers;
        document.getElementById('admin-revenue').textContent = `${totalRevenue} ⭐`;

        // Display transactions
        const transactionsContainer = document.getElementById('admin-transactions');
        transactionsContainer.innerHTML = '';
        transactions.slice(0, 10).forEach(tx => {
            const txItem = document.createElement('div');
            txItem.className = 'transaction-item';
            txItem.innerHTML = `
                <p><strong>User:</strong> ${tx.userId?.firstName || 'Unknown'} (@${tx.userId?.username || 'N/A'})</p>
                <p><strong>Type:</strong> ${tx.type}</p>
                <p class="transaction-amount"><strong>Amount:</strong> ${tx.amount} Stars</p>
                <p><strong>Status:</strong> ${tx.status}</p>
                <p><strong>Date:</strong> ${new Date(tx.createdAt).toLocaleString()}</p>
            `;
            transactionsContainer.appendChild(txItem);
        });

        // Display users
        const usersContainer = document.getElementById('admin-users');
        usersContainer.innerHTML = '';
        users.slice(0, 10).forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.innerHTML = `
                <p><strong>Name:</strong> ${user.firstName} ${user.lastName || ''}</p>
                <p><strong>Username:</strong> @${user.username || 'N/A'}</p>
                <p><strong>Stars:</strong> ${user.starsBalance}</p>
                <p><strong>Referrals:</strong> ${user.referralCount}</p>
                <p><strong>Joined:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
            `;
            usersContainer.appendChild(userItem);
        });
    } catch (error) {
        console.error('Admin panel error:', error);
        tg.showAlert('Failed to load admin data');
    }
}

// Set Telegram theme colors
if (tg.themeParams) {
    document.documentElement.style.setProperty('--bg-color', tg.themeParams.bg_color || '#0a0a0f');
    document.documentElement.style.setProperty('--text-primary', tg.themeParams.text_color || '#ffffff');
}
