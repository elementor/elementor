import { createRequire } from 'module';
import fs from 'fs';

// Hack to use require in ES6 module for a ES5 modules.
const require = createRequire( import.meta.url );
const mergeImages = require( 'merge-images' );
const { Canvas, Image, loadImage } = require( 'canvas' );

export const mergeReportFromDir = ( dir ) => {
	let config;
	// eslint-disable-next-line no-unused-vars
	const report = ( data ) => config = data; // Hack for use backstopjs-report data in the eval below
	const configDir = `${ dir }/backstop_data/html_report`;
	const configRaw = fs.readFileSync( `${ configDir }/config.js`, { encoding: 'utf8', flag: 'r' } );
	// eslint-disable-next-line no-eval
	eval( configRaw );

	const promises = [];
	config.tests.forEach( async ( result ) => {
		if ( 'pass' !== result.status ) {
			promises.push( handleErrorReport( configDir, result ) );
		}
	} );

	return Promise.all( promises );
};

export const handleErrorReport = async ( configDir, result ) => {
	const reference = fs.realpathSync( `${ configDir }/${ result.pair.reference }` ),
		test = fs.realpathSync( `${ configDir }/${ result.pair.test }` ),
		diff = fs.realpathSync( `${ configDir }/${ result.pair.diffImage }` );

	const testImage = await loadImage( reference );

	return mergeImages( [
		{ src: reference, x: 0, y: 0 },
		{ src: test, x: testImage.width + 10, y: 0 },
		{ src: diff, x: ( testImage.width + 10 ) * 2, y: 0 },
	], {
		width: ( testImage.width + 10 ) * 3,
		height: testImage.height,
		Canvas,
		Image,
	} )
		.then( ( base64String ) => {
			const base64Image = base64String.split( ';base64,' ).pop();
			const filename = result.pair.test
				.replace( /\\/g, '/' ) // Windows
				.split( '/' )
				.slice( -2 )
				.join( '-' );

			try {
				fs.writeFileSync( fs.realpathSync( `${ __dirname }/../results` ) + `/${ slug }-${ filename }`, base64Image, { encoding: 'base64' } );
				// eslint-disable-next-line no-console
				console.log( 'Diff File created' );
			} catch ( err ) {
				// eslint-disable-next-line no-console
				console.log( 'Failed to create a Diff file', err );
			}
			return Promise.resolve();
		} );
};
