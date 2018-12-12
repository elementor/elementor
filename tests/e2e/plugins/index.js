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
const http = require( 'http' );

module.exports = async ( on, config ) => {
	config.env.WP_VERSION = config.env.WP_VERSION || await getWordPressVersion( config.baseUrl );
	return config;
};

function getWordPressVersion( baseUrl ) {
	return new Promise( ( resolve ) => {
		http.get( baseUrl, ( resp ) => {
			let data = '';

			// A chunk of data has been received.
			resp.on( 'data', ( chunk ) => {
				data += chunk;
			} );

			// The whole response has been received. Print out the result.
			resp.on( 'end', () => {
				resolve( data.match( /content="WordPress ([^"]+)"/ )[ 1 ] );
				return data.match( /content="WordPress ([^"]+)"/ )[ 1 ];
			} );
		} ).on( 'error', ( err ) => {
			throw new Error( err );
		} );
	} );
}
