var TemplatesHeaderMenuView;

TemplatesHeaderMenuView = Marionette.ItemView.extend( {
	options: {
		activeClass: 'elementor-active'
	},

	template: '#tmpl-elementor-templates-header-menu',

	id: 'elementor-templates-header-menu',

	ui: {
		menuItems: '.elementor-templates-menu-item',
		menuMyTemplates: '#elementor-templates-menu-my-templates'
	},

	events: {
		'click @ui.menuItems': 'onMenuItemClick',
		'click @ui.menuMyTemplates': 'onMenuMyTemplatesClick'
	},

	$activeItem: null,

	onRender: function() {
		this.$activeItem = this.ui.menuItems.filter( '.' + this.getOption( 'activeClass' ) );
	},

	onMenuItemClick: function( event ) {
		var $item = Backbone.$( event.currentTarget ),
			activeClass = this.getOption( 'activeClass' );

		if ( this.$activeItem === $item ) {
			return;
		}

		this.$activeItem.removeClass( activeClass );

		$item.addClass( activeClass );

		this.$activeItem = $item;
	},

	onMenuMyTemplatesClick: function() {
		elementor.templates.showTemplates();
	}
} );

module.exports = TemplatesHeaderMenuView;
