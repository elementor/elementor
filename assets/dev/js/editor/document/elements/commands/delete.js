import Base from './base';

// Delete.
export default class extends Base {
	getHistory( args ) {
		// TODO: Move command to new syntax.
		return false;
	}

	apply() {
		const { args } = this;

		if ( ! args.element && ! args.elements ) {
			throw Error( 'element or elements are required.' );
		} else if ( args.element && args.elements ) {
			throw Error( 'element and elements cannot go together please select one of them.' );
		}

		const elements = args.elements || [ args.element ];

		let historyId = null;

		if ( elementor.history.history.getActive() ) {
			historyId = $e.run( 'document/history/startLog', {
				elements: elements,
				type: 'remove',
				returnValue: true,
			} );
		}

		elements.forEach( ( element ) => {
			const parent = element._parent;

			element.model.destroy();

			if ( 'section' === parent.model.get( 'elType' ) ) {
				if ( 0 === parent.collection.length && elementor.history.history.getActive() ) {
					this.handleEmptySection( parent );
				} else if ( parent.collection.length ) {
					parent.resetLayout();
				}
			}
		} );

		if ( historyId ) {
			$e.run( 'document/history/endLog', { id: historyId } );
		}
	}

	handleEmptySection( section ) {
		$e.run( 'document/elements/create', {
			model: {
				elType: 'column',
			},
			element: section,
		} );
	}
}
