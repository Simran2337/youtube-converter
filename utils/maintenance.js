const fs = require("fs")
const { TOGGLE_BASE_PATH } = require("./configs")

exports.setMaintenance = maintenance => {
    fs.writeFileSync(TOGGLE_BASE_PATH, JSON.stringify({ maintenance }))
}

exports.getMaintenance = () => {
    try {
        return JSON.parse(fs.readFileSync(TOGGLE_BASE_PATH)).maintenance
    } catch (error) {
        console.error("ERROR WHILE CHECKING MAINTENANCE", error)
        return false
    }
}