'use strict';

// The passed screenshots are redundant, delete them in order to reduce the artifact size.

const fs = require('fs'),
	basePath = '/tmp/wordpress/backstop_data',
	configContent = fs.readFileSync( `${ basePath }/html_report/config.js` ) + '' /* hack to get it as a string */,
	// `report` is a built in function that the backstop config.js run's, use it to get the config object.
	report = config => config,
	config = eval( configContent );

let deletedCount = 0;

config.tests
	.filter( test => 'pass' === test.status )
	.forEach( test => {
		fs.rmSync( `${ basePath }/html_report/${ test.pair.reference}` );
		fs.rmSync( `${ basePath }/html_report/${ test.pair.test}` );
		deletedCount++;
	} );

console.log( `${ deletedCount } pairs were deleted` );
