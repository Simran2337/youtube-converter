const mongoose = require('mongoose');

var videoSchema = new mongoose.Schema({
    "videoId": {
        type: String,
        unique: true,
        required: true
    },
    "status": {
        type: Boolean,
        default: false
    },
    "videoName": {
        type: String
    }
});

module.exports = mongoose.model("video", videoSchema);
