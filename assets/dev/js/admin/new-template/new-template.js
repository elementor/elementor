var NewTemplateLayout = require( 'elementor-admin/new-template/layout' );

var NewTemplateModule = elementorModules.ViewModule.extend( {

	getDefaultSettings: function() {
		return {
			selectors: {
				addButton: '.page-title-action:first, #elementor-template-library-add-new',
			},
		};
	},

	getDefaultElements: function() {
		var selectors = this.getSettings( 'selectors' );

		return {
			$addButton: jQuery( selectors.addButton ),
		};
	},

	bindEvents: function() {
		this.elements.$addButton.on( 'click', this.onAddButtonClick );
	},

	onInit: function() {
		elementorModules.ViewModule.prototype.onInit.apply( this, arguments );

		this.layout = new NewTemplateLayout();

		if ( '#add_new' === location.hash ) {
			this.layout.showModal();
		}
	},

	onAddButtonClick: function( event ) {
		event.preventDefault();

		this.layout.showModal();
	},
} );

jQuery( function() {
	window.elementorNewTemplate = new NewTemplateModule();
} );
