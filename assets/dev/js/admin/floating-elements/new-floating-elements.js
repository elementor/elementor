import NewFloatingelementsLayout from 'elementor-admin/floating-elements/layout';

const NewFloatingElementsModule = elementorModules.ViewModule.extend( {

	getDefaultSettings() {
		return {
			selectors: {
				addButtonTopBar: 'a.page-title-action[href*="e-floating-buttons"]',
				addButtonAdminBar: '#wp-admin-bar-new-e-floating-buttons a',
				addButtonEmptyTemplate: '#elementor-template-library-add-new',
			},
		};
	},

	bindEvents() {
		const selectors = this.getSettings( 'selectors' );

		jQuery( document ).on( 'click', selectors.addButtonTopBar, this.onAddButtonClick.bind( this ) );
		jQuery( document ).on( 'click', selectors.addButtonAdminBar, this.onAddButtonClick.bind( this ) );
		jQuery( document ).on( 'click', selectors.addButtonEmptyTemplate, this.onAddButtonClick.bind( this ) );
	},

	onInit() {
		elementorModules.ViewModule.prototype.onInit.apply( this, arguments );

		this.layout = new NewFloatingelementsLayout();
	},

	onAddButtonClick( event ) {
		event.preventDefault();

		this.layout.showModal();
	},
} );

document.addEventListener( 'DOMContentLoaded', function() {
	window.elementorNewFloatingElements = new NewFloatingElementsModule();
} );
