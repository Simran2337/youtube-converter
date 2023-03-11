const cron = require('node-cron');
const Video = require('../models/video');
const path = require('path');
const fs = require('fs');
const { FILES_BASE_PATH } = require('./configs');
const { setMaintenance } = require('./maintenance');

module.exports = () => {
	cron.schedule(`0 50 11,23 * * *`, () => {
		try {
			setMaintenance(true)
			io.emit('maintenance-start')
		} catch (err) {
			console.error("WRITE FILE ERROR FROM MAINTENANCE STARTER", err)
		}
	});
	cron.schedule(`0 0 */12 * * *`, () => {
		Video.deleteMany({}, (err, info) => {
			if (err)
				console.error("DELETE MANY VIDEO DOCUMENTS FROM SCHEDULER", err)
			else
				console.log(info)
		});
		try {
			fs.readdirSync(FILES_BASE_PATH).forEach(fileName => fs.unlinkSync(path.join(FILES_BASE_PATH, fileName)))
		} catch (err) {
			console.error("DELETE AUDIO FILES FROM SCHEDULER", err)
		}
	});
	cron.schedule(`0 5 0,12 * * *`, () => {
		try {
			setMaintenance(false)
			io.emit('maintenance-end');
		} catch (err) {
			console.error("WRITE FILE ERROR FROM MAINTENANCE STOPPER", err)
		}
	});
}