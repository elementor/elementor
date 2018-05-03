module.exports = Marionette.ItemView.extend( {

	id: 'elementor-get-started',

	template: '#tmpl-elementor-get-started',

	$activeItem: null,

	$activeMenuItem: null,

	ui: {
		items: '.elementor-get-started__item',
		actions: '[data-elementor-action]'
	},

	events: {
		'click @ui.actions': 'onActionClick'
	},

	activateItem: function( action ) {
		var $item = this.ui.items.filter( '#elementor-get-started__item-' + action ),
			$menuItem = this.ui.actions.filter( '[data-elementor-action="' + action + '"]' );

		if ( this.$activeItem ) {
			this.$activeItem.add( this.$activeMenuItem ).removeClass( 'elementor-active' );
		}

		$item.add( $menuItem ).addClass( 'elementor-active' );

		this.$activeItem = $item;

		this.$activeMenuItem = $menuItem;
	},

	onRender: function() {
		this.activateItem( 'welcome' );
	},

	onActionClick: function( event ) {
		this.activateItem( event.currentTarget.dataset.elementorAction );
	}
} );
