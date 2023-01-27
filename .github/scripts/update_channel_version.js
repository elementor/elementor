'use strict';

//read package.json
const fs = require('fs');

const channel = process.argv[2];

let packageJson = require('../../package.json');

if ( 'ga' === channel ) {
    packageJson.channels = {
        'cloud': "0",
        'beta': "0"
    };
} else {
    const channelVersion = packageJson.channels[channel];
    packageJson.channels[channel] = parseInt(channelVersion) + 1;
}

fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 4));

console.log("Updated channel version to: " , packageJson.channels);