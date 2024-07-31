var NewFloatingelementsLayout = require( 'elementor-admin/floating-elements/layout' );

var NewFloatingElementsModule = elementorModules.ViewModule.extend( {

	getDefaultSettings() {
		return {
			selectors: {
				addButton: '.page-title-action:first, #elementor-template-library-add-new, #wp-admin-bar-new-e-floating-buttons a',
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

		this.layout = new NewFloatingelementsLayout();

		this.showModalByHash();
	},

	onAddButtonClick( event ) {
		event.preventDefault();

		this.layout.showModal();
	},
} );

jQuery( function() {
	window.elementorNewFloatingElements = new NewFloatingElementsModule();
} );
