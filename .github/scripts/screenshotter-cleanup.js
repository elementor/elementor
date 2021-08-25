'use strict';

const fs = require('fs');

const basePath = '/tmp/wordpress/backstop_data';

// `report` is a built in function that the backstop config.js run's.
const report = ( data ) => {
	console.log( data );

	data.tests
		.filter( test => 'pass' === test.status )
		.forEach( test => {
			fs.rmSync( `${ basePath }/${ test.pair.reference}` );
			fs.rmSync( `${ basePath }/${ test.pair.test}` );
		} )
}

const config = require( `${ basePath }/html_report/config.js` );

console.log(config);
