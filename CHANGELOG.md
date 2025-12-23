# Changelog

All notable changes to OurinAI WhatsApp Bot will be documented in this file.

## [1.1.0] - 2025-12-23

### Added
- **LowDB Integration**: Migrated from custom JSON database to LowDB with realtime synchronization
- **LID Mapping**: Automatic conversion of @lid format to phone numbers for mentions, participants, and quoted messages
- **Auto-Owner Detection**: Bot number automatically detected and added to owner list on connection
- **Self Mode**: New `.self` command to restrict bot access to bot's own number only
- **Scheduler System**: 
  - Daily limit reset at configurable time (default: 00:00)
  - Scheduled messages with `.schedule` command
  - Persistent storage for scheduled tasks
- **EXIF + FFmpeg Integration**: 
  - Complete sticker creation with node-webpmux
  - FFmpeg-based image/video to WebP conversion
  - Contain mode (no cropping) for stickers
- **New Commands**:
  - `.self on/off` - Toggle self mode
  - `.schedule add/list/del/status` - Manage scheduled messages

### Changed
- Updated to version 1.1.0
- `colors.js` now exports direct color functions (red, yellow, cyan, etc.) for legacy support
- `connection.js` now has `isReady` flag to prevent premature message handling after pairing
- `handler.js` now includes self mode check and LID conversion for group participants
- `serialize.js` now converts LID format for sender, quoted sender, and mentions
- `sockHelper.js` uses async `addExifToWebp()` and improved FFmpeg filter for contain mode
- `database.js` completely rewritten with LowDB, async init, and migration support

### Fixed
- Commands not working after pairing connection (isReady flag)
- LID (@lid) format not being converted to phone numbers
- Sticker packname/author not appearing (EXIF injection)
- Video stickers being cropped instead of contained
- `colors.red()` and similar direct calls not working

### Dependencies
- Added: `lowdb@^7.0.1`
- Added: `node-webpmux@^3.2.1`

---

## [1.0.0] - Initial Release

### Features
- Multi-device WhatsApp connection using @rexxhayanasi/elaina-baileys
- Modular plugin system with hot-reload
- Anti-spam and anti-call protection
- Welcome/leave messages for groups
- Owner, premium, and banned user management
- Command limits and cooldowns
- Multiple operating modes (public, self, group, private)
- Custom logger with futuristic theme

### Plugins
- **main**: menu, ping, runtime, infobot, owner
- **owner**: broadcast, listowner, listprem, setmode
- **utility**: profile, sticker
- **fun**: dice, flip
