var NewTemplateView = require( 'elementor-admin/new-template/view' );
import LockPro from './behaviors/lock-pro';

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

		const lookupControlIdPrefix = 'elementor-new-template__form__';
		const templateTypeSelectId = `${ lookupControlIdPrefix }template-type`;

		this.showLogo();

		this.showContentView();

		this.initElements();

		this.lockProBehavior = new LockPro( this.elements );
		this.lockProBehavior.bindEvents();

		const dynamicControlsVisibilityListener = () => {
			elementorAdmin.templateControls.setDynamicControlsVisibility( lookupControlIdPrefix, elementor_new_template_form_controls );
		};

		this.getModal().onShow = () => {
			dynamicControlsVisibilityListener();
			document.getElementById( templateTypeSelectId ).addEventListener( 'change', dynamicControlsVisibilityListener );
		};

		this.getModal().onHide = () => {
			document.getElementById( templateTypeSelectId ).removeEventListener( 'change', dynamicControlsVisibilityListener );
		};
	},

	initElements() {
		const container = this.$el[ 0 ],
			root = '#elementor-new-template__form';

		this.elements = {
			form: container.querySelector( root ),
			submitButton: container.querySelector( `${ root }__submit` ),
			lockButton: container.querySelector( `${ root }__lock_button` ),
			templateType: container.querySelector( `${ root }__template-type` ),
			lockBadge: container.querySelector( `${ root }__template-type-badge` ),
			lockBadgeText: container.querySelector( `${ root }__template-type-badge__text` ),
			lockBadgeIcon: container.querySelector( `${ root }__template-type-badge__icon` ),
		};
	},

	showContentView() {
		this.modalContent.show( new NewTemplateView() );
	},
} );
