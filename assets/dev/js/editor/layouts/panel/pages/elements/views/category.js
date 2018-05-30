var PanelElementsElementsCollection = require( '../collections/elements' ),
	PanelElementsCategoryView;

PanelElementsCategoryView = Marionette.CompositeView.extend( {
	template: '#tmpl-elementor-panel-elements-category',

	className: 'elementor-panel-category',

	ui: {
		title: '.elementor-panel-category-title',
		items: '.elementor-panel-category-items'
	},

	events: {
		'click @ui.title': 'onTitleClick'
	},

	id: function() {
		return 'elementor-panel-category-' + this.model.get( 'name' );
	},

	childView: require( 'elementor-panel/pages/elements/views/element' ),

	childViewContainer: '.elementor-panel-category-items',

	initialize: function() {
		this.collection = new PanelElementsElementsCollection( this.model.get( 'items' ) );
	},

	onRender: function() {
		if ( this.model.get( 'defaultActive' ) ) {
			this.$el.addClass( 'elementor-active' );

			this.ui.items.show();
		}
	},

	onTitleClick: function() {
		var $items = this.ui.items,
			activeClass = 'elementor-active',
			isActive = this.$el.hasClass( activeClass );

		if ( isActive ) {
			this.$el.removeClass( activeClass );

			$items.slideUp( 300 );
		} else {
			this.$el.addClass( activeClass );

			$items.slideDown( 300 );
		}
	}
} );

module.exports = PanelElementsCategoryView;
