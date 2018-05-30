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
			this.ui.title.addClass( 'elementor-active' );

			this.ui.items.show();
		}
	},

	onTitleClick: function() {
		var $title = this.ui.title,
			$items = this.ui.items,
			activeClass = 'elementor-active',
			isTitleActive = $title.hasClass( activeClass );

		if ( isTitleActive ) {
			$title.removeClass( activeClass );

			$items.slideUp( 300 );
		} else {
			$title.addClass( activeClass );

			$items.slideDown( 300 );
		}
	}
} );

module.exports = PanelElementsCategoryView;
