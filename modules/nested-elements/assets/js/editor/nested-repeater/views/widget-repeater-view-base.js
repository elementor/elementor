/**
 * @name WidgetRepeaterViewBase
 * @extends {BaseWidgetView}
 */
export default class WidgetRepeaterViewBase extends elementor.modules.elements.views.BaseWidget {
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

	onRender() {
		super.onRender();

		const editModel = this.getEditModel(),
			skinType = editModel.getSetting( '_skin' ) || 'default';

		// To support handlers - Copied from widget-base.
		this.$el
			.attr( 'data-widget_type', editModel.get( 'widgetType' ) + '.' + skinType )
			.removeClass( 'elementor-widget-empty' )
			.children( '.elementor-widget-empty-icon' )
			.remove();
	}
}
