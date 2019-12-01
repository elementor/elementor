import Base from '../../commands/base/base';

export class LogSubItem extends Base {
	apply( args ) {
		if ( ! elementor.history.history.getActive() ) {
			return;
		}

		const id = args.id || elementor.history.history.getCurrentId();

		args = this.component.normalizeLogTitle( args );

		const items = elementor.history.history.getItems(),
			item = items.findWhere( { id } );

		if ( ! item ) {
			throw new Error( 'History item not found.' );
		}

		/**
		 * Sometimes `args.id` passed to `LogSubItem`, to add sub item for specific id.
		 * this `id` should not be passed as sub-item.
		 */
		if ( args.id ) {
			delete args.id;
		}

		item.get( 'items' ).unshift( args );
	}
}

export default LogSubItem;
