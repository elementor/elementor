const BaseElementView = require( 'elementor-elements/views/base' ),
	WidgetView = require( 'elementor-elements/views/widget' );

/**
 * @extends {BaseElementView}
 */
class WidgetContainer extends BaseElementView {
	initialize() {
		this.config = elementor.widgetsCache[ this.options.model.attributes.widgetType ];

		this.once( 'container:created', this.onContainerCreatedOnce.bind( this ) );

		WidgetView.prototype.initialize.apply( this, arguments );
	}

	events() {
		const events = super.events();

		events.click = ( e ) => {
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

		this.linksData();
	}

	renderOnChange( settings, requestedContainer ) {
		if ( this.links ) {
			this.links.forEach( ( link ) => {
				switch ( link.dataset.linkType ) {
					case 'repeater-item': {
						const index = requestedContainer.parent.children.indexOf( requestedContainer );

						if ( index === parseInt( link.dataset.linkIndex - 1 ) ) {
							const change = settings.changed[ link.dataset.linkSetting ];

							if ( change ) {
								jQuery( link.el ).html( change );
							}
						}
					}
				}
			} );

			return this.applyChanges( settings, false );
		}

		super.renderOnChange( settings );
	}

	onContainerCreatedOnce() {
		const { defaultChildren = [] } = this.container.model;

		if ( defaultChildren.length ) {
			defaultChildren.forEach( ( elementModel ) => this.addElement( elementModel ) );
		}
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
