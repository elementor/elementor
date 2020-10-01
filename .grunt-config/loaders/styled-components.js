const fs = require( 'fs' );

module.exports = function() {
	const resourcePath = this.resourcePath.replace( /\\/g, '/' ),
		fileContent = fs.readFileSync( resourcePath ).toString().match( /`[^]+`.*;/g );

	console.log( 'fs.readFileSync( resourcePath )', fs.readFileSync( resourcePath ).toString() );
	if ( fileContent ) {
		console.log( 'fileContent', fileContent[0].substring(1, fileContent[0].length-1) );
	}
	console.log( '' );

	return '';
}
