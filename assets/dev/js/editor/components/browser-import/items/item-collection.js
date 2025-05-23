import Item from './item';

export default class ItemCollection {
	/**
	 * The Item objects list.
	 */
	items;

	/**
	 * ItemCollection constructor.
	 *
	 * @param {Array<*>} items
	 */
	constructor( items = [] ) {
		this.setItems( items );
	}

	/**
	 * Set the Item objects list.
	 *
	 * @param {Array<*>} items
	 */
	setItems( items = [] ) {
		for ( const item of items ) {
			if ( ! ( item instanceof Item ) ) {
				throw new Error( 'ItemCollection can only contain Item objects' );
			}
		}

		this.items = items;
	}

	/**
	 * Get the Item objects list.
	 *
	 * @return {[]} items
	 */
	getItems() {
		return this.items;
	}

	/**
	 * Get files of all items.
	 *
	 * @return {[]} files
	 */
	getFiles() {
		return this.items.map( ( item ) => item.getFile() );
	}
}
