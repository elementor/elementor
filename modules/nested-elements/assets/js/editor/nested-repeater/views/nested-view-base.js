/**
 * @name NestedViewBase
 * @extends {BaseWidgetView}
 */
export default class NestedViewBase extends elementor.modules.elements.views.BaseWidget {
	behaviors() {
		const behaviors = super.behaviors();

		behaviors.Sortable = {
			behaviorClass: require( '../behaviors/sortable' ).default,
			elChildType: 'container',
		};

		return behaviors;
	}

	/**
	 * @inheritDoc
	 *
	 * Sometimes the children placement is not in the end of the element, but somewhere else, eg: deep inside the element template.
	 * If `defaults_placeholder_selector` is set, it will be used to find the correct place to insert the children.
	 */
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

	/**
	 * TODO: Remove. It's a temporary solution for the Navigator sortable.
	 * Copied from `elementor-elements/views/container.js`.
	 *
	 * @return {{}}
	 */
	getSortableOptions() {
		return {
			preventInit: true,
		};
	}

	onRender() {
		super.onRender();

		this.normalizeAttributes();
	}
}
