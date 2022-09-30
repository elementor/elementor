const path = require( 'path' );
const fs = require( 'fs' );

class RemoveChunksPlugin {
	constructor( chunkSuffix ) {
		this.chunkSuffix = chunkSuffix;
	}

	apply( compiler ) {
		compiler.hooks.afterPlugins.tap( 'RemoveChunksPlugin', () => this.removeChunks() );
	}

	removeChunks() {
		if ( ! this.chunkSuffix ) {
			return;
		}

		const chunksFolder = path.resolve( __dirname, '../assets/js' );

		if ( fs.existsSync( chunksFolder ) ) {
			fs.readdir( chunksFolder, ( err, files ) => {
				if ( err ) throw err;

				for ( const fileName of files ) {
					const filePath = path.join( chunksFolder, fileName );

					if ( -1 !== fileName.indexOf( this.chunkSuffix ) && fs.existsSync( filePath ) ) {
						fs.unlink( filePath, err => {
							if ( err ) throw err;
						} );
					}
				}
			} );
		}
	}
}

module.exports = RemoveChunksPlugin;
