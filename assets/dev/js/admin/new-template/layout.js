const NewTemplateView = require( 'elementor-admin/new-template/view' );

module.exports = elementorModules.common.views.modal.Layout.extend( {

	getModalOptions() {
		return {
			id: 'elementor-new-template-modal',
		};
	},

	getLogoOptions() {
		return {
			title: __( 'New Template', 'elementor' ),
		};
	},

	initialize() {
		elementorModules.common.views.modal.Layout.prototype.initialize.apply( this, arguments );

		const templateTypeSelect = document.getElementById( 'elementor-new-template__form__template-type' );
		const lookupControlIdPrefix = 'elementor-new-template__form__';

		this.showLogo();

		this.showContentView();

		const getDynamicFieldsVisibilityListener = () => {
			elementorAdmin.templateControls.setDynamicFieldsVisibility( lookupControlIdPrefix, elementor_new_template_form_controls );
		};

		this.getModal().onShow = () => {
			elementorAdmin.templateControls.setDynamicFieldsVisibility( lookupControlIdPrefix, elementor_new_template_form_controls );
			templateTypeSelect.addEventListener( 'change', getDynamicFieldsVisibilityListener );
		};

		this.getModal().onHide = () => {
			templateTypeSelect.removeEventListener( 'change', getDynamicFieldsVisibilityListener );
		};
	},

	showContentView() {
		this.modalContent.show( new NewTemplateView() );
	},
} );
