const SETTINGS_FORM_FIELD_SELECTOR = 'input, select, textarea';

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

export default class SettingsFormSave {
	constructor( form ) {
		this.form = form;
		this.submitButton = form.querySelector( '#submit' );
		this.baseline = serializeSettingsForm( form );

		this.bindEvents();
		this.patchSubmitClick();
		this.syncSubmitState();
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

	syncSubmitState() {
		if ( ! this.submitButton ) {
			return;
		}

		const hasChanges = serializeSettingsForm( this.form ) !== this.baseline;

		this.submitButton.disabled = ! hasChanges;
		this.submitButton.setAttribute( 'aria-disabled', hasChanges ? 'false' : 'true' );
		this.form.classList.toggle( 'elementor-settings-form-is-dirty', hasChanges );
	}
}