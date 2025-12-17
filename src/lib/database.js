/**
 * @file src/lib/database.js
 * @description Simple JSON database untuk menyimpan data user dan settings
 * @author Ourin-AI Team
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

/**
 * @typedef {Object} UserData
 * @property {string} jid - JID user
 * @property {string} name - Nama user
 * @property {string} number - Nomor user
 * @property {number} limit - Limit tersisa
 * @property {boolean} isPremium - Status premium
 * @property {boolean} isBanned - Status banned
 * @property {number} exp - Experience points
 * @property {number} level - Level user
 * @property {string} registeredAt - Tanggal registrasi
 * @property {string} lastSeen - Terakhir aktif
 * @property {Object} cooldowns - Cooldown per command
 */

/**
 * @typedef {Object} GroupData
 * @property {string} jid - JID group
 * @property {string} name - Nama group
 * @property {boolean} welcome - Welcome message aktif
 * @property {boolean} leave - Leave message aktif
 * @property {boolean} antilink - Anti link aktif
 * @property {boolean} antitoxic - Anti toxic aktif
 * @property {boolean} mute - Group dimute
 * @property {string[]} warnings - List user yang di-warn
 */

/**
 * Database class untuk mengelola data
 * @class
 */
class Database {
    /**
     * Membuat instance database baru
     * @param {string} dbPath - Path ke directory database
     */
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.data = {};
        this.saveTimeout = null;
        this.autoSaveInterval = 60000;
        
        this.ensureDir();
        this.load();
        this.startAutoSave();
    }
    
    /**
     * Memastikan directory database ada
     * @private
     */
    ensureDir() {
        if (!fs.existsSync(this.dbPath)) {
            fs.mkdirSync(this.dbPath, { recursive: true });
        }
    }
    
    /**
     * Memuat semua data dari file JSON
     * @private
     */
    load() {
        const files = ['users', 'groups', 'settings', 'stats'];
        
        for (const file of files) {
            const filePath = path.join(this.dbPath, `${file}.json`);
            try {
                if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    this.data[file] = JSON.parse(content);
                } else {
                    this.data[file] = {};
                }
            } catch (error) {
                console.error(`[Database] Failed to load ${file}:`, error.message);
                this.data[file] = {};
            }
        }
        
        console.log('[Database] Data loaded successfully');
    }
    
    /**
     * Menyimpan semua data ke file JSON
     * @returns {boolean} True jika berhasil
     */
    save() {
        try {
            for (const [name, data] of Object.entries(this.data)) {
                const filePath = path.join(this.dbPath, `${name}.json`);
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
            }
            return true;
        } catch (error) {
            console.error('[Database] Failed to save:', error.message);
            return false;
        }
    }
    
    /**
     * Menyimpan dengan debounce untuk menghindari write berlebihan
     * @private
     */
    debouncedSave() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        this.saveTimeout = setTimeout(() => {
            this.save();
        }, 5000);
    }
    
    /**
     * Memulai auto-save interval
     * @private
     */
    startAutoSave() {
        setInterval(() => {
            this.save();
        }, this.autoSaveInterval);
    }
    
    /**
     * Mendapatkan data user
     * @param {string} jid - JID user
     * @returns {UserData|null} Data user atau null
     */
    getUser(jid) {
        if (!jid) return null;
        const cleanJid = jid.replace(/@.+/g, '');
        return this.data.users[cleanJid] || null;
    }
    
    /**
     * Membuat atau update data user
     * @param {string} jid - JID user
     * @param {Object} data - Data untuk disimpan
     * @returns {UserData} Updated user data
     */
    setUser(jid, data = {}) {
        if (!jid) return null;
        const cleanJid = jid.replace(/@.+/g, '');
        
        const existing = this.data.users[cleanJid] || {};
        
        this.data.users[cleanJid] = {
            jid: cleanJid,
            name: data.name || existing.name || 'Unknown',
            number: cleanJid,
            limit: data.limit ?? existing.limit ?? 25,
            isPremium: data.isPremium ?? existing.isPremium ?? false,
            isBanned: data.isBanned ?? existing.isBanned ?? false,
            exp: data.exp ?? existing.exp ?? 0,
            level: data.level ?? existing.level ?? 1,
            registeredAt: existing.registeredAt || new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            cooldowns: data.cooldowns ?? existing.cooldowns ?? {},
            ...data
        };
        
        this.debouncedSave();
        return this.data.users[cleanJid];
    }
    
    /**
     * Menghapus data user
     * @param {string} jid - JID user
     * @returns {boolean} True jika berhasil
     */
    deleteUser(jid) {
        if (!jid) return false;
        const cleanJid = jid.replace(/@.+/g, '');
        
        if (this.data.users[cleanJid]) {
            delete this.data.users[cleanJid];
            this.debouncedSave();
            return true;
        }
        return false;
    }
    
    /**
     * Mendapatkan semua users
     * @returns {Object<string, UserData>} Object semua users
     */
    getAllUsers() {
        return this.data.users || {};
    }
    
    /**
     * Mendapatkan total user
     * @returns {number} Total user
     */
    getUserCount() {
        return Object.keys(this.data.users || {}).length;
    }
    
    /**
     * Update limit user
     * @param {string} jid - JID user
     * @param {number} amount - Jumlah limit yang diubah (positif untuk tambah, negatif untuk kurang)
     * @returns {number} Limit baru
     */
    updateLimit(jid, amount) {
        const user = this.getUser(jid) || this.setUser(jid);
        user.limit = Math.max(0, (user.limit || 0) + amount);
        this.setUser(jid, user);
        return user.limit;
    }
    
    /**
     * Cek dan set cooldown
     * @param {string} jid - JID user
     * @param {string} command - Nama command
     * @param {number} seconds - Durasi cooldown dalam detik
     * @returns {number|false} Sisa waktu cooldown atau false jika tidak ada cooldown
     */
    checkCooldown(jid, command, seconds) {
        const user = this.getUser(jid);
        if (!user) return false;
        
        const cooldowns = user.cooldowns || {};
        const now = Date.now();
        const cooldownEnd = cooldowns[command] || 0;
        
        if (now < cooldownEnd) {
            return Math.ceil((cooldownEnd - now) / 1000);
        }
        
        return false;
    }
    
    /**
     * Set cooldown untuk user
     * @param {string} jid - JID user
     * @param {string} command - Nama command
     * @param {number} seconds - Durasi cooldown dalam detik
     */
    setCooldown(jid, command, seconds) {
        const user = this.getUser(jid) || this.setUser(jid);
        if (!user.cooldowns) user.cooldowns = {};
        
        user.cooldowns[command] = Date.now() + (seconds * 1000);
        this.setUser(jid, user);
    }
    
    /**
     * Mendapatkan data group
     * @param {string} jid - JID group
     * @returns {GroupData|null} Data group atau null
     */
    getGroup(jid) {
        if (!jid) return null;
        return this.data.groups[jid] || null;
    }
    
    /**
     * Membuat atau update data group
     * @param {string} jid - JID group
     * @param {Object} data - Data untuk disimpan
     * @returns {GroupData} Updated group data
     */
    setGroup(jid, data = {}) {
        if (!jid) return null;
        
        const existing = this.data.groups[jid] || {};
        
        this.data.groups[jid] = {
            jid,
            name: data.name || existing.name || 'Unknown Group',
            welcome: data.welcome ?? existing.welcome ?? true,
            leave: data.leave ?? existing.leave ?? true,
            antilink: data.antilink ?? existing.antilink ?? false,
            antitoxic: data.antitoxic ?? existing.antitoxic ?? false,
            mute: data.mute ?? existing.mute ?? false,
            warnings: data.warnings ?? existing.warnings ?? [],
            ...data
        };
        
        this.debouncedSave();
        return this.data.groups[jid];
    }
    
    /**
     * Mendapatkan semua groups
     * @returns {Object<string, GroupData>} Object semua groups
     */
    getAllGroups() {
        return this.data.groups || {};
    }
    
    /**
     * Mendapatkan atau set settings
     * @param {string} key - Key setting
     * @param {*} [value] - Value untuk di-set (optional)
     * @returns {*} Value setting
     */
    setting(key, value = undefined) {
        if (value !== undefined) {
            this.data.settings[key] = value;
            this.debouncedSave();
        }
        return this.data.settings[key];
    }
    
    /**
     * Mendapatkan semua settings
     * @returns {Object} Object settings
     */
    getSettings() {
        return this.data.settings || {};
    }
    
    /**
     * Update stats
     * @param {string} key - Key stats
     * @param {number} [increment=1] - Nilai increment
     * @returns {number} Nilai baru
     */
    incrementStat(key, increment = 1) {
        if (!this.data.stats[key]) {
            this.data.stats[key] = 0;
        }
        this.data.stats[key] += increment;
        this.debouncedSave();
        return this.data.stats[key];
    }
    
    /**
     * Mendapatkan stats
     * @param {string} [key] - Key stats (optional)
     * @returns {number|Object} Nilai stats atau semua stats
     */
    getStats(key) {
        if (key) {
            return this.data.stats[key] || 0;
        }
        return this.data.stats || {};
    }
    
    /**
     * Reset limit semua user
     * @param {number} [limit=25] - Limit baru
     * @returns {number} Jumlah user yang di-reset
     */
    resetAllLimits(limit = 25) {
        let count = 0;
        for (const jid of Object.keys(this.data.users)) {
            this.data.users[jid].limit = limit;
            count++;
        }
        this.save();
        return count;
    }
    
    /**
     * Backup database
     * @returns {string} Path file backup
     */
    backup() {
        const backupDir = path.join(this.dbPath, 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `backup-${timestamp}.json`);
        
        fs.writeFileSync(backupPath, JSON.stringify(this.data, null, 2), 'utf-8');
        
        return backupPath;
    }
}

let dbInstance = null;

/**
 * Inisialisasi database
 * @param {string} dbPath - Path ke directory database
 * @returns {Database} Instance database
 */
function initDatabase(dbPath) {
    if (!dbInstance) {
        dbInstance = new Database(dbPath);
    }
    return dbInstance;
}

/**
 * Mendapatkan instance database
 * @returns {Database} Instance database
 */
function getDatabase() {
    if (!dbInstance) {
        throw new Error('Database not initialized. Call initDatabase first.');
    }
    return dbInstance;
}

module.exports = {
    Database,
    initDatabase,
    getDatabase
};
