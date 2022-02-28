import EmptyComponent from 'elementor-elements/views/container/empty-component';

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

		// If parent widget, the empty child-view should be depend on the parent.
		if ( 'widget' === parent.model.get( 'elType' ) ) {
			const elementType = elementor.elementsManager.getElementType(
				parent.model.get( 'elType' ),
				parent.model.get( 'widgetType' )
			);

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
