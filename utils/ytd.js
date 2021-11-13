const YoutubeMp3Downloader = require('youtube-mp3-downloader');
const Video = require('../models/video');
const path = require('path');
const fs = require('fs');
let YD;

if (process.env.ENVIRONMENT == "dev") {
        YD = new YoutubeMp3Downloader({
                ffmpegPath: "C:/Users/Simran/Desktop/ffmpeg-4.4.1-essentials_build/bin/ffmpeg",
                outputPath: path.resolve(__dirname, '..', process.env.FILE_DIR),
                queueParallelism: parseInt(process.env.QUEUE_PARALLELISM),
                progressTimeout: parseInt(process.env.PROGRESS_TIMEOUT)
        });
}
else {
        YD = new YoutubeMp3Downloader({
                outputPath: path.resolve(__dirname, '..', process.env.FILE_DIR),
                queueParallelism: parseInt(process.env.QUEUE_PARALLELISM),
                progressTimeout: parseInt(process.env.PROGRESS_TIMEOUT)
        });
}

YD.on("finished", (err, data) => {
        //Rename file from ID to Title
        const fopath = path.join(__dirname, '..', process.env.FILE_DIR, data.videoId + ".mp3");
        const fnpath = path.join(__dirname, '..', process.env.FILE_DIR, data.videoTitle + ".mp3");
        if (fs.existsSync(fopath))
                fs.renameSync(fopath, fnpath);
        //Update status for record in DB
        Video.findOneAndUpdate({ videoId: data.videoId }, { status: true, videoName: data.videoTitle }, (err2, data2) => {
                console.log({ err2 });
                io.to(data.videoId).emit('download-complete', { videoId: data.videoId });
        });
        console.log(err);
        console.log(data.videoId, data.videoTitle);
});

YD.on("error", (err, data) => {
        console.log(err);
        console.log(data);
});

YD.on("progress", (data) => {
        //Send status to Socket here
        // console.log(data.progress.percentage);
        io.to(data.videoId).emit('download-progress', { videoId: data.videoId, progress: data.progress.percentage, remainingTime: data.progress.eta, speed: data.progress.speed });
});

module.exports = (videoId, fileName = null) => {

        if (fileName)
                YD.download(videoId, fileName);
        else
                YD.download(videoId);

}