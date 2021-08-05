import FileListFactory from './files/file-list-factory';
import isInstanceof from '../../utils/is-instanceof';

export default class Normalizer {
	/**
	 * Normalizer constructor.
	 *
	 * @param manager
	 */
	constructor( manager ) {
		this.manager = manager;
	}

	/**
	 * Normalize input so each item is represented as a File object and the whole collection is a FileList object.
	 *
	 * @param input
	 * @returns {Promise<FileList>}
	 */
	async normalize( input ) {
		if ( ! FileListFactory.isFileList( input ) ) {
			return this.toFileList( input );
		}

		return Promise.resolve( input );
	}

	/**
	 * Convert an single or multiple input items into a FileList object. To learn more about the way each item is
	 * treated, please refer to the 'toFile' method.
	 *
	 * @param input
	 * @returns {Promise<FileList>}
	 */
	async toFileList( input ) {
		if ( ! Array.isArray( input ) ) {
			input = isInstanceof( input, DataTransferItemList ) ? Array.from( input ) : [ input ];
		}

		return Promise.all(
			input.map( ( item ) => {
				// Creating a FileList can only be made with an array of File objects. Therefore, unless the item is
				// a File object, we should transform it into one.
				if ( ! ( item instanceof File ) ) {
					return this.toFile( item );
				}

				return item;
			} )
		).then( ( files ) => FileListFactory.createFileList( files ) );
	}

	/**
	 * Convert a single input item into a File object. This method can deal with Blob objects, strings like base64,
	 * Json or even Html and produce a suitable file with appropriate mime-type. Other JavaScript objects are
	 * converted to Json format.
	 *
	 * @param input
	 * @returns {Promise<File>}
	 */
	async toFile( input ) {
		if ( ! ( input instanceof Blob || isInstanceof( input, DataTransferItem ) ) ) {
			try {
				// If conversion from base64 succeed, then it's a base64 and therefore we can continue to extracting
				// its media-type and Blob object and put it into a File object.
				window.atob( input );
			} catch ( e ) {
				const mimeType = this.manager.getMimeTypeOf( input );

				if ( mimeType ) {
					input = this.constructor.createDataUrl( input, mimeType );
				} else {
					throw new Error( 'The input provided cannot be resolved' );
				}
			}

			input = fetch( input )
				.then( ( res ) => res.blob() );
		}

		return Promise.resolve( input ).then(
			( blob ) => new File( [ blob ], null, { type: blob.type } )
		);
	}

	/**
	 * Create a data url string functionally.
	 *
	 * @param data
	 * @param mimeType
	 * @param base64
	 * @returns {string}
	 */
	static createDataUrl( data, mimeType = null, base64 = true ) {
		if ( base64 ) {
			data = `base64,${ btoa( data ) }`;
		}

		if ( mimeType ) {
			mimeType += ';';
		}

		return `data:${ mimeType || '' }${ data }`;
	}
}
