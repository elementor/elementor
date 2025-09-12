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

		this.showLogo();

		this.showContentView();

		this.initElements();

		this.lockProBehavior = new LockPro( this.elements );
		this.lockProBehavior.bindEvents();

		this.setupDynamicControlsVisibility();
	},

	setupDynamicControlsVisibility() {
		// eslint-disable-next-line camelcase
		const isFormControlsDefined = 'undefined' !== typeof elementor_new_template_form_controls;

		if ( ! isFormControlsDefined ) {
			return;
		}

		const CONTROL_ID_PREFIX = 'elementor-new-template__form__';
		const templateTypeSelectId = `${ CONTROL_ID_PREFIX }template-type`;

		const dynamicControlsVisibilityListener = () => {
			// eslint-disable-next-line camelcase
			elementorAdmin.templateControls.setDynamicControlsVisibility( CONTROL_ID_PREFIX, elementor_new_template_form_controls );
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
