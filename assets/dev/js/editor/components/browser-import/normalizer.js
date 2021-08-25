import isInstanceof from '../../utils/is-instanceof';
import Mime from 'mime/index';
import FileCollection from 'elementor-editor/components/browser-import/files/file-collection';

export default class Normalizer {
	/**
	 * Normalizer constructor.
	 *
	 * @param manager
	 * @param input
	 * @param options
	 */
	constructor( manager, input, options = {} ) {
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
		if ( ! ( input instanceof FileCollection ) ) {
			input = this.toFileCollection( input );
		}

		return input;
	}

	/**
	 * Convert an single or multiple input items into a FileList object. To learn more about the way each item is
	 * treated, please refer to the 'toFile' method.
	 *
	 * @param input
	 * @returns {Promise<FileList>}
	 */
	async toFileCollection( input ) {
		if ( ! Array.isArray( input ) ) {
			input = isInstanceof( input, FileList ) || isInstanceof( input, DataTransferItemList ) ?
				Array.from( input ) :
				[ input ];
		}

		return Promise.all(
			input.map( ( item ) => {
				// Creating a FileList can only be made with an array of File objects. Therefore, unless the item is
				// a File object, we should transform it into one.
				if ( ! isInstanceof( item, File ) ) {
					item = this.toFile( item );
				}

				return item;
			} )
		).then( ( files ) => new FileCollection( files ) );
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
			input = await fetch( input )
				.then( ( res ) => res.blob() );
		}

		return new File(
				[ input ],
				this.constructor.createFileName( input ),
				{ type: input.type }
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
			elementorCommon.helpers.getUniqueId(),
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
