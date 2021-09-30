const BaseElementView = require( 'elementor-elements/views/base' ),
	WidgetBase = require( 'elementor-elements/views/widget' );

/**
 * @extends {BaseElementView}
 */
class WidgetContainer extends BaseElementView {
	initialize() {
		this.config = elementor.widgetsCache[ this.options.model.attributes.widgetType ];

		this.once( 'container:created', this.onContainerCreatedOnce.bind( this ) );

		super.initialize();
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
	}

	onContainerCreatedOnce() {
		const { defaultChildren = [] } = this.container.model;

		if ( defaultChildren.length ) {
			defaultChildren.forEach( ( elementModel ) => this.addElement( elementModel ) );
		}
	}
}

WidgetContainer.prototype.className = WidgetBase.prototype.className;
WidgetContainer.prototype.getTemplate = WidgetBase.prototype.getTemplate;
WidgetContainer.prototype.getEditButtons = WidgetBase.prototype.getEditButtons;
WidgetContainer.prototype.getRepeaterSettingKey = WidgetBase.prototype.getRepeaterSettingKey;

module.exports = WidgetContainer;
