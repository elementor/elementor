const WidgetView = elementor.modules.elements.views.Widget;

/**
 * @extends {BaseElementView}
 */
export class WidgetRepeater extends elementor.modules.elements.views.BaseElement {
	initialize() {
		this.config = elementor.widgetsCache[ this.options.model.attributes.widgetType ];

		this.once( 'container:created', this.onContainerCreatedOnce.bind( this ) );

		WidgetView.prototype.initialize.apply( this, arguments );
	}

	events() {
		const events = super.events();

		events.click = ( e ) => {
			const $parentsUntil = jQuery( e.target ).parentsUntil( '.elementor-element' );

			// Disable when click is nested.
			if ( 1 === $parentsUntil.length ) {
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
	 * @override
	 *
	 * Sometimes the children placement is not in the end of the element, but somewhere else, eg: deep inside the element template.
	 * If `children_placeholder_selector` is set, it will be used to find the correct place to insert the children.
	 */
	getChildViewContainer( containerView, childView ) {
		if ( this.config.children_placeholder_selector ) {
			return containerView.$el.find( this.config.children_placeholder_selector );
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

		// To support handlers.
		this.$el
			.attr( 'data-widget_type', editModel.get( 'widgetType' ) + '.' + skinType )
			.removeClass( 'elementor-widget-empty' )
			.children( '.elementor-widget-empty-icon' )
			.remove();
	}

	onContainerCreatedOnce() {
		const { defaultChildren = [] } = this.container.model;

		if ( defaultChildren.length ) {
			defaultChildren.forEach( ( elementModel ) => this.addElement( elementModel, { internal: true } ) );
		}
	}

	addElement( data, options = {} ) {
		const container = this.container;

		// Hook 'nested-repeater-adjust-new-container-title' have to ensure that nested element added.
		options.onAfterAdd = ( model ) => {
			container.view.trigger( 'nested-repeater:add-element:after', { model, options } );
		};

		return super.addElement( data, options );
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
