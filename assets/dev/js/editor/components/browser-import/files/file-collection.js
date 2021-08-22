import isInstanceof from '../../../utils/is-instanceof';

export default class FileCollection {
	/**
	 * The File objects list.
	 */
	files;

	/**
	 * FileCollection constructor.
	 *
	 * @param files
	 */
	constructor( files = [] ) {
		this.setFiles( files );
	}

	/**
	 * Set the File objects list.
	 *
	 * @param files
	 */
	setFiles( files = [] ) {
		for ( const file of files ) {
			if ( ! isInstanceof( file, File ) ) {
				throw new Error( 'FileCollection can only contain File objects' );
			}
		}

		this.files = files;
	}

	/**
	 * Get the File objects list.
	 * @returns {[]}
	 */
	getFiles() {
		return this.files;
	}
}
