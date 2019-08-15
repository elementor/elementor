import Base from './base';

// Delete.
export default class extends Base {
	apply() {
		const { args } = this;

		if ( ! args.element && ! args.elements ) {
			throw Error( 'element or elements are required.' );
		} else if ( args.element && args.elements ) {
			throw Error( 'element and elements cannot go together please select one of them.' );
		}

		const elements = args.elements || [ args.element ],
			options = args.options || {};

		options.trigger = ( ! options.hasOwnProperty( 'trigger' ) || true === options.trigger );

		elements.forEach( ( element ) => {
			if ( options.trigger ) {
				elementor.channels.data.trigger( 'element:before:remove', element.model );
			}

			const parent = element._parent;

			element.model.destroy();

			if ( 'section' === parent.model.get( 'elType' ) && elementor.history.history.getActive() ) {
				if ( 0 === parent.collection.length ) {
					this.handleEmptySection( parent );
				} else {
					parent.resetLayout();
				}
			}

			if ( options.trigger ) {
				elementor.channels.data.trigger( 'element:after:remove', element.model );
			}
		} );
	}

	handleEmptySection( section ) {
		$e.run( 'document/elements/create', { element: section } );
	}
}
