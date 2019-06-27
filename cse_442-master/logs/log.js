// Requiring the FileSystem module
const fs = require('fs');

// Exporting this functionality under the log module so we can use it elsewhere
module.exports = {

    // Logs server events for easier debugging
    serverLog: text => {
        module.exports.basicLog(__dirname + '/server.log', text);
    },

    // Allowing errors to be logged in a separate file
    errorLog: text => {
        module.exports.basicLog(__dirname + '/error.log', text);
    },

    // Allowing errors to be logged in a separate file
    routeLog: text => {
        module.exports.basicLog(__dirname + '/route.log', text);
    },

    // The default log function that can be used for multiple filenames
    basicLog: (file, text) => {
        fs.appendFile(file, `${new Date().toISOString()} ${text}\n`, 'UTF-8', (err) => {
            if (err) {
                console.log(`${new Date().toISOString()} Logging failed\n${err}`);
            }
        });
    }

};