import EmptyComponent from './empty-component';

export default class EmptyView extends Marionette.ItemView {
	template = '<div></div>';

	className = 'elementor-empty-view';

	initialize( options ) {
		super.initialize( options );

		this.ownerView = options.emptyViewOwner;
	}

	renderReactDefaultElement( container ) {
		const DefaultElement = <EmptyComponent container={container} />;

		ReactDOM.render( elementor.hooks.applyFilters( 'elementor/editor/container/empty/render', DefaultElement, container ), this.el );
	}

	attachElContent( html ) {
		const result = super.attachElContent( html );

		result.$el.addClass( this.className );

		if ( this.ownerView.container?.isEmptyRender ) {
			return this.renderReactDefaultElement( self.container );
		}

		this.ownerView.once( 'container:created', () => {
			this.renderReactDefaultElement( this.ownerView.container );

			this.ownerView.container.isEmptyRender = true;
		} );

		return result;
	}
}
