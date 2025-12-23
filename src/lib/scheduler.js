/**
 * @file src/lib/scheduler.js
 * @description Scheduler untuk daily limit reset dan scheduled messages
 * @author Ourin-AI Team
 * @version 1.1.0
 */

const { getDatabase } = require('./database');
const { logger } = require('./colors');

/**
 * Scheduled tasks storage
 * @type {Map<string, Object>}
 */
const scheduledTasks = new Map();

/**
 * Active intervals
 * @type {Map<string, NodeJS.Timeout>}
 */
const activeIntervals = new Map();

/**
 * Calculate milliseconds until next occurrence of a time
 * @param {number} hour - Target hour (0-23)
 * @param {number} minute - Target minute (0-59)
 * @returns {number} Milliseconds until next occurrence
 */
function getMsUntilTime(hour, minute = 0) {
    const now = new Date();
    const target = new Date();
    
    target.setHours(hour, minute, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (target <= now) {
        target.setDate(target.getDate() + 1);
    }
    
    return target.getTime() - now.getTime();
}

/**
 * Format time remaining for display
 * @param {number} ms - Milliseconds
 * @returns {string} Formatted time
 */
function formatTimeRemaining(ms) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
}

/**
 * Daily limit reset scheduler
 * Resets all user limits at specified time (default: 00:00)
 * @param {Object} options - Scheduler options
 * @param {number} [options.hour=0] - Reset hour (0-23)
 * @param {number} [options.minute=0] - Reset minute (0-59)
 * @param {number} [options.defaultLimit=25] - Default limit to reset to
 */
function startDailyLimitReset(options = {}) {
    const hour = options.hour ?? 0;
    const minute = options.minute ?? 0;
    const defaultLimit = options.defaultLimit ?? 25;
    
    const scheduleReset = () => {
        const msUntilReset = getMsUntilTime(hour, minute);
        
        logger.info('Scheduler', `Daily limit reset scheduled in ${formatTimeRemaining(msUntilReset)}`);
        
        const timeoutId = setTimeout(() => {
            try {
                const db = getDatabase();
                const resetCount = db.resetAllLimits(defaultLimit);
                
                logger.success('Scheduler', `Daily limit reset complete! ${resetCount} users reset to ${defaultLimit}`);
                
                // Save to stats
                db.incrementStat('dailyResets');
                db.setting('lastLimitReset', new Date().toISOString());
                
                // Schedule next reset
                scheduleReset();
            } catch (error) {
                logger.error('Scheduler', `Daily limit reset failed: ${error.message}`);
                // Retry in 1 minute
                setTimeout(scheduleReset, 60000);
            }
        }, msUntilReset);
        
        activeIntervals.set('dailyLimitReset', timeoutId);
    };
    
    scheduleReset();
    logger.info('Scheduler', `Daily limit reset enabled at ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
}

/**
 * Add a scheduled message
 * @param {Object} options - Message options
 * @param {string} options.id - Unique task ID
 * @param {string} options.jid - Target JID
 * @param {Object} options.message - Message content
 * @param {number} options.hour - Send hour (0-23)
 * @param {number} [options.minute=0] - Send minute (0-59)
 * @param {boolean} [options.repeat=false] - Repeat daily
 * @param {Object} sock - Socket connection
 * @returns {Object} Task info
 */
function scheduleMessage(options, sock) {
    const { id, jid, message, hour, minute = 0, repeat = false } = options;
    
    if (!id || !jid || !message || hour === undefined) {
        throw new Error('Missing required options: id, jid, message, hour');
    }
    
    // Cancel existing task with same ID
    if (scheduledTasks.has(id)) {
        cancelScheduledMessage(id);
    }
    
    const task = {
        id,
        jid,
        message,
        hour,
        minute,
        repeat,
        createdAt: new Date().toISOString(),
        nextRun: null
    };
    
    const scheduleTask = () => {
        const msUntilSend = getMsUntilTime(hour, minute);
        task.nextRun = new Date(Date.now() + msUntilSend).toISOString();
        
        const timeoutId = setTimeout(async () => {
            try {
                await sock.sendMessage(jid, message);
                logger.success('Scheduler', `Scheduled message sent: ${id}`);
                
                // Save to stats
                const db = getDatabase();
                db.incrementStat('scheduledMessagesSent');
                
                if (repeat) {
                    // Schedule next occurrence
                    scheduleTask();
                } else {
                    // Remove one-time task
                    scheduledTasks.delete(id);
                    activeIntervals.delete(id);
                }
            } catch (error) {
                logger.error('Scheduler', `Failed to send scheduled message ${id}: ${error.message}`);
                
                // Retry in 5 minutes
                setTimeout(() => scheduleTask(), 5 * 60 * 1000);
            }
        }, msUntilSend);
        
        activeIntervals.set(id, timeoutId);
        scheduledTasks.set(id, task);
    };
    
    scheduleTask();
    
    logger.info('Scheduler', `Message scheduled: ${id} at ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    
    return task;
}

/**
 * Cancel a scheduled message
 * @param {string} id - Task ID
 * @returns {boolean} True if cancelled
 */
function cancelScheduledMessage(id) {
    if (activeIntervals.has(id)) {
        clearTimeout(activeIntervals.get(id));
        activeIntervals.delete(id);
    }
    
    if (scheduledTasks.has(id)) {
        scheduledTasks.delete(id);
        logger.info('Scheduler', `Cancelled scheduled message: ${id}`);
        return true;
    }
    
    return false;
}

/**
 * Get all scheduled messages
 * @returns {Object[]} Array of scheduled tasks
 */
function getScheduledMessages() {
    return Array.from(scheduledTasks.values());
}

/**
 * Get scheduled message by ID
 * @param {string} id - Task ID
 * @returns {Object|null} Task or null
 */
function getScheduledMessage(id) {
    return scheduledTasks.get(id) || null;
}

/**
 * Save scheduled messages to database for persistence
 */
function saveScheduledMessages() {
    try {
        const db = getDatabase();
        const tasks = Array.from(scheduledTasks.values());
        db.setting('scheduledMessages', tasks);
        logger.debug('Scheduler', `Saved ${tasks.length} scheduled messages`);
    } catch (error) {
        logger.error('Scheduler', `Failed to save scheduled messages: ${error.message}`);
    }
}

/**
 * Load scheduled messages from database
 * @param {Object} sock - Socket connection
 */
function loadScheduledMessages(sock) {
    try {
        const db = getDatabase();
        const savedTasks = db.setting('scheduledMessages') || [];
        
        for (const task of savedTasks) {
            if (task.repeat || new Date(task.nextRun) > new Date()) {
                scheduleMessage({
                    id: task.id,
                    jid: task.jid,
                    message: task.message,
                    hour: task.hour,
                    minute: task.minute,
                    repeat: task.repeat
                }, sock);
            }
        }
        
        logger.info('Scheduler', `Loaded ${savedTasks.length} scheduled messages`);
    } catch (error) {
        logger.error('Scheduler', `Failed to load scheduled messages: ${error.message}`);
    }
}

/**
 * Stop all schedulers
 */
function stopAllSchedulers() {
    // Save before stopping
    saveScheduledMessages();
    
    // Clear all intervals
    for (const [id, timeout] of activeIntervals) {
        clearTimeout(timeout);
        logger.debug('Scheduler', `Stopped: ${id}`);
    }
    
    activeIntervals.clear();
    logger.info('Scheduler', 'All schedulers stopped');
}

/**
 * Get scheduler status
 * @returns {Object} Status info
 */
function getSchedulerStatus() {
    const db = getDatabase();
    
    return {
        dailyResetEnabled: activeIntervals.has('dailyLimitReset'),
        lastLimitReset: db.setting('lastLimitReset') || 'Never',
        scheduledMessagesCount: scheduledTasks.size,
        totalResets: db.getStats('dailyResets'),
        totalMessagesSent: db.getStats('scheduledMessagesSent')
    };
}

/**
 * Initialize scheduler with config
 * @param {Object} config - Bot config
 * @param {Object} sock - Socket connection (optional, needed for scheduled messages)
 */
function initScheduler(config, sock = null) {
    // Start daily limit reset if enabled
    if (config.features?.dailyLimitReset !== false) {
        startDailyLimitReset({
            hour: config.scheduler?.resetHour ?? 0,
            minute: config.scheduler?.resetMinute ?? 0,
            defaultLimit: config.limits?.defaultLimit ?? 25
        });
    }
    
    // Load saved scheduled messages
    if (sock) {
        loadScheduledMessages(sock);
    }
    
    // Auto-save scheduled messages every 5 minutes
    setInterval(() => {
        if (scheduledTasks.size > 0) {
            saveScheduledMessages();
        }
    }, 5 * 60 * 1000);
    
    logger.success('Scheduler', 'Scheduler initialized');
}

module.exports = {
    // Initialization
    initScheduler,
    stopAllSchedulers,
    
    // Daily limit reset
    startDailyLimitReset,
    
    // Scheduled messages
    scheduleMessage,
    cancelScheduledMessage,
    getScheduledMessages,
    getScheduledMessage,
    saveScheduledMessages,
    loadScheduledMessages,
    
    // Utilities
    getMsUntilTime,
    formatTimeRemaining,
    getSchedulerStatus
};
