import isInstanceof from '../../utils/is-instanceof';
import Item from './items/item';
import ItemCollection from './items/item-collection';

/**
 * @typedef {import('../modules/component-base')} ComponentBase
 */
/**
 * @typedef {import('./manager')} Manager
 */
export default class Normalizer {
	/**
	 * Normalizer constructor.
	 *
	 * @param {Manager} manager
	 */
	constructor( manager ) {
		this.manager = manager;
	}

	/**
	 * Normalize input to an ItemCollection, where each item is an Item object. This method can be used to normalize a
	 * vast spectrum of input types - from data url strings to blob objects, and array of them. Other kind of parsers
	 * can be registered to the Manager.
	 *
	 * @param {*} input
	 * @return {Promise<ItemCollection>} result
	 */
	async normalize( input ) {
		if ( ! ( input instanceof ItemCollection ) ) {
			input = this.toItemCollection( input );
		}

		return input;
	}

	/**
	 * Convert an single or multiple input subjects into a ItemCollection object. To learn more about the way each
	 * subject is treated, please refer the 'toItem' method.
	 *
	 * @param {*} subjects
	 * @return {Promise<ItemCollection>} result
	 */
	async toItemCollection( subjects ) {
		if ( ! Array.isArray( subjects ) ) {
			subjects = isInstanceof( subjects, FileList ) || isInstanceof( subjects, DataTransferItemList )
				? Array.from( subjects )
				: [ subjects ];
		}

		return Promise.all(
			subjects.map( ( subject ) => {
				// Creating a ItemCollection can only be made with an array of Item objects. Therefore, unless the
				// subject is an Item object, we should transform it into one.
				if ( ! ( subject instanceof Item ) ) {
					subject = this.toItem( subject );
				}

				return subject;
			} ),
		).then( ( items ) => new ItemCollection( items ) );
	}

	/**
	 * Convert a single subject into an Item object.
	 *
	 * @param {*} subject
	 * @return {Promise<Item>} result
	 */
	async toItem( subject ) {
		// The method purpose is to generate an Item object, which requires a Blob/File objects. When the subject is
		// already a Blob/File or a DataTransferItem object, no further actions has to be taken in order to create an
		// Item object. In other cases, we check whether it's a data url (which can be used to create a Blob), or
		// otherwise try to resolve the input using the readers registered to the Manager by the application.
		if ( ! isInstanceof( subject, [ Blob, File, DataTransferItem ] ) ) {
			try {
				// In order to check whether it's a data url string, we're trying to decode it. If it is a data url,
				// we can extract the blob later using `fetch`.
				window.atob( subject.split( ',' )[ 1 ] );
			} catch ( e ) {
				// If it's not a data url string, we should resolve the subject by the readers registered to the
				// Manager. At first, we have to find the mime-type, and then use the `createDataUrl` method. This way
				// we can unitedly convert the input to a Blob object from a data url using `fetch`, instead of
				// referring each input format differently.
				const mimeType = await this.manager.getMimeTypeOf( subject );

				if ( mimeType ) {
					subject = this.constructor.createDataUrl( subject, mimeType );
				} else {
					throw new Error( 'The input provided cannot be resolved' );
				}
			}

			// Extract the Blob object of the input.
			subject = await fetch( subject )
				.then( ( res ) => res.blob() );
		}

		return new Item( subject );
	}

	/**
	 * A utility for creating a data url string functionally.
	 *
	 * @param {string}           data
	 * @param {string|undefined} mimeType
	 * @param {boolean}          base64
	 * @return {string} data URI
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
