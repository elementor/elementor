const path = require( 'path' ),
	fs = require('fs'),
	dir = path.resolve( __dirname, '../../' ),
	importsFile = dir + '/core/app/assets/styles/app-imports.scss';

module.exports = function() {
		const resourceRelativePath = path.relative( path.dirname(importsFile), this.resourcePath ).replace( /\\/g, '/' ),
		importStatement = `@import "${ resourceRelativePath }";`,
		importContent = fs.readFileSync( importsFile ).toString().split( "\n" ),
		importExists = -1 !== importContent.indexOf( importStatement );

	if ( ! importExists ) {
		fs.open( importsFile, 'a', 666, ( e, id ) => {
			fs.write( id, importStatement + "\n", null, 'utf8', () => {
				fs.close( id );
			} );
		} );
	}

	return ``;
}
