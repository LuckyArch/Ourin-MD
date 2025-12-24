/**
 * @file index.js
 * @description Entry point utama untuk WhatsApp Bot Ourin-AI dengan Futuristic Logger
 * @author Ourin-AI Team
 * @version 2.0.0
 */

const path = require('path');
const fs = require('fs');
const config = require('./config');
const { startConnection } = require('./src/connection');
const { messageHandler, groupHandler } = require('./src/handler');
const { loadPlugins, pluginStore } = require('./src/lib/plugins');
const { initDatabase } = require('./src/lib/database');
const { initScheduler, loadScheduledMessages } = require('./src/lib/scheduler');
const { startAutoBackup } = require('./src/lib/backup');
const { 
    logger, 
    c, 
    printBanner, 
    printStartup, 
    logConnection, 
    logErrorBox,
    logPlugin,
    divider 
} = require('./src/lib/colors');

/**
 * Waktu start untuk menghitung boot time
 */
const startTime = Date.now();

/**
 * Watcher untuk auto-reload plugins di dev mode
 */
let pluginWatcher = null;
const reloadDebounce = new Map();

/**
 * Memulai file watcher untuk dev mode
 */
function startDevWatcher(pluginsPath) {
    if (pluginWatcher) {
        pluginWatcher.close();
    }
    
    logger.system('Dev Mode', 'Auto reload enabled');
    
    pluginWatcher = fs.watch(pluginsPath, { recursive: true }, (eventType, filename) => {
        if (!filename || !filename.endsWith('.js')) return;
        
        const existingTimeout = reloadDebounce.get(filename);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }
        
        const timeout = setTimeout(() => {
            reloadDebounce.delete(filename);
            
            const fullPath = path.join(pluginsPath, filename);
            
            if (!fs.existsSync(fullPath)) {
                logger.warn('File removed', filename);
                return;
            }
            
            try {
                const pluginName = path.basename(filename, '.js');
                delete require.cache[require.resolve(fullPath)];
                
                const plugin = require(fullPath);
                if (plugin.config && plugin.handler) {
                    pluginStore.commands.set(pluginName.toLowerCase(), plugin);
                    logger.success('Reloaded', pluginName);
                }
            } catch (error) {
                logger.error('Reload failed', `${filename}: ${error.message}`);
            }
        }, 500);
        
        reloadDebounce.set(filename, timeout);
    });
    
    logger.debug('Watching', pluginsPath);
}

/**
 * Setup anti-crash handlers
 */
function setupAntiCrash() {
    process.on('uncaughtException', (error, origin) => {
        logErrorBox('Uncaught Exception', error.message);
        if (config.dev?.debugLog) {
            console.error(c.gray(error.stack));
        }
        logger.info('Bot continues running...');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
        logErrorBox('Unhandled Rejection', String(reason));
        if (config.dev?.debugLog) {
            console.error(c.gray('Promise:'), promise);
        }
        logger.info('Bot continues running...');
    });
    
    process.on('warning', (warning) => {
        logger.warn('Warning', `${warning.name}: ${warning.message}`);
    });
    
    process.on('SIGINT', () => {
        console.log('');
        logger.system('SIGINT received');
        logger.info('Saving data...');
        
        try {
            const { getDatabase } = require('./src/lib/database');
            const db = getDatabase();
            db.save();
            logger.success('Data saved!');
        } catch (error) {
            logger.warn('Save failed', error.message);
        }
        
        logger.info('Bot stopped. Goodbye!');
        process.exit(0);
    });
    
    process.on('SIGTERM', () => {
        console.log('');
        logger.system('SIGTERM received');
        process.exit(0);
    });
    
    logger.success('Anti-crash active');
}

/**
 * Fungsi utama untuk memulai bot
 */
async function main() {
    // Print futuristic banner
    printBanner();
    
    // Print startup info
    printStartup({
        name: config.bot?.name || 'Ourin-AI',
        version: config.bot?.version || '1.0.0',
        developer: config.bot?.developer || 'Developer',
        mode: config.mode || 'public'
    });
    
    // Setup anti-crash
    setupAntiCrash();
    divider();
    
    // Initialize database (async for lowdb)
    logger.info('Initializing database...');
    const dbPath = path.join(process.cwd(), config.database?.path || './src/database');
    await initDatabase(dbPath);
    logger.success('Database ready!');
    
    // Start auto backup
    if (config.backup?.enabled !== false) {
        startAutoBackup(dbPath);
    }
    
    // Load plugins
    logger.info('Loading plugins...');
    const pluginsPath = path.join(process.cwd(), 'plugins');
    const pluginCount = loadPlugins(pluginsPath);
    logger.success('Plugins loaded', `${pluginCount} plugins`);
    
    // Setup dev watcher
    if (config.dev?.enabled && config.dev?.watchPlugins) {
        startDevWatcher(pluginsPath);
    }
    
    // Initialize scheduler (daily limit reset)
    logger.info('Initializing scheduler...');
    initScheduler(config);
    logger.success('Scheduler ready!');
    
    // Boot time
    const bootTime = Date.now() - startTime;
    logger.info('Boot time', `${bootTime}ms`);
    divider();
    
    // Start connection
    logger.system('Connecting to WhatsApp...');
    console.log('');
    
    await startConnection({
        /**
         * Callback saat ada pesan baru
         */
        onMessage: async (msg, sock) => {
            try {
                await messageHandler(msg, sock);
            } catch (error) {
                logger.error('Handler', error.message);
                if (config.dev?.debugLog) {
                    console.error(c.gray(error.stack));
                }
            }
        },
        
        /**
         * Callback saat ada update group
         */
        onGroupUpdate: async (update, sock) => {
            try {
                await groupHandler(update, sock);
            } catch (error) {
                logger.error('Group', error.message);
            }
        },
        
        /**
         * Callback saat ada update koneksi
         */
        onConnectionUpdate: async (update, sock) => {
            if (update.connection === 'open') {
                logConnection('connected', sock.user?.name || 'Bot');
                logger.success('Ready to receive messages!');
                
                // Load scheduled messages after connection ready
                loadScheduledMessages(sock);
                
                if (config.dev?.enabled) {
                    logger.system('DEV MODE', 'Active');
                }
                divider();
            }
        }
    });
}

main().catch(error => {
    logErrorBox('Fatal Error', error.message);
    console.error(c.gray(error.stack));
    process.exit(1);
});
