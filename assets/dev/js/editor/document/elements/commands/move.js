import Base from './base';

// Move.
export default class extends Base {
	apply() {
		const { args } = this;

		if ( ! args.target ) {
			throw Error( 'target is required.' );
		}

		if ( ! args.element && ! args.elements ) {
			throw Error( 'element or elements are required.' );
		}

		if ( args.element && args.elements ) {
			throw Error( 'element and elements cannot go together please select one of them.' );
		}

		const options = args.options || {},
			elements = args.element ? [ args.element ] : args.elements;

		elementor.channels.data.trigger( 'drag:before:update', elements[ 0 ].model );

		elements.forEach( ( element ) => {
			const data = element.model.clone();

			$e.run( 'document/elements/create', {
				element: args.target,
				data,
				options,
				returnValue: true,
			} );
		} );

		// For multi selection.
		if ( ! options.onBeforeAdd && ! options.onAfterAdd ) {
			elements.forEach( ( element ) => {
				element._isRendering = true;

				$e.run( 'document/elements/delete', { element } );
			} );
		}

		elementor.channels.data.trigger( 'drag:after:update' );
	}
}
