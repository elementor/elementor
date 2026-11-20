const SETTINGS_FORM_FIELD_SELECTOR = 'input, select, textarea';
const AUTO_SAVE_DELAY_MS = 1500;
const SAVED_STATUS_DURATION_MS = 5000;
const SETTINGS_SAVED_QUERY_ARG = 'settings-updated';
const CONFIRM_DIALOG_SELECTOR = '.dialog-type-confirm.dialog-widget';

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
		this.statusElement = form.querySelector( '.elementor-settings-form-actions__status' );
		this.baseline = serializeSettingsForm( form );
		this.savedStatusDismissed = ! this.wasSettingsJustSaved();
		this.savedStatusTimer = null;
		this.allowNavigation = false;
		this.autosaveDebounceTimer = null;
		this.autosaveInFlight = false;
		this.autosavePaused = false;

		this.bindEvents();
		this.bindAutosave();
		this.bindNavigationGuard();
		this.patchSubmitClick();
		this.syncSubmitState();

		if ( ! this.savedStatusDismissed ) {
			this.scheduleSavedStatusDismissal();
		}
	}

	wasSettingsJustSaved() {
		return 'true' === new URLSearchParams( window.location.search ).get( SETTINGS_SAVED_QUERY_ARG );
	}

	scheduleSavedStatusDismissal() {
		clearTimeout( this.savedStatusTimer );

		this.savedStatusTimer = setTimeout( () => {
			this.savedStatusDismissed = true;
			this.syncSubmitState();
		}, SAVED_STATUS_DURATION_MS );
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
			}
		};

		this.form.addEventListener( 'submit', this.onFormSubmit, true );
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

	async runAutosave() {
		if ( ! window.ajaxurl ) {
			return;
		}

		this.autosaveInFlight = true;
		this.updateStatusMessage( 'saving' );

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
			this.savedStatusDismissed = false;
			this.scheduleSavedStatusDismissal();
			this.syncSubmitState();
		} catch ( error ) {
			this.updateStatusMessage( 'error' );
		} finally {
			this.autosaveInFlight = false;
		}
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
		if ( ! this.statusElement || ! elementorCommon?.dialogsManager ) {
			this.allowNavigation = true;
			window.location.assign( destination );

			return;
		}

		elementorCommon.dialogsManager.createWidget( 'confirm', {
			headerMessage: this.statusElement.getAttribute( 'data-nav-title' ),
			message: this.statusElement.getAttribute( 'data-nav-message' ),
			strings: {
				confirm: this.statusElement.getAttribute( 'data-nav-confirm' ),
				cancel: this.statusElement.getAttribute( 'data-nav-cancel' ),
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

		const nativeClick = this.submitButton.click.bind( this.submitButton );

		this.submitButton.click = () => {
			this.syncSubmitState();

			if ( ! this.submitButton.disabled ) {
				nativeClick();
			}
		};
	}

	updateStatusMessage( state ) {
		if ( ! this.statusElement ) {
			return;
		}

		const labelKey = 'data-label-' + state;
		const message = this.statusElement.getAttribute( labelKey ) || '';

		this.statusElement.dataset.state = state;
		this.statusElement.textContent = message;
	}

	syncSubmitState() {
		if ( ! this.submitButton || this.autosaveInFlight ) {
			return;
		}

		const hasChanges = serializeSettingsForm( this.form ) !== this.baseline;

		this.submitButton.disabled = ! hasChanges;
		this.submitButton.setAttribute( 'aria-disabled', hasChanges ? 'false' : 'true' );
		this.form.classList.toggle( 'elementor-settings-form-is-dirty', hasChanges );

		if ( hasChanges ) {
			this.savedStatusDismissed = true;
			clearTimeout( this.savedStatusTimer );
			this.updateStatusMessage( 'dirty' );

			return;
		}

		if ( ! this.savedStatusDismissed ) {
			this.updateStatusMessage( 'saved' );

			return;
		}

		this.updateStatusMessage( 'idle' );
	}
}