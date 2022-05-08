var NewTemplateLayout = require( 'elementor-admin/new-template/layout' );

var NewTemplateModule = elementorModules.ViewModule.extend( {

	getDefaultSettings() {
		return {
			selectors: {
				addButton: '.page-title-action:first, #elementor-template-library-add-new',
			},
		};
	},

	getDefaultElements() {
		var selectors = this.getSettings( 'selectors' );

		return {
			$addButton: jQuery( selectors.addButton ),
		};
	},

	bindEvents() {
		this.elements.$addButton.on( 'click', this.onAddButtonClick );

		elementorCommon.elements.$window.on( 'hashchange', this.showModalByHash.bind( this ) );
	},

	showModalByHash() {
		if ( '#add_new' === location.hash ) {
			this.layout.showModal();

			location.hash = '';
		}
	},

	onInit() {
		elementorModules.ViewModule.prototype.onInit.apply( this, arguments );

		this.layout = new NewTemplateLayout();

		this.showModalByHash();
	},

	onAddButtonClick( event ) {
		event.preventDefault();

		this.layout.showModal();
	},
} );

jQuery( function() {
	window.elementorNewTemplate = new NewTemplateModule();
} );
