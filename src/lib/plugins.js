/**
 * @file src/lib/plugins.js
 * @description Plugin loader system untuk memuat dan mengelola command plugins
 * @author Ourin-AI Team
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

/**
 * @typedef {Object} PluginConfig
 * @property {string} name - Nama command (tanpa prefix)
 * @property {string[]} alias - Array alias untuk command
 * @property {string} category - Kategori plugin (owner, main, utility, fun, dll)
 * @property {string} description - Deskripsi singkat command
 * @property {string} usage - Cara penggunaan command
 * @property {string} example - Contoh penggunaan command
 * @property {boolean} isOwner - Apakah command khusus owner
 * @property {boolean} isPremium - Apakah command khusus premium user
 * @property {boolean} isGroup - Apakah command hanya untuk group
 * @property {boolean} isPrivate - Apakah command hanya untuk private chat
 * @property {boolean} isAdmin - Apakah command memerlukan admin group
 * @property {boolean} isBotAdmin - Apakah bot harus jadi admin
 * @property {number} cooldown - Cooldown dalam detik
 * @property {number} limit - Jumlah limit yang digunakan per eksekusi
 * @property {boolean} isEnabled - Apakah plugin aktif
 */

/**
 * @typedef {Object} Plugin
 * @property {PluginConfig} config - Konfigurasi plugin
 * @property {PluginHandler} handler - Fungsi handler plugin
 */

/**
 * @callback PluginHandler
 * @param {Object} m - Serialized message object
 * @param {Object} params - Parameter tambahan
 * @param {Object} params.sock - Socket connection Baileys
 * @param {Object} params.store - Data store
 * @param {Object} params.config - Bot configuration
 * @param {Object} params.plugins - All loaded plugins
 * @returns {Promise<void>}
 */

/**
 * @typedef {Object} PluginStore
 * @property {Map<string, Plugin>} commands - Map command name ke plugin
 * @property {Map<string, string>} aliases - Map alias ke command name
 * @property {Map<string, Plugin[]>} categories - Map category ke array plugins
 */

/**
 * Collection untuk menyimpan semua plugins
 * @type {PluginStore}
 */
const pluginStore = {
    commands: new Map(),
    aliases: new Map(),
    categories: new Map()
};

/**
 * Default config untuk plugin
 * @type {PluginConfig}
 */
const defaultConfig = {
    name: '',
    alias: [],
    category: 'uncategorized',
    description: 'No description',
    usage: '',
    example: '',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isAdmin: false,
    isBotAdmin: false,
    cooldown: 3,
    limit: 1,
    isEnabled: true
};

/**
 * Memuat satu plugin dari file
 * @param {string} filePath - Path ke file plugin
 * @returns {Plugin|null} Plugin object atau null jika gagal
 * @example
 * const plugin = loadPlugin('./plugins/main/ping.js');
 */
function loadPlugin(filePath) {
    try {
        delete require.cache[require.resolve(filePath)];
        
        const plugin = require(filePath);
        
        if (!plugin.config || !plugin.handler) {
            console.error(`[Plugin] Invalid plugin structure: ${filePath}`);
            return null;
        }
        
        if (typeof plugin.handler !== 'function') {
            console.error(`[Plugin] Handler must be a function: ${filePath}`);
            return null;
        }
        
        if (!plugin.config.name) {
            const fileName = path.basename(filePath, path.extname(filePath));
            plugin.config.name = fileName;
        }
        
        plugin.config = { ...defaultConfig, ...plugin.config };
        plugin.filePath = filePath;
        
        return plugin;
    } catch (error) {
        console.error(`[Plugin] Failed to load: ${filePath}`, error.message);
        return null;
    }
}

/**
 * Mendaftarkan plugin ke store
 * @param {Plugin} plugin - Plugin untuk didaftarkan
 * @returns {boolean} True jika berhasil
 */
function registerPlugin(plugin) {
    if (!plugin || !plugin.config || !plugin.config.name) {
        return false;
    }
    
    const { name, alias, category } = plugin.config;
    
    pluginStore.commands.set(name.toLowerCase(), plugin);
    
    if (Array.isArray(alias)) {
        for (const a of alias) {
            pluginStore.aliases.set(a.toLowerCase(), name.toLowerCase());
        }
    }
    
    const categoryLower = category.toLowerCase();
    if (!pluginStore.categories.has(categoryLower)) {
        pluginStore.categories.set(categoryLower, []);
    }
    pluginStore.categories.get(categoryLower).push(plugin);
    
    return true;
}

/**
 * Memuat semua plugins dari directory
 * @param {string} pluginsDir - Path ke directory plugins
 * @returns {number} Jumlah plugin yang berhasil dimuat
 * @example
 * const count = loadPlugins('./plugins');
 * console.log(`Loaded ${count} plugins`);
 */
function loadPlugins(pluginsDir) {
    pluginStore.commands.clear();
    pluginStore.aliases.clear();
    pluginStore.categories.clear();
    
    let loadedCount = 0;
    
    if (!fs.existsSync(pluginsDir)) {
        console.warn(`[Plugin] Plugins directory not found: ${pluginsDir}`);
        return 0;
    }
    
    const categories = fs.readdirSync(pluginsDir);
    
    for (const category of categories) {
        const categoryPath = path.join(pluginsDir, category);
        
        if (!fs.statSync(categoryPath).isDirectory()) {
            if (category.endsWith('.js') && category !== '_index.js') {
                const plugin = loadPlugin(categoryPath);
                if (plugin && registerPlugin(plugin)) {
                    loadedCount++;
                }
            }
            continue;
        }
        
        const files = fs.readdirSync(categoryPath);
        
        for (const file of files) {
            if (!file.endsWith('.js') || file.startsWith('_')) continue;
            
            const filePath = path.join(categoryPath, file);
            const plugin = loadPlugin(filePath);
            
            if (plugin) {
                if (!plugin.config.category || plugin.config.category === 'uncategorized') {
                    plugin.config.category = category;
                }
                
                if (registerPlugin(plugin)) {
                    loadedCount++;
                    console.log(`[Plugin] Loaded: ${plugin.config.name} (${category})`);
                }
            }
        }
    }
    
    console.log(`[Plugin] Total loaded: ${loadedCount} plugins`);
    return loadedCount;
}

/**
 * Mendapatkan plugin berdasarkan nama atau alias
 * @param {string} name - Nama command atau alias
 * @returns {Plugin|null} Plugin object atau null jika tidak ditemukan
 * @example
 * const plugin = getPlugin('menu');
 * if (plugin) {
 *   await plugin.handler(m, { sock, config });
 * }
 */
function getPlugin(name) {
    if (!name) return null;
    
    const nameLower = name.toLowerCase();
    
    if (pluginStore.commands.has(nameLower)) {
        return pluginStore.commands.get(nameLower);
    }
    
    if (pluginStore.aliases.has(nameLower)) {
        const commandName = pluginStore.aliases.get(nameLower);
        return pluginStore.commands.get(commandName);
    }
    
    return null;
}

/**
 * Mendapatkan semua plugins dalam kategori tertentu
 * @param {string} category - Nama kategori
 * @returns {Plugin[]} Array plugins dalam kategori
 * @example
 * const ownerPlugins = getPluginsByCategory('owner');
 */
function getPluginsByCategory(category) {
    if (!category) return [];
    return pluginStore.categories.get(category.toLowerCase()) || [];
}

/**
 * Mendapatkan semua kategori yang ada
 * @returns {string[]} Array nama kategori
 */
function getCategories() {
    return Array.from(pluginStore.categories.keys());
}

/**
 * Mendapatkan semua plugins
 * @returns {Plugin[]} Array semua plugins
 */
function getAllPlugins() {
    return Array.from(pluginStore.commands.values());
}

/**
 * Mendapatkan total jumlah plugins
 * @returns {number} Total plugins
 */
function getPluginCount() {
    return pluginStore.commands.size;
}

/**
 * Mendapatkan daftar command per kategori untuk menu
 * @returns {Object<string, string[]>} Object dengan key kategori dan value array command names
 */
function getCommandsByCategory() {
    const result = {};
    
    for (const [category, plugins] of pluginStore.categories.entries()) {
        result[category] = plugins
            .filter(p => p.config.isEnabled)
            .map(p => p.config.name);
    }
    
    return result;
}

/**
 * Mendapatkan info plugin untuk help
 * @param {string} name - Nama command
 * @returns {Object|null} Info plugin atau null
 */
function getPluginInfo(name) {
    const plugin = getPlugin(name);
    if (!plugin) return null;
    
    const { config } = plugin;
    
    return {
        name: config.name,
        alias: config.alias,
        category: config.category,
        description: config.description,
        usage: config.usage,
        example: config.example,
        isOwner: config.isOwner,
        isPremium: config.isPremium,
        cooldown: config.cooldown
    };
}

/**
 * Reload single plugin
 * @param {string} name - Nama command untuk reload
 * @returns {boolean} True jika berhasil
 */
function reloadPlugin(name) {
    const plugin = getPlugin(name);
    if (!plugin || !plugin.filePath) return false;
    
    const category = plugin.config.category;
    
    pluginStore.commands.delete(name.toLowerCase());
    
    for (const alias of (plugin.config.alias || [])) {
        pluginStore.aliases.delete(alias.toLowerCase());
    }
    
    const categoryPlugins = pluginStore.categories.get(category.toLowerCase());
    if (categoryPlugins) {
        const index = categoryPlugins.findIndex(p => p.config.name === name);
        if (index !== -1) {
            categoryPlugins.splice(index, 1);
        }
    }
    
    const newPlugin = loadPlugin(plugin.filePath);
    if (newPlugin && registerPlugin(newPlugin)) {
        console.log(`[Plugin] Reloaded: ${name}`);
        return true;
    }
    
    return false;
}

/**
 * Disable plugin
 * @param {string} name - Nama command untuk disable
 * @returns {boolean} True jika berhasil
 */
function disablePlugin(name) {
    const plugin = getPlugin(name);
    if (!plugin) return false;
    
    plugin.config.isEnabled = false;
    return true;
}

/**
 * Enable plugin
 * @param {string} name - Nama command untuk enable
 * @returns {boolean} True jika berhasil
 */
function enablePlugin(name) {
    const plugin = getPlugin(name);
    if (!plugin) return false;
    
    plugin.config.isEnabled = true;
    return true;
}

/**
 * Cek apakah plugin aktif
 * @param {string} name - Nama command
 * @returns {boolean} True jika plugin aktif
 */
function isPluginEnabled(name) {
    const plugin = getPlugin(name);
    return plugin ? plugin.config.isEnabled : false;
}

module.exports = {
    loadPlugin,
    loadPlugins,
    registerPlugin,
    getPlugin,
    getPluginsByCategory,
    getCategories,
    getAllPlugins,
    getPluginCount,
    getCommandsByCategory,
    getPluginInfo,
    reloadPlugin,
    disablePlugin,
    enablePlugin,
    isPluginEnabled,
    pluginStore,
    defaultConfig
};
