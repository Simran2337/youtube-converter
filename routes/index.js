const router = require('express').Router();
// const ytd = require('../utils/ytd');
const Video = require('../models/video');
const path = require('path');
//Black list
// router.get('/initiate-download/:id', function (req, res) {
// 	//Check if a video entry is present
// 	Video.findOne({ videoId: req.params.id }, (err, data) => {
// 		if (err) {
// 			console.log(err);
// 			return res.status(500).json({
// 				status: false,
// 				message: 'Unknown Error Occurred during Fetch'
// 			});
// 		}
// 		//If not, create one entry, and start downloading
// 		if (!data) {
// 			new Video({
// 				videoId: req.params.id
// 			}).save((err2, data2) => {
// 				if (err2) {
// 					console.log(err);
// 					return res.status(500).json({
// 						status: false,
// 						message: 'Unknown Error Occurred during Initiation'
// 					});
// 				}
// 				if (data2) {
// 					ytd(req.params.id, req.params.id + ".mp3");
// 					return res.status(200).json({
// 						status: false,
// 						message: 'Your video is being converted, please wait...'
// 					});
// 				}
// 			})
// 		} else { //if yes, respond with appropriate message based on status
// 			if (data.status == false) {
// 				return res.status(200).json({
// 					status: false,
// 					message: 'Downloading is in progress, please wait a while...'
// 				});
// 			} else {
// 				return res.status(200).json({
// 					status: true,
// 					message: 'Downloading is complete!'
// 				});
// 			}
// 		}
// 	});
// });

router.get('/download/:id', function (req, res) {
	//Check if a video entry is present
	Video.findOne({ videoId: req.params.id }, (err, data) => {
		if (err) {
			console.log(err);
			return res.status(500).json({
				status: false,
				message: 'Unknown Error Occurred during Fetch'
			});
		}
		//elsewhere, initiate a download at client side directly.
		res.sendFile(path.join(__dirname, '..', 'audio_files', data.videoName + ".mp3"));
	});
});

module.exports = router;
