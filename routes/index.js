const router = require('express').Router();
const Video = require('../models/video');
const path = require('path');
router.get('/download/:id', function (req, res) {
	//Check if a video entry is present
	Video.findOne({ videoName: req.params.id }, (err, data) => {
		if (err) {
			console.log(err);
			res.redirect(process.env.FRONT_END_REDIRECT_URL + "?error=FILE_FETCH_ERROR")
		}
		//if not, throw a file not found error (in that case, call the initiate API from front end)
		if (!data) {
			res.redirect(process.env.FRONT_END_REDIRECT_URL + "?error=FILE_NOT_FOUND")
		} else {
			if (data.status == false) { //if status is false, throw a status indicating downloading is in progress, need to wait.
				res.redirect(process.env.FRONT_END_REDIRECT_URL + "?status=DOWNLOADING_IN_PROGRESS")
			} else { //elsewhere, initiate a download at client side directly.
				res.sendFile(path.join(__dirname, '..', 'audio_files', data.videoName));
			}
		}
	});
});

module.exports = router;
