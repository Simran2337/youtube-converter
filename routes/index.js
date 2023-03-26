const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const { FILES_BASE_PATH } = require('../utils/configs')

router.get('/download/:filename', (req, res) => {
	res.setHeader('Content-Type', 'audio/mpeg')
	res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`)
	res.sendFile(path.join(__dirname, '..', 'audio_files', req.params.filename));
});

router.get('/check-file/:filename', (req, res) => {
	try {
		const status = fs.existsSync(path.join(FILES_BASE_PATH, req.params.filename))
		res.status(200).json({ status, message: status ? '' : 'The Audio File Doesn\'t Exist' })
	} catch (error) {
		console.error("ERROR WHILE CHECKING FILE", error)
		res.status(500).json({ status: false, message: 'Some Unknown Error Occurred' })
	}
});

module.exports = router;
