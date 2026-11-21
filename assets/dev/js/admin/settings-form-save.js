const SETTINGS_FORM_FIELD_SELECTOR = 'input, select, textarea';
const AUTO_SAVE_DELAY_MS = 1500;
const CONFIRM_DIALOG_SELECTOR = '.dialog-type-confirm.dialog-widget';
const AUTOSAVE_TOAST_CLASSES = 'elementor-admin-settings-toast';

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

export default class SettingsFormSave {
	constructor( form ) {
		this.form = form;
		this.submitButton = form.querySelector( '#submit' );
		this.configElement = form.querySelector( '.elementor-settings-autosave-config' );
		this.baseline = serializeSettingsForm( form );
		this.allowNavigation = false;
		this.autosaveDebounceTimer = null;
		this.autosaveInFlight = false;
		this.autosavePaused = false;
		this.lastChangedFieldLabel = '';

		this.bindEvents();
		this.bindAutosave();
		this.bindNavigationGuard();
		this.patchSubmitClick();
		this.syncDirtyState();

		if ( this.wasSettingsJustSaved() ) {
			this.showSuccessToast();
		}
	}

	wasSettingsJustSaved() {
		return 'true' === new URLSearchParams( window.location.search ).get( 'settings-updated' );
	}

	bindEvents() {
		this.onFormInput = ( event ) => {
			if ( event?.target instanceof HTMLElement ) {
				this.lastChangedFieldLabel = this.resolveFieldLabel( event.target );
			}

			this.syncDirtyState();
		};

		this.form.addEventListener( 'input', this.onFormInput );
		this.form.addEventListener( 'change', this.onFormInput );
	}

	bindAutosave() {
		this.scheduleAutosave = () => {
			if ( this.autosavePaused ) {
				return;
			}

			clearTimeout( this.autosaveDebounceTimer );
			this.autosaveDebounceTimer = setTimeout( () => {
				this.maybeAutosave();
			}, AUTO_SAVE_DELAY_MS );
		};

		this.form.addEventListener( 'input', this.scheduleAutosave );
		this.form.addEventListener( 'change', this.scheduleAutosave );
	}

	isConfirmDialogVisible() {
		return Boolean( document.querySelector( CONFIRM_DIALOG_SELECTOR ) );
	}

	async maybeAutosave() {
		if ( this.autosavePaused || this.autosaveInFlight || this.isConfirmDialogVisible() ) {
			if ( this.form.classList.contains( 'elementor-settings-form-is-dirty' ) ) {
				this.scheduleAutosave();
			}

			return;
		}

		if ( ! this.form.classList.contains( 'elementor-settings-form-is-dirty' ) ) {
			return;
		}

		await this.runAutosave();
	}

	async persistForm() {
		await this.runAutosave();
	}

	async runAutosave() {
		if ( ! window.ajaxurl ) {
			return;
		}

		this.autosaveInFlight = true;

		const formData = new FormData( this.form );
		formData.append( 'action', 'elementor_admin_settings_autosave' );

		try {
			const response = await fetch( window.ajaxurl, {
				method: 'POST',
				body: formData,
				credentials: 'same-origin',
			} );
			const payload = await response.json();

			if ( ! response.ok || ! payload?.success ) {
				throw new Error( 'Autosave failed' );
			}

			this.baseline = serializeSettingsForm( this.form );
			this.syncDirtyState();
			this.showSuccessToast();
		} catch ( error ) {
			this.showErrorToast();
		} finally {
			this.autosaveInFlight = false;
		}
	}

	resolveFieldLabel( field ) {
		const row = field.closest( 'tr' );

		if ( ! row ) {
			return '';
		}

		const labelNode = row.querySelector( 'th label' );

		return labelNode?.textContent?.trim() || '';
	}

	buildSuccessToastMessage() {
		if ( ! this.configElement ) {
			return '';
		}

		const fallback = this.configElement.getAttribute( 'data-toast-saved' ) || '';
		const withLabelTemplate = this.configElement.getAttribute( 'data-toast-saved-with-label' ) || '';

		if ( this.lastChangedFieldLabel && withLabelTemplate ) {
			return withLabelTemplate.replace( '%s', this.lastChangedFieldLabel );
		}

		return fallback;
	}

	showSuccessToast() {
		const message = this.buildSuccessToastMessage();

		if ( ! message ) {
			return;
		}

		this.showToast( message, 'success' );
	}

	showErrorToast() {
		const message = this.configElement?.getAttribute( 'data-toast-error' ) || '';

		if ( ! message ) {
			return;
		}

		this.showToast( message, 'error' );
	}

	showToast( message, type ) {
		if ( ! elementorCommon?.notifications?.showToast ) {
			return;
		}

		const classSuffix = 'error' === type ? ' elementor-admin-settings-toast--error' : ' elementor-admin-settings-toast--success';

		elementorCommon.notifications.showToast( {
			message,
			classes: AUTOSAVE_TOAST_CLASSES + classSuffix,
			position: {
				my: 'center bottom',
				at: 'center bottom-32',
				of: document.body,
				autoRefresh: true,
			},
		} );
	}

	bindNavigationGuard() {
		this.onDocumentClick = ( event ) => {
			if ( this.allowNavigation || ! this.form.classList.contains( 'elementor-settings-form-is-dirty' ) ) {
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

			const destination = new URL( href, window.location.origin ).href;

			if ( ! isNavigationLeavingCurrentScreen( window.location.href, destination ) ) {
				return;
			}

			event.preventDefault();
			event.stopPropagation();

			this.showLeaveDialog( destination );
		};

		document.addEventListener( 'click', this.onDocumentClick, true );
	}

	showLeaveDialog( destination ) {
		if ( ! this.configElement || ! elementorCommon?.dialogsManager ) {
			this.allowNavigation = true;
			window.location.assign( destination );

			return;
		}

		elementorCommon.dialogsManager.createWidget( 'confirm', {
			headerMessage: this.configElement.getAttribute( 'data-nav-title' ),
			message: this.configElement.getAttribute( 'data-nav-message' ),
			strings: {
				confirm: this.configElement.getAttribute( 'data-nav-confirm' ),
				cancel: this.configElement.getAttribute( 'data-nav-cancel' ),
			},
			defaultOption: 'cancel',
			onConfirm: () => {
				this.allowNavigation = true;
				window.location.assign( destination );
			},
		} ).show();
	}

	patchSubmitClick() {
		if ( ! this.submitButton ) {
			return;
		}

		this.submitButton.click = () => {
			this.persistForm();
		};
	}

	syncDirtyState() {
		const hasChanges = serializeSettingsForm( this.form ) !== this.baseline;

		this.form.classList.toggle( 'elementor-settings-form-is-dirty', hasChanges );
	}
}