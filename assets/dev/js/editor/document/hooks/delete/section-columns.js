import HookAfter from '../base/after';
import Container from '../../../container/container';

export class SectionsColumns extends HookAfter {
	hook() {
		return 'document/elements/delete';
	}

	id() {
		return 'delete-section-columns';
	}

	conditioning( args ) {
		const { containers = [ args.container ] } = args;

		return ! containers.some( ( container ) =>
			'column' === container.model.get( 'elType' )
		);
	}

	/**
	 * @inheritDoc
	 *
	 * @param {{}} args
	 * @param {Container||Container[]} containers
	 *
	 * @returns {boolean}
	 */
	apply( args, containers ) {
		if ( ! Array.isArray( containers ) ) {
			containers = [ containers ];
		}

		containers.forEach( ( /**Container*/ container ) => {
			const parent = container.parent;

			if ( 'section' !== parent.model.get( 'elType' ) ) {
				return;
			}

			if ( 0 === parent.view.collection.length ) {
				$e.run( 'document/elements/create', {
					container: parent,
					model: {
						elType: 'column',
					},
				} );
			} else {
				parent.view.resetLayout();
			}
		} );
	}
}

export default SectionsColumns;
