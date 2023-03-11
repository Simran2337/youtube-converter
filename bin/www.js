#!/usr/bin/env node

const app = require('../app');
const debug = require('debug')('youtube-converter-backend:server');
const http = require('http');
const Video = require('../models/video');
const connectDb = require('../utils/connect-db');
const ytd = require('../utils/ytd');
const dbClearer = require('../utils/db-clearer');
const fs = require('fs');
const path = require('path');
const { TOGGLE_BASE_PATH, FILES_BASE_PATH } = require('../utils/configs');
const { getMaintenance } = require('../utils/maintenance');

const normalizePort = val => {
	const port = parseInt(val, 10);
	if (isNaN(port)) {
		return val;
	}
	if (port >= 0) {
		return port;
	}
	return false;
}

const onError = error => {
	if (error.syscall !== 'listen') {
		throw error;
	}
	const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
		default:
			console.error(error);
			process.exit(1);
	}
}

const onListening = () => {
	const addr = server.address();
	const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
	debug('Listening on ' + bind);
}

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);
const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });

connectDb().then(() => {
	io.on("connection", socket => {
		try {
			console.log('[' + socket.id + '] Connected');
			if (getMaintenance()) {
				io.emit('maintenance-start');
				return
			}
			socket.on('download-initiate', (videoId) => {
				if (getMaintenance()) {
					io.emit('maintenance-start');
					return
				}
				console.log("Download Initiated: VIDEO ID = " + videoId);
				socket.join(videoId);
				//Check if a video entry is present
				Video.findOne({ videoId }, (err, data) => {
					if (err) {
						console.log(err);
						io.to(videoId).emit('download-error', { videoId, error: err });
					}
					//If not, create one entry, and start downloading
					if (!data) {
						new Video({
							videoId
						}).save((err2, data2) => {
							if (err2) {
								console.log(err);
								io.to(videoId).emit('download-error', { videoId, error: err });
							}
							if (data2) {
								ytd(videoId, videoId + ".mp3");
							}
						})
					} else { //if yes, respond with appropriate message based on status
						if (data.status) {
							io.to(videoId).emit('download-complete', { videoId, videoName: data.videoName });
						}
					}
				});
			});
			socket.on("download-cancel-or-complete", (videoId) => {
				if (getMaintenance()) {
					io.emit('maintenance-start');
					return
				}
				console.log("Download Completed: VIDEO ID = " + videoId);
				socket.leave(videoId);
			});
			socket.on("disconnect", () => {
				console.log('[' + socket.id + '] Disconnected');
			});
		} catch (err) {
			console.error("READ FILE ERROR FROM SOCKET", err)
		}
	});
	global.io = io;
	dbClearer();
}).catch(error => {
	process.exit(1);
});

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
console.log("Server started on PORT = " + port);
