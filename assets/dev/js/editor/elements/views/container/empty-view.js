import EmptyComponent from 'elementor-elements/views/container/empty-component';

/**
 * This empty view used when the container is empty, then it writes React component into the view.
 * In case of rendering different/custom React component, the switch in 'renderReactDefaultElement' method,
 * can be used to print custom React component in case it registered in `elementsManager`.
 */
export default class EmptyView extends Marionette.ItemView {
	template = '<div></div>';

	className = 'elementor-empty-view';

	initialize( options ) {
		super.initialize( options );

		this.ownerView = options.emptyViewOwner;
	}

	renderReactDefaultElement( container ) {
		const parent = container.parent;

		let defaultElement;

		// If the emptyView is parent of widget. then the emptyView can be searched for in `elementor.elementsManager`,
		// according to the `widgetType`.
		if ( 'widget' === parent.model.get( 'elType' ) ) {
			const elementType = elementor.elementsManager.getElementTypeClass( parent.model.get( 'widgetType' ) );

			if ( elementType ) {
				const Type = elementType.getEmptyView();

				defaultElement = <Type container={ container } />;
			}
		} else {
			defaultElement = <EmptyComponent container={ container } />;
		}

		ReactDOM.render( defaultElement, this.el );
	}

	attachElContent() {
		this.$el.addClass( this.className );

		setTimeout( () => {
			this.renderReactDefaultElement( this.ownerView.container );
		} );
	}
}
