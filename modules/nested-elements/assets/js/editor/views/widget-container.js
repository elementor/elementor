const WidgetView = elementor.modules.elements.views.Widget;

/**
 * @extends {BaseElementView}
 */
class WidgetContainer extends elementor.modules.elements.views.BaseElement {
	initialize() {
		this.config = elementor.widgetsCache[ this.options.model.attributes.widgetType ];

		this.once( 'container:created', this.onContainerCreatedOnce.bind( this ) );

		WidgetView.prototype.initialize.apply( this, arguments );
	}

	events() {
		const events = super.events();

		events.click = ( e ) => {
			const $parentsUntil = jQuery( e.target ).parentsUntil( '.elementor-widget-container' );

			if ( 3 <= $parentsUntil.length ) {
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

		options.onAfterAdd = ( /* Backbone.Model */ eContainerModel ) => {
			container.view.trigger( 'nested-modules:add-element:after', { model: eContainerModel, options } );
		};

		return super.addElement( data, options );
	}
}

WidgetContainer.prototype.className = WidgetView.prototype.className;
WidgetContainer.prototype.getTemplate = WidgetView.prototype.getTemplate;
WidgetContainer.prototype.getEditButtons = WidgetView.prototype.getEditButtons;
WidgetContainer.prototype.getRepeaterSettingKey = WidgetView.prototype.getRepeaterSettingKey;
WidgetContainer.prototype.onModelBeforeRemoteRender = WidgetView.prototype.onModelBeforeRemoteRender;
WidgetContainer.prototype.onModelRemoteRender = WidgetView.prototype.onModelRemoteRender;
WidgetContainer.prototype.onBeforeDestroy = WidgetView.prototype.onBeforeDestroy;

module.exports = WidgetContainer;
