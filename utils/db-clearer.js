const cron = require('node-cron');
const Video = require('../models/video');
const path = require('path');
const fs = require('fs');

module.exports = () => {
	cron.schedule(`0 0 */12 * * *`, () => {
		Video.find({ status: true }, (err, videos) => {
			console.log({ err, count: videos.length });
			videos.forEach(video => {
				const fpath = path.join(__dirname, '..', process.env.FILE_DIR, video.videoName);
				if (fs.existsSync(fpath))
					fs.unlinkSync(fpath);
			});
			Video.deleteMany({ status: true }, (err, info) => {
				console.log({ err, info });
			});
		});
	});
}