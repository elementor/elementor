export class View extends $e.components.get( 'nested-elements/nested-repeater' ).exports.NestedViewBase {
	events() {
		const events = super.events();

		events.click = ( e ) => {
			// If the clicked Nested Element is not within the currently edited document, don't do anything with it.
			if ( elementor.documents.currentDocument.id.toString() !== e.target.closest( '.elementor' ).dataset.elementorId ) {
				return;
			}

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

	/**
	 * Function renderHTML().
	 *
	 * The `renderHTML()` method is overridden as it causes redundant renders when removing focus from any nested element.
	 * This is because the original `renderHTML()` method sets `editModel.renderOnLeave = true;`.
	 */
	renderHTML() {
		const templateType = this.getTemplateType(),
			editModel = this.getEditModel();

		if ( 'js' === templateType ) {
			editModel.setHtmlCache();
			this.render();
		} else {
			editModel.renderRemoteServer();
		}
	}
}

export default View;
