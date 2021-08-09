import FileListFactory from './files/file-list-factory';
import isInstanceof from '../../utils/is-instanceof';
import Mime from 'mime/index';

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
	 * Normalize input to a FileList collection, where each item is a File object. This method can be used to normalize
	 * a vast spectrum of input types - from data url strings to blob objects, and array of them. Other kind of parsers
	 * can be registered to the Manager.
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
	 * Convert a single input item into a File object. First the method checks for Blob or DataTransferItem objects, and
	 * then for data url strings. In any other case, it's trying to resolve the input using the parsers registered to
	 * the Manager by the application.
	 *
	 * @param input
	 * @returns {Promise<File>}
	 */
	async toFile( input ) {
		if ( ! ( input instanceof Blob || isInstanceof( input, DataTransferItem ) ) ) {
			try {
				// In order to check whether it's a data url string, we're trying to decode it. If it is a data url,
				// we can extract the blob and the mime-type, and eventually generate a File object.
				window.atob( input.split( ',' )[ 1 ] );
			} catch ( e ) {
				// If it's not a data url string, we should convert the input into one. At first, we have to find the
				// mime-type, and then use the `createDataUrl` method. This way we can unitedly convert the input to
				// a File object from a data url instead of referring each input format differently.
				const mimeType = await this.manager.getMimeTypeOf( input );

				if ( mimeType ) {
					input = this.constructor.createDataUrl( input, mimeType );
				} else {
					throw new Error( 'The input provided cannot be resolved' );
				}
			}

			// Extract the mime-type and the blob of the input.
			input = fetch( input )
				.then( ( res ) => res.blob() );
		}

		return Promise.resolve( input ).then(
			( blob ) => new File(
				[ blob ],
				this.constructor.createFileName( blob ),
				{ type: blob.type }
			)
		);
	}

	/**
	 * Creates a random file name from a Blob object while using the suitable extension for the blob mime-type.
	 *
	 * @param blob
	 * @returns {string}
	 */
	static createFileName( blob ) {
		return [
			( Math.random() + 1 ).toString( 36 ).substring( 7 ),
			Mime.getExtension( blob.type ),
		].join( '.' );
	}

	/**
	 * A utility for creating a data url string functionally.
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
