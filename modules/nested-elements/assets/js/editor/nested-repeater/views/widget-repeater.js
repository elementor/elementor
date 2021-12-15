const WidgetView = elementor.modules.elements.views.Widget;

/**
 * @extends {BaseElementView}
 */
export class WidgetRepeater extends elementor.modules.elements.views.BaseElement {
	initialize() {
		WidgetView.prototype.initialize.apply( this, arguments );
	}

	events() {
		const events = super.events();

		events.click = ( e ) => {
			const closest = e.target.closest( '.elementor-element' );

			// Click on container.
			if ( 'container' === closest.dataset.element_type ) {
				return true;
			}

			e.stopPropagation();

			$e.run( 'panel/editor/open', {
				model: this.options.model,
				view: this,
			} );
		};

		return events;
	}

	/**
	 * @inheritDoc
	 *
	 * Sometimes the children placement is not in the end of the element, but somewhere else, eg: deep inside the element template.
	 * If `children_placeholder_selector` is set, it will be used to find the correct place to insert the children.
	 */
	getChildViewContainer( containerView, childView ) {
		if ( this.model.config.children_placeholder_selector ) {
			return containerView.$el.find( this.model.config.children_placeholder_selector );
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

	createDefaultChildren() {
		const defaultChildren = this.container.model.getDefaultChildren();

		if ( defaultChildren.length ) {
			defaultChildren.forEach( ( elementModel ) => this.addElement( elementModel, { internal: true } ) );
		}
	}
}

WidgetRepeater.prototype.className = WidgetView.prototype.className;
WidgetRepeater.prototype.getTemplate = WidgetView.prototype.getTemplate;
WidgetRepeater.prototype.getEditButtons = WidgetView.prototype.getEditButtons;
WidgetRepeater.prototype.getRepeaterSettingKey = WidgetView.prototype.getRepeaterSettingKey;
WidgetRepeater.prototype.onModelBeforeRemoteRender = WidgetView.prototype.onModelBeforeRemoteRender;
WidgetRepeater.prototype.onModelRemoteRender = WidgetView.prototype.onModelRemoteRender;
WidgetRepeater.prototype.onBeforeDestroy = WidgetView.prototype.onBeforeDestroy;

module.exports = WidgetRepeater;
