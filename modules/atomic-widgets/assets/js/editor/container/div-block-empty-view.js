import EmptyComponent from 'elementor-elements/views/container/empty-component';

export default class DivBlockEmptyView extends Marionette.ItemView {
	template = '<div></div>';

	className = 'elementor-empty-view';

	renderReactDefaultElement( container ) {
		const { unmount } = elementor.react.utils.default.render( <EmptyComponent container={ container } />, this.el );
		this.unmount = unmount;
	}

	onRender() {
		this.$el.addClass( this.className );

		this.renderReactDefaultElement();
	}

	onDestroy() {
		this.unmount();
	}
}
