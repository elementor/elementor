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
			const elementType = elementor.getElementType(
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

		if ( this.ownerView.container ) {
			return this.renderReactDefaultElement( this.ownerView.container );
		}

		// Since empty being rendered before the container created, the emptyView requires container.
		// Its required to render only when container is available.
		this.ownerView.once( 'container:created', () => {
			this.renderReactDefaultElement( this.ownerView.container );
		} );
	}
}
