var NewTemplateLayout = require( 'elementor-admin/new-template/layout' );

var NewTemplateModule = elementorModules.ViewModule.extend( {

	getDefaultSettings() {
		return {
			selectors: {
				addButton: 'a.page-title-action[href*="post-new.php?post_type=elementor_library"]:not(#elementor-import-template-trigger), #elementor-template-library-add-new',
			},
		};
	},

	bindEvents() {
		jQuery( document ).on( 'click', this.getSettings( 'selectors' ).addButton, this.onAddButtonClick.bind( this ) );

		elementorCommon.elements.$window.on( 'hashchange', this.showModalByHash.bind( this ) );
	},

	showModalByHash() {
		if ( '#add_new' === location.hash ) {
			this.layout?.showModal();

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

		this.layout?.showModal();
	},
} );

jQuery( function() {
	window.elementorNewTemplate = new NewTemplateModule();
} );
