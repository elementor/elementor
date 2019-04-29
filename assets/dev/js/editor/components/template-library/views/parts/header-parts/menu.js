module.exports = Marionette.ItemView.extend( {
	options: {
		activeClass: 'elementor-active',
	},

	template: '#tmpl-elementor-template-library-header-menu',

	id: 'elementor-template-library-header-menu',

	ui: {
		menuItems: '.elementor-template-library-menu-item',
	},

	events: {
		'click @ui.menuItems': 'onMenuItemClick',
	},

	templateHelpers: function() {
		return {
			tabs: elementorCommon.components.get( 'library' ).tabs.getGroup( 'templates' ),
		};
	},

	$activeItem: null,

	activateMenuItem: function( $item ) {
		var activeClass = this.getOption( 'activeClass' );

		if ( this.$activeItem === $item ) {
			return;
		}

		if ( this.$activeItem ) {
			this.$activeItem.removeClass( activeClass );
		}

		$item.addClass( activeClass );

		this.$activeItem = $item;
	},

	onRender: function() {
		var currentRoute = elementorCommon.route.getCurrent( 'library' ),
			$sourceItem = this.ui.menuItems.filter( '[data-route="' + currentRoute + '"]' );

		this.activateMenuItem( $sourceItem );
	},

	onMenuItemClick: function( event ) {
		const item = event.currentTarget;

		this.activateMenuItem( jQuery( item ) );

		elementorCommon.route.to( item.dataset.route );
	},
} );
