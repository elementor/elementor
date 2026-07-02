import ReactUtils from 'elementor-utils/react';
import EmptyComponent from 'elementor-elements/views/container/empty-component';

export default class AtomicElementEmptyView extends Marionette.ItemView {
	template = '<div></div>';

	className = 'elementor-empty-view';

	unmount = null;

	renderReactDefaultElement( container ) {
		const { unmount } = ReactUtils.render( <EmptyComponent container={ container } />, this.el );
		this.unmount = unmount;
	}

	onBeforeRender() {
		// In case the element is being rendered again, we need to unmount the previous React component.
		if ( this.unmount ) {
			this.unmount();
			this.unmount = null;
		}
	}

	onRender() {
		this.$el.addClass( this.className );

		this.renderReactDefaultElement();
	}

	onDestroy() {
		this.unmount?.();
	}
}
