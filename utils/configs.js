const path = require('path')

module.exports = {
    TOGGLE_BASE_PATH: path.join(__dirname, 'maintenance-toggle.txt'),
    FILES_BASE_PATH: path.join(__dirname, '..', process.env.FILE_DIR)
}