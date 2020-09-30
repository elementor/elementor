const path = require( 'path' ),
	fs = require('fs'),
	dir = path.resolve( __dirname, '../../' ),
	importsFile = dir + '/core/app/assets/styles/app-imports.scss';

module.exports = function() {
	const resourcePath = this.resourcePath.replace( /\\/g, '/' ),
		fileContent = fs.readFileSync( resourcePath ).toString();

	console.log( 'fileContent', fileContent );
	console.log( '' );

	return '';
}
