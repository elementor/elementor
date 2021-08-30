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

	id: function() {
		return 'elementor-panel-category-' + this.model.get( 'name' );
	},

	childView: require( 'elementor-panel/pages/elements/views/element' ),

	childViewContainer: '.elementor-panel-category-items',

	initialize: function() {
		const items = this.model.get( 'items' ) || [];

		this.collection = new PanelElementsElementsCollection(
			this.model.get( 'alphabetically' ) ?
				items.sort(
					( a, b ) => ( a.get( 'title' ) > b.get( 'title' ) ) ? 1 : -1
				) :
				items
		);
	},

	behaviors: function() {
		return elementor.hooks.applyFilters( 'panel/category/behaviors', {}, this );
	},

	onRender: function() {
		var isActive = elementor.channels.panelElements.request( 'category:' + this.model.get( 'name' ) + ':active' );

		if ( undefined === isActive ) {
			isActive = this.model.get( 'defaultActive' );
		}

		if ( isActive ) {
			this.$el.addClass( 'elementor-active' );
		} else {
			this.ui.items.css( 'display', 'none' );
		}

		if ( this.model.get( 'conditionallyToggled' ) ) {
			this.toggle( ! this.isEmpty(), true );
		}
	},

	onTitleClick: function() {
		this.toggle();
	},

	toggle: function( state, immediate = false ) {
		var $items = this.ui.items,
			activeClass = 'elementor-active',
			isActive = undefined !== state ? ! state : this.$el.hasClass( activeClass ),
			visibilityFn = isActive ? 'hide' : 'show',
			slideFn = isActive ? 'slideUp' : 'slideDown',
			updateScrollbar = () => elementor.getPanelView().updateScrollbar();

		elementor.channels.panelElements.reply( 'category:' + this.model.get( 'name' ) + ':active', ! isActive );

		this.$el.toggleClass( activeClass, ! isActive );

		if ( immediate ) {
			$items[ visibilityFn ]( 0, updateScrollbar() );
		} else {
			$items[ slideFn ]( 300, updateScrollbar );
		}
	},
} );

module.exports = PanelElementsCategoryView;
