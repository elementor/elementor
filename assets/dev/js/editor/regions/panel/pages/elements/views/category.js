var PanelElementsElementsCollection = require( '../collections/elements' ),
	PanelElementsCategoryView;

PanelElementsCategoryView = Marionette.CompositeView.extend( {
	template: '#tmpl-elementor-panel-elements-category',

	className: 'elementor-panel-category',

	ui: {
		title: '.elementor-panel-category-title',
		items: '.elementor-panel-category-items',
	},

	events: {
		'click @ui.title': 'onTitleClick',
	},

	id() {
		return 'elementor-panel-category-' + this.model.get( 'name' );
	},

	childView: require( 'elementor-panel/pages/elements/views/element' ),

	childViewContainer: '.elementor-panel-category-items',

	initialize() {
		let items = this.model.get( 'items' ) || [];

		switch ( this.model.get( 'sort' ) ) {
			case 'a-z':
				items = items.sort(
					( a, b ) => ( a.get( 'title' ) > b.get( 'title' ) ) ? 1 : -1,
				);
				break;
		}

		this.collection = new PanelElementsElementsCollection( items );
	},

	behaviors() {
		return elementor.hooks.applyFilters( 'panel/category/behaviors', {}, this );
	},

	onRender() {
		let isActive = elementor.channels.panelElements.request( 'category:' + this.model.get( 'name' ) + ':active' );

		if ( undefined === isActive ) {
			isActive = this.model.get( 'defaultActive' );
		}

		if ( ! this.collection.length && this.model.get( 'hideIfEmpty' ) ) {
			this.$el.css( 'display', 'none' );
		}

		if ( isActive ) {
			this.$el.addClass( 'elementor-active' );
		} else {
			this.ui.items.css( 'display', 'none' );
		}
	},

	onTitleClick() {
		this.toggle();

		elementor.editorEvents.dispatchEvent(
			elementor.editorEvents.config.names[ this.model.get( 'name' ) ]?.v1,
			{
				location: elementor.editorEvents.config.locations.widgetPanel,
				secondaryLocation: elementor.editorEvents.config.secondaryLocations[ this.model.get( 'name' ) ],
				trigger: elementor.editorEvents.config.triggers.accordionClick,
				element: elementor.editorEvents.config.elements.accordionSection,
			},
		);
	},

	toggle( state, animate = true ) {
		var $items = this.ui.items,
			activeClass = 'elementor-active',
			isActive = undefined !== state ? ! state : this.$el.hasClass( activeClass ),
			visibilityFn = isActive ? 'hide' : 'show',
			slideFn = isActive ? 'slideUp' : 'slideDown',
			updateScrollbar = () => elementor.getPanelView().updateScrollbar();

		elementor.channels.panelElements.reply( 'category:' + this.model.get( 'name' ) + ':active', ! isActive );

		this.$el.toggleClass( activeClass, ! isActive );

		if ( animate ) {
			$items[ slideFn ]( 300, updateScrollbar );
		} else {
			$items[ visibilityFn ]( 0, updateScrollbar );
		}
	},
} );

module.exports = PanelElementsCategoryView;
