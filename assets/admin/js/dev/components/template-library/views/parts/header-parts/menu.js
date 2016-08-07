var TemplateLibraryHeaderMenuView;

TemplateLibraryHeaderMenuView = Marionette.ItemView.extend( {
	options: {
		activeClass: 'elementor-active'
	},

	template: '#tmpl-elementor-templates-header-menu',

	id: 'elementor-templates-header-menu',

	ui: {
		menuItems: '.elementor-templates-menu-item'
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
		var currentType = elementor.channels.templates.request( 'filter:type' ),
			$typeItem = this.ui.menuItems.filter( '[data-template-type="' + currentType + '"]' );

		this.activateMenuItem( $typeItem );
	},

	onMenuItemClick: function( event ) {
		var item = event.currentTarget;

		this.activateMenuItem( Backbone.$( item ) );

		elementor.channels.templates
			.reply( 'filter:type', item.dataset.templateType )
			.trigger( 'filter:change' );
	}
} );

module.exports = TemplateLibraryHeaderMenuView;
