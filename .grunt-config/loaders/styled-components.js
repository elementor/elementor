const fs = require( 'fs' );

module.exports = function() {
	return '';
	const resourcePath = this.resourcePath.replace( /\\/g, '/' ),
		fileContent = fs.readFileSync( resourcePath ).toString().match( /`[^]+`.*;/g );

	if ( fileContent ) {
		console.log( 'fileContent', fileContent[0].substring(1, fileContent[0].length-1) );
	}
	console.log( '' );

	return '';
}
