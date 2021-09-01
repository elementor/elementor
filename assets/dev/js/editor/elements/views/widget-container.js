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

	className() {
		const baseClasses = super.className();

		return baseClasses + ' elementor-widget ' + elementor.getElementData( this.getEditModel() ).html_wrapper_class;
	}

	events() {
		const events = super.events();

		events.click = () => $e.run( 'panel/editor/open', {
			model: this.options.model,
			view: this,
		} );

		return events;
	}

	attachHtml( collectionView, childView, index ) {
		// Same as original but passes index to '_insertAfter'.
		if ( collectionView._isBuffering ) {
			// buffering happens on reset events and initial renders
			// in order to reduce the number of inserts into the
			// document, which are expensive.
			collectionView._bufferedChildren.splice( index, 0, childView );
		} else if ( ! collectionView._insertBefore( childView, index ) ) {
			// If we've already rendered the main collection, append
			// the new child into the correct order if we need to. Otherwise
			// append to the end.
			collectionView._insertAfter( childView, index );
		}
	}

	_insertAfter( childView, index ) {
		const $container = this.getChildViewContainer( this, childView, index );
		$container.append( childView.el );
	}

	getChildViewContainer( containerView, childView, index = -1 ) {
		if ( -1 !== index && this.config.children_placeholder_class ) {
			const childrenPlaceholder = this.config.children_placeholder_class,
				isRepeater = containerView.model
				.get( 'settings' )
				.get( containerView.config.name );

			if ( ! isRepeater ) {
				return containerView.$el.find( `.${ childrenPlaceholder }` );
			}

			return containerView.$el.find( `.${ childrenPlaceholder }[data-index="${ index }"]` );
		}

		return super.getChildViewContainer( containerView, childView );
	}

	getChildType() {
		return [ 'section', 'container' ];
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

WidgetContainer.prototype.getTemplate = WidgetBase.prototype.getTemplate;
WidgetContainer.prototype.getEditButtons = WidgetBase.prototype.getEditButtons;
WidgetContainer.prototype.getRepeaterSettingKey = WidgetBase.prototype.getRepeaterSettingKey;

module.exports = WidgetContainer;
