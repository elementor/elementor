export default class LockPro {
	constructor( elements ) {
		this.elements = elements;
	}

	bindEvents() {
		const { form, templateType } = this.elements;

		form.addEventListener( 'submit', this.onFormSubmit.bind( this ) );
		templateType.addEventListener( 'change', this.onTemplateTypeChange.bind( this ) );

		// Force checking on render, to make sure that default values are also checked.
		this.onTemplateTypeChange();
	}

	onFormSubmit( e ) {
		const lockOptions = this.getCurrentLockOptions();

		if ( lockOptions.is_locked ) {
			e.preventDefault();
		}
	}

	onTemplateTypeChange() {
		const lockOptions = this.getCurrentLockOptions();

		if ( lockOptions.is_locked ) {
			this.lock( lockOptions );
		} else {
			this.unlock();
		}
	}

	getCurrentLockOptions() {
		const { templateType } = this.elements,
			currentOption = templateType.options[ templateType.selectedIndex ];

		return JSON.parse( currentOption.dataset.lock || '{}' );
	}

	lock( lockOptions ) {
		this.showLockBadge( lockOptions.badge );
		this.showLockButton( lockOptions.button );
		this.hideSubmitButton();
	}

	unlock() {
		this.hideLockBadge();
		this.hideLockButton();
		this.showSubmitButton();
	}

	showLockBadge( badgeConfig ) {
		const { lockBadge, lockBadgeText, lockBadgeIcon } = this.elements;

		lockBadgeText.innerText = badgeConfig.text;
		lockBadgeIcon.className = badgeConfig.icon;
		lockBadge.classList.remove( 'e-hidden' );
	}

	hideLockBadge() {
		this.elements.lockBadge.classList.add( 'e-hidden' );
	}

	showLockButton( buttonConfig ) {
		const { lockButton } = this.elements;

		lockButton.href = this.replaceLockLinkPlaceholders( buttonConfig.url );
		lockButton.innerText = buttonConfig.text;
		lockButton.classList.remove( 'e-hidden' );
	}

	hideLockButton() {
		this.elements.lockButton.classList.add( 'e-hidden' );
	}

	showSubmitButton() {
		this.elements.submitButton.classList.remove( 'e-hidden' );
	}

	hideSubmitButton() {
		this.elements.submitButton.classList.add( 'e-hidden' );
	}

	replaceLockLinkPlaceholders( link ) {
		return link
			.replace( /%%utm_source%%/g, 'wp-add-new' )
			.replace( /%%utm_medium%%/g, 'wp-dash' );
	}
}
