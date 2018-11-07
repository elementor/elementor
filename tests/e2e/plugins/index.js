/// <reference types="Cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const fs = require( 'fs-extra' );
const path = require( 'path' );

module.exports = ( on, config ) => {
    // accept a configFile value or use development by default
    const filePath = config.env.configFilePath || path.resolve( 'cypress.json' );

    return fs.readJson( filePath );
};
