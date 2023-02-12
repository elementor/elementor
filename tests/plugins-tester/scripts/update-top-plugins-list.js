import fetch from 'node-fetch';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath( import.meta.url );
const __dirname = dirname( __filename );

const URL = 'https://api.wordpress.org/plugins/info/1.2/?action=query_plugins&request[search]=elementor&request[page]=1&request[per_page]=40';
const FILE_NAME = __dirname + '/../config/top-plugins.json';

const fetchPluginsList = async ( url, filename ) => {
	try {
		const response = await fetch( url );
		const data = await response.json();

		const pluginsList = [];
		data.plugins.forEach( ( plugin ) => {
			if ( 'elementor' === plugin.slug ) {
				return;
			}

			pluginsList.push( plugin.slug );
		} );

		pluginsList.sort();

		// eslint-disable-next-line no-console
		console.log( pluginsList );

		fs.writeFileSync( filename, JSON.stringify( pluginsList, null, 2 ) );

		// eslint-disable-next-line no-console
		console.log( `${ FILE_NAME } has been updated successfully` );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.log( error );
	}
};

fetchPluginsList( URL, FILE_NAME );
