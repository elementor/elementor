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

		events.click = ( e ) => {
			e.stopPropagation();

			$e.run( 'panel/editor/open', {
				model: this.options.model,
				view: this,
			} );
		};

		return events;
	}

	templateHelpers() {
		const baseTemplateHelpers = super.templateHelpers();

		// TODO: Find better solution.
		if ( $e.commands.isCurrentFirstTrace( 'document/elements/create' ) ) {
			baseTemplateHelpers.children = this.model.defaultChildren.map( ( item ) => item.toJSON() );
		} else {
			baseTemplateHelpers.children = this.model.get( 'elements' ).toJSON();
		}

		return baseTemplateHelpers;
	}

	showCollection() {
		// Same as original but passes index to `getChildView`.
		let ChildView;

		const models = this._filteredSortedModels();

		_.each( models, function( child, index ) {
			ChildView = this.getChildView( child, index );
			this.addChild( child, ChildView, index );
		}, this );
	}

	_onCollectionAdd( child, collection, opts ) {
		// Same as original but passes index to `getChildView`.

		// `index` is present when adding with `at` since BB 1.2; indexOf fallback for < 1.2
		let index = opts.at !== undefined && ( opts.index || collection.indexOf( child ) );

		// When filtered or when there is no initial index, calculate index.
		if ( this.getOption( 'filter' ) || false === index ) {
			index = _.indexOf( this._filteredSortedModels( index ), child );
		}

		if ( this._shouldAddChild( child, index ) ) {
			this.destroyEmptyView();
			const ChildView = this.getChildView( child, index );
			this.addChild( child, ChildView, index );
		}
	}

	getChildViewContainer( containerView, childView ) {
		if ( this.config.children_placeholder_class ) {
			return containerView.$el.find( `.${ this.config.children_placeholder_class }` );
		}

		return super.getChildViewContainer( containerView, childView );
	}

	getChildType() {
		return [ 'container' ];
	}

	getChildView( model, index ) {
		if ( 'tabs-v2' === this.model.get( 'widgetType' ) ) {
			model.set( '_index', index );

			return require( './widget-container/tab-container' ).default;
		}

		return super.getChildView( model );
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

module.exports = WidgetContainer;
