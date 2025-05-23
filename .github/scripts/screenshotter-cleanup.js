'use strict';

// The passed screenshots are redundant, delete them in order to reduce the artifact size.
// The failed screenshots are merged in a summary zip.

const fs = require( 'fs' ),
	mergeImages = require( 'merge-images' ),
	{Canvas, Image, loadImage} = require( 'canvas' ),
	basePath = '/tmp/wordpress/backstop_data',
	configContent = fs.readFileSync( `${basePath}/html_report/config.js` ) + '' /* hack to get it as a string */,
	// `report` is a built-in function that the backstop config.js run's, use it to get the config object.
	report = config => config,
	config = eval( configContent ),
	mergedFilesPath = '/tmp/merged-screenshots';

let deletedCount = 0;

fs.mkdirSync( mergedFilesPath );

const onSuccess = (test) => {
	fs.rmSync( `${basePath}/html_report/${test.pair.reference}` );
	fs.rmSync( `${basePath}/html_report/${test.pair.test}` );
	deletedCount++;
};

// Merge images.
const onError = async( test ) => {
	const configDir = `${basePath}/html_report/`,
		reference = fs.realpathSync( `${configDir}/${test.pair.reference}` ),
		testSrc = fs.realpathSync( `${configDir}/${test.pair.test}` ),
		diffSrc = fs.realpathSync( `${configDir}/${test.pair.diffImage}` );

	const testImage = await loadImage( reference ),
		sources = [
			{ src: reference, x: 0, y: 0},
			{ src: testSrc, x: testImage.width + 10, y: 0 },
			{ src: diffSrc, x: ( testImage.width + 10 ) * 2, y: 0 }
		],
		canvas = {
			width: ( testImage.width + 10 ) * 3,
			height: testImage.height,
			Canvas,
			Image
	};

	return mergeImages( sources, canvas )
		.then((base64String) => {
			const base64Image = base64String.split( ';base64,' ).pop(),
				filename = test.pair.test
					.replace( /\\/g, '/' ) // Windows
					.split( '/' )
					.slice( -2 )
					.join( '-' );

			fs.writeFileSync( `${mergedFilesPath}/${filename}`, base64Image, { encoding: 'base64' } );
		} );
}

config.tests
	.forEach( test => {
		if ( 'pass' === test.status ) {
			onSuccess( test );
		} else {
			onError( test );
		}
	});

console.log( `${deletedCount} pairs were deleted` );
