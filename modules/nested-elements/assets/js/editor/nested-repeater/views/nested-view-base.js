export default class NestedViewBase extends elementor.modules.elements.views.BaseWidget {
	// Sometimes the children placement is not in the end of the element, but somewhere else, eg: deep inside the element template.
	// If `defaults_placeholder_selector` is set, it will be used to find the correct place to insert the children.
	getChildViewContainer( containerView, childView ) {
		const customSelector = this.model.config.defaults.elements_placeholder_selector;

		if ( customSelector ) {
			return containerView.$el.find( this.model.config.defaults.elements_placeholder_selector );
		}

		return super.getChildViewContainer( containerView, childView );
	}

	getChildType() {
		return [ 'container' ];
	}

	onRender() {
		super.onRender();

		this.normalizeAttributes();
	}
}
