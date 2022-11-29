import backstop from "backstopjs";
import fs from "fs";
import {fileURLToPath} from "url";
import {dirname} from "path";

import {createRequire} from "module";

var require = createRequire( import.meta.url );

const mergeImages = require( 'merge-images' );
const {Canvas, Image, loadImage} = require( 'canvas' );

const __filename = fileURLToPath( import.meta.url );
const __dirname = dirname( __filename );

const config = JSON.parse( fs.readFileSync( __dirname + '/../backstop.json', 'utf-8' ) );

// get slug from args
const slug = process.argv[2].replace( /^--slug=/, "" );

backstop('test', {
	config: Object.assign(config, {
		"paths": {
			"bitmaps_reference": "backstop_data/bitmaps_reference",
			"engine_scripts": "backstop_data/engine_scripts",
			"bitmaps_test": 'reports/' + slug + "/backstop_data/bitmaps_test",
			"html_report": 'reports/' + slug + "/backstop_data/html_report",
			"ci_report": 'reports/' + slug + "/backstop_data/ci_report"
		},
	})
})
	.then((data) => {
		console.log( 'Results: Success');
		process.exit( 0 );
	})
	.catch(async( data ) => {
		await mergeFromReportDir( __dirname + '/../reports/' + slug );
		process.exit( 1 );
	});

function mergeFromReportDir(dir) {
	let config;
	const report = (data) => config = data; // hack for use backstopjs-report data
	const configDir = `${dir}/backstop_data/html_report`;
	const configRaw = fs.readFileSync( `${configDir}/config.js`, {encoding: 'utf8', flag: 'r'} );
	eval( configRaw );

	const promises = [];
	config.tests.forEach(async( result ) => {
		if ('pass' === result.status) {
			promises.push( Promise.resolve() );
			return;
		}
		promises.push( handleErrorReport( configDir, result ) );
	});

	return Promise.all( promises );
}

async function handleErrorReport(configDir, result) {
	const reference = fs.realpathSync( `${configDir}/${result.pair.reference}` ),
		test = fs.realpathSync( `${configDir}/${result.pair.test}` ),
		diff = fs.realpathSync( `${configDir}/${result.pair.diffImage}` );

	const testImage = await loadImage( reference );

	return mergeImages([
		{src: reference, x: 0, y: 0},
		{src: test, x: testImage.width + 10, y: 0},
		{src: diff, x: (testImage.width + 10) * 2, y: 0},
	], {
		width: (testImage.width + 10) * 3,
		height: testImage.height,
		Canvas,
		Image
	})
		.then((base64String) => {
			const base64Image = base64String.split( ';base64,' ).pop();
			const filename = result.pair.test
				.replace(/\\/g, '/') // Windows
				.split( '/' )
				.slice( -2 )
				.join('-');

			try {
				fs.writeFileSync( fs.realpathSync( `${__dirname}/../results` ) + `/${slug}-${filename}`, base64Image, {encoding: 'base64'} );
				console.log( 'Diff File created' );
			} catch (err) {
				console.log( 'Failed to create a Diff file', err);
			}
			return Promise.resolve();
		});
}
