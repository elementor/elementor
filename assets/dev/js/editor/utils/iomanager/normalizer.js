import FileListFactory from './files/file-list-factory';
import JsonScheme from './schemes/json-scheme';
import HtmlScheme from './schemes/html-scheme';

export default class Normalizer {
	/**
	 * Normalize input so each item is represented as a File object and the whole collection is a FileList object.
	 *
	 * @param input
	 * @returns {Promise<FileList>}
	 */
	static async normalize( input ) {
		if ( ! FileListFactory.isFileList( input ) ) {
			input = this.toFileList( input );
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
	static async toFileList( input ) {
		return Promise.all(
			( Array.isArray( input ) ? input : [ input ] ).map( ( item ) => {
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
	static async toFile( input ) {
		if ( ! ( input instanceof Blob ) ) {
			// Here we are dealing with an input which is neither a Blob nor File objects. So it's probably a Json,
			// Html or base64 string, or a JavaScript object of an another kind. The main goal of the method is to
			// return a File object, and therefore, we need to provide among other things a mime-type. In case of
			// base64 string, in order to extract the mime-type, we can dispatch a fetch request which resulting a
			// Blob object that contains the mime-type. That is, dealing with Blob objects is a great way to
			// eventually create a File object, because they include all things needed. If we're already creating
			// a File object using a Blob object, we can use the same process for Json and Html strings, by
			// initially converting them to a base64 string with the appropriate mime-type. This way, all strings
			// are going through the same effective process without treating each string type differently in the
			// way of creating the File object.
			try {
				// If conversion from base64 succeed, then it's a base64 and therefore we can continue to extracting
				// its media-type and Blob object and put it into a File object.
				window.atob( input );
			} catch ( e ) {
				if ( HtmlScheme.validate( input ) ) {
					input = this.createDataUrl( input, HtmlScheme.mimeType );
				} else {
					input = this.createDataUrl(
						input instanceof String ? input : JsonScheme.parse( input ),
						JsonScheme.mimeType
					);
				}
			}

			input = fetch( input )
				.then( ( res ) => res.blob() );
		}

		return input.then(
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
