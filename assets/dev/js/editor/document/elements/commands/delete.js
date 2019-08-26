import Base from './base';

// Delete.
export default class extends Base {
	validateArgs( args ) {
		this.requireElements( args );
	}

	getHistory( args ) {
		const { elements = [ args.element ] } = args;

		return {
			elements,
			type: 'remove',
		};
	}

	apply( args ) {
		const { elements = [ args.element ] } = args;

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
