module.exports = Marionette.ItemView.extend( {
	options: {
		activeClass: 'elementor-active'
	},

	template: '#tmpl-elementor-template-library-header-menu',

	id: 'elementor-template-library-header-menu',

	ui: {
		menuItems: '.elementor-template-library-menu-item'
	},

	events: {
		'click @ui.menuItems': 'onMenuItemClick'
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
		var currentSource = elementor.templates.getFilter( 'source' ),
			$sourceItem = this.ui.menuItems.filter( '[data-template-source="' + currentSource + '"]' );

		if ( 'remote' === currentSource ) {
			$sourceItem = $sourceItem.filter( '[data-template-type="' + elementor.templates.getFilter( 'type' ) + '"]' );
		}

		this.activateMenuItem( $sourceItem );
	},

	onMenuItemClick: function( event ) {
		var item = event.currentTarget,
			itemData = item.dataset;

		this.activateMenuItem( jQuery( item ) );

		elementor.templates.setTemplatesSource( item.dataset.templateSource, itemData.templateType );
	}
} );
