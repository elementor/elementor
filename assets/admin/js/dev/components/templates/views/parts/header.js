var TemplatesHeaderView;

TemplatesHeaderView = Marionette.ItemView.extend( {
	options: {
		activeClass: 'elementor-active'
	},

	id: 'elementor-templates-header',

	template: '#tmpl-elementor-templates-header',

	ui: {
		closeModal: '#elementor-templates-header-close-modal',
		menuItems: '.elementor-templates-menu-item',
		menuMyTemplates: '#elementor-templates-menu-my-templates'
	},

	events: {
		'click @ui.closeModal': 'onCloseModalClick',
		'click @ui.menuItems': 'onMenuItemClick',
		'click @ui.menuMyTemplates': 'onMenuMyTemplatesClick'
	},

	$activeItem: null,

	onRender: function() {
		this.$activeItem = this.ui.menuItems.filter( '.' + this.getOption( 'activeClass' ) );
	},

	onCloseModalClick: function() {
		elementor.templates.getModal().hide();
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

module.exports = TemplatesHeaderView;
