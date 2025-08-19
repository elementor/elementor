import NewFloatingelementsLayout from 'elementor-admin/floating-elements/layout';

const NewFloatingElementsModule = elementorModules.ViewModule.extend( {

	getDefaultSettings() {
		return {
			selectors: {
				addButtonTopBar: '.page-title-action',
				addButtonAdminBar: '#wp-admin-bar-new-e-floating-buttons a',
				addButtonEmptyTemplate: '#elementor-template-library-add-new',
			},
		};
	},

	getDefaultElements() {
		const selectors = this.getSettings( 'selectors' );

		return {
			addButtonTopBar: document.querySelector( selectors.addButtonTopBar ),
			addButtonAdminBar: document.querySelector( selectors.addButtonAdminBar ),
			addButtonEmptyTemplate: document.querySelector( selectors.addButtonEmptyTemplate ),
		};
	},

	bindEvents() {
		if ( this.elements.addButtonTopBar !== null ) {
			this.elements.addButtonTopBar.addEventListener( 'click', this.onAddButtonClick );
		}

		if ( this.elements.addButtonAdminBar !== null ) {
			this.elements.addButtonAdminBar.addEventListener( 'click', this.onAddButtonClick );
		}

		if ( this.elements.addButtonEmptyTemplate !== null ) {
			this.elements.addButtonEmptyTemplate.addEventListener( 'click', this.onAddButtonClick );
		}
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
