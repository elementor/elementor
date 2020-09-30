const path = require( 'path' ),
	fs = require('fs'),
	dir = path.resolve( __dirname, '../../' ),
	importsFile = dir + '/core/app/assets/styles/app-imports.scss';

module.exports = function() {
	const resourceRelativePath = path.relative( path.dirname(importsFile), this.resourcePath ).replace( /\\/g, '/' );

	console.log( '------------------------ this.resourcePath', this.resourcePath );

	return '';
}
