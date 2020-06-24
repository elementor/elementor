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

		elementorCommon.elements.$window.on( 'hashchange', this.showModalByHash.bind( this ) );
	},

	showModalByHash: function() {
		if ( '#add_new' === location.hash ) {
			this.layout.showModal();

			location.hash = '';
		}
	},

	onInit: function() {
		elementorModules.ViewModule.prototype.onInit.apply( this, arguments );

		this.layout = new NewTemplateLayout();

		this.showModalByHash();
	},

	onAddButtonClick: function( event ) {
		event.preventDefault();

		this.layout.showModal();
	},
} );

jQuery( function() {
	window.elementorNewTemplate = new NewTemplateModule();
} );
