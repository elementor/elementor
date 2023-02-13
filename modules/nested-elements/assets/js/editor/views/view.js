export class View extends $e.components.get( 'nested-elements/nested-repeater' ).exports.NestedViewBase {
	events() {
		const events = super.events();

		events.click = ( e ) => {
			const closest = e.target.closest( '.elementor-element' );

			let model = this.options.model,
				view = this;

			// For clicks on container/widget.
			if ( [ 'container', 'widget' ].includes( closest?.dataset.element_type ) ) { // eslint-disable-line camelcase
				// In case the container empty, click should be handled by the EmptyView.
				const container = elementor.getContainer( closest.dataset.id );

				if ( container.view.isEmpty() ) {
					return true;
				}

				// If not empty, open it.
				model = container.model;
				view = container.view;
			}

			e.stopPropagation();

			$e.run( 'panel/editor/open', {
				model,
				view,
			} );
		};

		return events;
	}
}

export default View;
