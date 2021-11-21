import EmptyComponent from './empty-component';

export default class EmptyView extends Marionette.ItemView {
	template = '<div></div>';

	className = 'elementor-empty-view';

	initialize( options ) {
		super.initialize( options );

		this.ownerView = options.emptyViewOwner;
	}

	renderReactDefaultElement( container ) {
		let defaultElement;

		const parent = container.parent,
			registeredElementArgs = elementor.getRegisteredElementType(
				parent.model.get( 'elType' ),
				parent.model.get( 'widgetType' )
			);

		if ( registeredElementArgs?.EmptyView ) {
			defaultElement = <registeredElementArgs.EmptyView container={container} />;
		} else {
			defaultElement = <EmptyComponent container={container} />;
		}

		ReactDOM.render( defaultElement, this.el );
	}

	attachElContent() {
		this.$el.addClass( this.className );

		if ( this.ownerView.container ) {
			return this.renderReactDefaultElement( this.ownerView.container );
		}

		this.ownerView.once( 'container:created', () => {
			this.renderReactDefaultElement( this.ownerView.container );
		} );
	}
}
