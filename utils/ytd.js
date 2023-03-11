const YoutubeMp3Downloader = require('youtube-mp3-downloader');
const Video = require('../models/video');
const path = require('path');
const fs = require('fs');
const { FILES_BASE_PATH } = require('./configs');
let YD;

if (process.env.ENVIRONMENT == "dev") {
	YD = new YoutubeMp3Downloader({
		ffmpegPath: "C:/Users/Simran/Desktop/ffmpeg-4.4.1-essentials_build/bin/ffmpeg",
		outputPath: FILES_BASE_PATH,
		queueParallelism: parseInt(process.env.QUEUE_PARALLELISM),
		progressTimeout: parseInt(process.env.PROGRESS_TIMEOUT)
	});
}
else {
	YD = new YoutubeMp3Downloader({
		outputPath: FILES_BASE_PATH,
		queueParallelism: parseInt(process.env.QUEUE_PARALLELISM),
		progressTimeout: parseInt(process.env.PROGRESS_TIMEOUT)
	});
}

YD.on("finished", (err, data) => {
	if (err)
		console.error("FINISH ERROR FROM YOUTUBE DOWNLOADER", err)
	//Rename file from ID to Title
	const videoTitle = data.videoTitle.substring(0, 50)
	const fopath = path.join(FILES_BASE_PATH, data.videoId + ".mp3");
	const fnpath = path.join(FILES_BASE_PATH, videoTitle + ".mp3");

	if (fs.existsSync(fopath))
		fs.renameSync(fopath, fnpath);
	//Update status for record in DB
	Video.findOneAndUpdate({ videoId: data.videoId }, { status: true, videoName: videoTitle + ".mp3" }, (err2, data2) => {
		if (err2)
			console.error("FIND_ONE_AND_UPDATE ERROR FROM YOUTUBE DOWNLOADER", err2)
		io.to(data.videoId).emit('download-complete', { videoId: data.videoId, videoName: videoTitle + ".mp3" });
	});
});

YD.on("error", async (err) => {
	if (err) {
		console.error("ERROR FROM YOUTUBE DOWNLOADER", err)
	}
	Video.deleteMany({ status: false }, (err2, data2) => {
		if (err2)
			console.error("FIND_ONE_AND_DELETE ERROR FROM YOUTUBE DOWNLOADER", err2)
	});
	const sockets = await io.fetchSockets()
	sockets.forEach(socket => {
		const videoId = [...socket.rooms].find(roomId => roomId.length == 11)
		io.to(videoId).emit('download-error', { videoId, error: err })
	})
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