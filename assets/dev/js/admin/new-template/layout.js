var NewTemplateView = require( 'elementor-admin/new-template/view' );

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

		this.showLogo();

		this.showContentView();

		function getDynamicFieldsVisibilityListener() {
			elementorAdmin.templateControls.setDynamicFieldsVisibility('elementor-new-template__form__', elementor_new_template_form_controls);
		}

		function getTemplateTypeSelect() {
			return document.getElementById('elementor-new-template__form__template-type');
		}

		this.getModal().onShow = () => {
			elementorAdmin.templateControls.setDynamicFieldsVisibility('elementor-new-template__form__', elementor_new_template_form_controls);
			getTemplateTypeSelect().addEventListener(
				'change', getDynamicFieldsVisibilityListener);

		};

		this.getModal().onHide = () => {
			getTemplateTypeSelect().removeEventListener(
				'change', getDynamicFieldsVisibilityListener);
		};

	},

	showContentView() {
		this.modalContent.show( new NewTemplateView() );
	},
} );
