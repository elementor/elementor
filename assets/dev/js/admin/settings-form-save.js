import { __ } from '@wordpress/i18n';

const SETTINGS_FORM_FIELD_SELECTOR = 'input, select, textarea';
const NAV_AFTER_SAVE_STORAGE_KEY = 'elementor_admin_settings_nav_after_save';
const NAV_AFTER_SAVE_INTENT_KEY = 'elementor_admin_settings_nav_after_save_intent';
const SCROLL_Y_AFTER_SAVE_STORAGE_KEY = 'elementor_admin_settings_scroll_y_after_save';

export function serializeSettingsForm( form ) {
	if ( ! form ) {
		return '';
	}

	const entries = [];

	form.querySelectorAll( SETTINGS_FORM_FIELD_SELECTOR ).forEach( ( field ) => {
		if ( ! field.name || field.disabled ) {
			return;
		}

		const fieldType = ( field.type || '' ).toLowerCase();

		if ( 'submit' === fieldType || 'button' === fieldType || 'reset' === fieldType || 'file' === fieldType ) {
			return;
		}

		if ( 'checkbox' === fieldType || 'radio' === fieldType ) {
			if ( ! field.checked ) {
				return;
			}
		}

		entries.push( [ field.name, field.value ] );
	} );

	entries.sort( ( entryA, entryB ) => {
		const nameCompare = entryA[ 0 ].localeCompare( entryB[ 0 ] );

		if ( 0 !== nameCompare ) {
			return nameCompare;
		}

		return String( entryA[ 1 ] ).localeCompare( String( entryB[ 1 ] ) );
	} );

	return entries.map( ( [ name, value ] ) => `${ name }\u0000${ value }` ).join( '\n' );
}

export function resolveAdminNavigationUrl( href, baseHref = window.location.href ) {
	try {
		return new URL( href, baseHref ).href;
	} catch ( error ) {
		return null;
	}
}

export function isNavigationLeavingCurrentScreen( currentHref, targetHref ) {
	const origin = window.location.origin;
	const current = new URL( currentHref, origin );
	const target = new URL( targetHref, origin );

	if ( target.origin !== current.origin ) {
		return true;
	}

	if ( target.pathname !== current.pathname ) {
		return true;
	}

	const currentPage = current.searchParams.get( 'page' );
	const targetPage = target.searchParams.get( 'page' );

	return currentPage !== targetPage;
}

export function isSafeAdminNavigationDestination( destination, origin = window.location.origin ) {
	try {
		const target = new URL( destination );

		if ( target.origin !== origin ) {
			return false;
		}

		return target.pathname.includes( '/wp-admin/' );
	} catch ( error ) {
		return false;
	}
}

const SCREEN_NAV_BODIES = {
	settings: __(
		'You have unsaved changes on Settings. Save your changes before leaving, or discard them to continue.',
		'elementor',
	),
	tools: __(
		'You have unsaved changes on Tools. Save your changes before leaving, or discard them to continue.',
		'elementor',
	),
	'role-manager': __(
		'You have unsaved changes in Role Manager. Save your changes before leaving, or discard them to continue.',
		'elementor',
	),
};

export default class SettingsFormSave {
	constructor( form ) {
		this.form = form;
		this.submitButton = form.querySelector( '#submit' );
		this.baseline = serializeSettingsForm( form );
		this.allowNavigation = false;
		this.pendingNavigationUrl = null;

		this.bindEvents();
		this.bindNavigationGuard();
		this.patchSubmitClick();
		this.syncSubmitState();
		this.restoreScrollAfterSave();
		this.completeNavigationAfterSave();
	}

	wasSettingsJustSaved() {
		const settingsUpdated = new URLSearchParams( window.location.search ).get( 'settings-updated' );

		return 'true' === settingsUpdated || '1' === settingsUpdated;
	}

	hasSettingsSaveNotice() {
		return !! document.getElementById( 'setting-error-settings_updated' );
	}

	wasSettingsSavedForRedirect() {
		return this.wasSettingsJustSaved() || this.hasSettingsSaveNotice();
	}

	clearNavigationAfterSaveStorage() {
		sessionStorage.removeItem( NAV_AFTER_SAVE_STORAGE_KEY );
		sessionStorage.removeItem( NAV_AFTER_SAVE_INTENT_KEY );
	}

	completeNavigationAfterSave() {
		const destination = sessionStorage.getItem( NAV_AFTER_SAVE_STORAGE_KEY );
		const hasNavIntent = '1' === sessionStorage.getItem( NAV_AFTER_SAVE_INTENT_KEY );
		const saveSucceeded = this.wasSettingsSavedForRedirect() || ! this.isDirty();

		if ( ! destination || ! hasNavIntent || ! saveSucceeded ) {
			return;
		}

		if ( ! isSafeAdminNavigationDestination( destination ) ) {
			this.clearNavigationAfterSaveStorage();
			return;
		}

		this.clearNavigationAfterSaveStorage();
		this.allowNavigation = true;
		window.location.assign( destination );
	}

	bindEvents() {
		this.onFormInput = () => this.syncSubmitState();

		this.form.addEventListener( 'input', this.onFormInput );
		this.form.addEventListener( 'change', this.onFormInput );

		this.onFormSubmit = ( event ) => {
			this.syncSubmitState();

			if ( this.submitButton?.disabled ) {
				event.preventDefault();
				event.stopImmediatePropagation();
				return;
			}

			this.allowNavigation = true;
			sessionStorage.setItem( SCROLL_Y_AFTER_SAVE_STORAGE_KEY, String( window.scrollY ) );
		};

		this.form.addEventListener( 'submit', this.onFormSubmit, true );

		this.onBeforeUnload = ( event ) => {
			if ( this.allowNavigation || ! this.isDirty() ) {
				return;
			}

			event.preventDefault();
			event.returnValue = '';
		};

		window.addEventListener( 'beforeunload', this.onBeforeUnload );
	}

	isDirty() {
		return this.form.classList.contains( 'elementor-settings-form-is-dirty' );
	}

	bindNavigationGuard() {
		this.onDocumentClick = ( event ) => {
			if ( this.allowNavigation || ! this.isDirty() ) {
				return;
			}

			const link = event.target.closest( 'a[href]' );

			if ( ! link || link.isContentEditable ) {
				return;
			}

			if ( '_blank' === link.target || link.hasAttribute( 'download' ) ) {
				return;
			}

			const href = link.getAttribute( 'href' );

			if ( ! href || href.startsWith( '#' ) ) {
				return;
			}

			const destination = resolveAdminNavigationUrl( href );

			if ( ! destination || ! isNavigationLeavingCurrentScreen( window.location.href, destination ) ) {
				return;
			}

			if ( ! this.canShowLeavePrompt() ) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			this.pendingNavigationUrl = destination;
			this.showLeaveDialog();
		};

		document.addEventListener( 'click', this.onDocumentClick, true );
	}

	canShowLeavePrompt() {
		if ( elementorCommon?.dialogsManager ) {
			return true;
		}

		return 'function' === typeof window.confirm;
	}

	getLeaveDialogMessage() {
		const screenKey = this.form.dataset.navScreen || 'settings';

		return SCREEN_NAV_BODIES[ screenKey ] || SCREEN_NAV_BODIES.settings;
	}

	showLeaveDialog() {
		const destination = this.pendingNavigationUrl;

		if ( ! destination ) {
			return;
		}

		if ( elementorCommon?.dialogsManager ) {
			this.showElementorLeaveDialog( destination );
			return;
		}

		this.showNativeLeaveDialog( destination );
	}

	showElementorLeaveDialog( destination ) {
		elementorCommon.dialogsManager.createWidget( 'confirm', {
			headerMessage: __( 'You have unsaved changes', 'elementor' ),
			message: this.getLeaveDialogMessage(),
			closeButton: true,
			closeButtonOptions: {
				iconClass: 'eicon-close',
				attributes: {
					'aria-label': __( 'Close', 'elementor' ),
					class: 'dialog-close-button',
					href: '#',
					role: 'button',
					tabindex: 0,
				},
			},
			strings: {
				confirm: __( 'Save changes', 'elementor' ),
				cancel: __( 'Discard', 'elementor' ),
			},
			defaultOption: 'confirm',
			onConfirm: () => {
				this.persistNavigationAndSubmit( destination );
			},
			onCancel: () => {
				this.allowNavigation = true;
				window.location.assign( destination );
			},
			onHide: () => {
				this.pendingNavigationUrl = null;
			},
		} ).show();
	}

	showNativeLeaveDialog( destination ) {
		/* eslint-disable no-alert -- Fallback when dialogsManager is unavailable. */
		const saveChanges = window.confirm(
			`${ __( 'You have unsaved changes', 'elementor' ) }\n\n${ this.getLeaveDialogMessage() }\n\n${ __( 'Save your changes before leaving?', 'elementor' ) }`,
		);
		/* eslint-enable no-alert */

		if ( saveChanges ) {
			this.persistNavigationAndSubmit( destination );
			return;
		}

		/* eslint-disable-next-line no-alert */
		const discardChanges = window.confirm(
			__( 'Discard unsaved changes and leave this page?', 'elementor' ),
		);

		this.pendingNavigationUrl = null;

		if ( discardChanges ) {
			this.allowNavigation = true;
			window.location.assign( destination );
		}
	}

	persistNavigationAndSubmit( destination ) {
		sessionStorage.setItem( NAV_AFTER_SAVE_STORAGE_KEY, destination );
		sessionStorage.setItem( NAV_AFTER_SAVE_INTENT_KEY, '1' );
		this.allowNavigation = true;

		if ( 'function' === typeof this.form.requestSubmit ) {
			this.form.requestSubmit( this.submitButton );
		} else {
			this.submitButton?.click();
		}
	}

	patchSubmitClick() {
		if ( ! this.submitButton ) {
			return;
		}

		const nativeClick = this.submitButton.click.bind( this.submitButton );

		this.submitButton.click = () => {
			this.syncSubmitState();

			if ( ! this.submitButton.disabled ) {
				this.allowNavigation = true;
				nativeClick();
			}
		};
	}

	syncSubmitState() {
		if ( ! this.submitButton ) {
			return;
		}

		const hasChanges = serializeSettingsForm( this.form ) !== this.baseline;

		this.submitButton.disabled = ! hasChanges;
		this.submitButton.setAttribute( 'aria-disabled', hasChanges ? 'false' : 'true' );
		this.form.classList.toggle( 'elementor-settings-form-is-dirty', hasChanges );

		if ( ! hasChanges && this.wasSettingsJustSaved() ) {
			this.baseline = serializeSettingsForm( this.form );
		}
	}

	resetBaseline() {
		this.baseline = serializeSettingsForm( this.form );
		this.syncSubmitState();
	}

	restoreScrollAfterSave() {
		if ( ! this.wasSettingsJustSaved() ) {
			return;
		}

		const storedScrollY = sessionStorage.getItem( SCROLL_Y_AFTER_SAVE_STORAGE_KEY );

		if ( null === storedScrollY ) {
			return;
		}

		sessionStorage.removeItem( SCROLL_Y_AFTER_SAVE_STORAGE_KEY );

		const scrollY = Number.parseInt( storedScrollY, 10 );

		if ( Number.isNaN( scrollY ) ) {
			return;
		}

		window.requestAnimationFrame( () => {
			window.scrollTo( 0, scrollY );
		} );
	}
}
