export default class NestedViewBase extends elementor.modules.elements.views.BaseWidget {
	// Sometimes the children placement is not in the end of the element, but somewhere else, eg: deep inside the element template.
	// If `defaults_placeholder_selector` is set, it will be used to find the correct place to insert the children.
	getChildViewContainer( containerView, childView ) {
		const { elements_placeholder_selector: customSelector, child_container_placeholder_selector: childContainerSelector } = this.model.config.defaults;

		if ( childView !== undefined && childView._index !== undefined && childContainerSelector ) {
			return containerView.$el.find( `${ childContainerSelector }:nth-child(${ childView._index + 1 })` );
		}

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
