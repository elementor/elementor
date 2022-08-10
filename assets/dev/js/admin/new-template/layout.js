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

		this.initElements();

		this.bindEvents();
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

	bindEvents() {
		const { form, templateType } = this.elements;

		form.addEventListener( 'submit', this.onFormSubmit.bind( this ) );
		templateType.addEventListener( 'change', this.onTemplateTypeChange.bind( this ) );
	},

	onFormSubmit( e ) {
		const lockOptions = this.getCurrentLockOptions();

		if ( lockOptions.is_locked ) {
			e.preventDefault();
		}
	},

	onTemplateTypeChange() {
		const lockOptions = this.getCurrentLockOptions();

		if ( lockOptions.is_locked ) {
			this.lock( lockOptions );
		} else {
			this.unlock();
		}
	},

	getCurrentLockOptions() {
		const { templateType } = this.elements,
			currentOption = templateType.options[ templateType.selectedIndex ];

		return JSON.parse( currentOption.dataset.lock || '{}' );
	},

	lock( lockOptions ) {
		this.showLockBadge( lockOptions.badge );
		this.showLockButton( lockOptions.button );
		this.hideSubmitButton();
	},

	unlock() {
		this.hideLockBadge();
		this.hideLockButton();
		this.showSubmitButton();
	},

	showLockBadge( badgeConfig ) {
		const { lockBadge, lockBadgeText, lockBadgeIcon } = this.elements;

		lockBadgeText.innerText = badgeConfig.text;
		lockBadgeIcon.className = badgeConfig.icon;
		lockBadge.classList.remove( 'e-hidden' );
	},

	hideLockBadge() {
		this.elements.lockBadge.classList.add( 'e-hidden' );
	},

	showLockButton( buttonConfig ) {
		const { lockButton } = this.elements;

		lockButton.href = this.replaceLockLinkPlaceholders( buttonConfig.url );
		lockButton.innerText = buttonConfig.text;
		lockButton.classList.remove( 'e-hidden' );
	},

	hideLockButton() {
		this.elements.lockButton.classList.add( 'e-hidden' );
	},

	showSubmitButton() {
		this.elements.submitButton.classList.remove( 'e-hidden' );
	},

	hideSubmitButton() {
		this.elements.submitButton.classList.add( 'e-hidden' );
	},

	replaceLockLinkPlaceholders( link ) {
		// %1$s => utm_source
		// %2$s => utm_medium

		return link
			.replace( /%1\$s/g, 'wp-add-new' )
			.replace( /%2\$s/g, 'wp-dash' );
	},

	showContentView() {
		this.modalContent.show( new NewTemplateView() );
	},
} );
