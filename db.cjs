const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

// Helper to read JSON safely
function readJSON(filePath) {
    if (!fs.existsSync(filePath)) return [];
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
}

// Helper to write JSON safely
function writeJSON(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
}

// User methods
const db = {
    getUsers: () => readJSON(USERS_FILE),

    addUser: (user) => {
        const users = readJSON(USERS_FILE);
        // Simple duplicate check
        if (users.find(u => u.username === user.username)) {
            return false; // User exists
        }
        users.push(user);
        writeJSON(USERS_FILE, users);
        return true;
    },

    findUser: (username, password) => {
        const users = readJSON(USERS_FILE);
        return users.find(u => u.username === username && u.password === password);
    },

    // History methods
    getHistory: (username) => {
        const history = readJSON(HISTORY_FILE);
        return history.filter(h => h.username === username);
    },

    addHistory: (username, record) => {
        const history = readJSON(HISTORY_FILE);
        const newRecord = {
            ...record,
            username,
            timestamp: new Date().toISOString(),
            id: Date.now().toString()
        };
        history.push(newRecord);
        writeJSON(HISTORY_FILE, history);
        return newRecord;
    }
};

module.exports = db;
