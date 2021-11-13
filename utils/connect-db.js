const mongoose = require('mongoose');

module.exports = () => {
    return new Promise((resolve, reject) => {
        mongoose.connect(process.env.DB_URL).then(connected => {
            console.log('Connected to the Database');
            resolve();
        }).catch(err => {
            console.log('Connection failed!', err);
            reject();
        });
    });
}
