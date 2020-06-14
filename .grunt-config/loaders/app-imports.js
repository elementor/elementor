const path = require( 'path' );
const dir = path.resolve( __dirname, '../../' );
const fs = require('fs');

module.exports = function() {
	const importsFile = dir + '/core/app/assets/styles/app-imports.scss',
		relativePath = path.relative( path.dirname(importsFile), this.resourcePath ).replace( /\\/g, '/' ),
		importStatement = `@import "${ relativePath }";`,
		importContent = fs.readFileSync(importsFile).toString().split("\n"),
		importExists = -1 !== importContent.indexOf( importStatement );

	if ( ! importExists ) {
		fs.open(importsFile, 'a', 666, function( e, id ) {
			fs.write( id, importStatement + "\n", null, 'utf8', function(){
				fs.close(id);
			});
		});
	}
	return ``;
}
