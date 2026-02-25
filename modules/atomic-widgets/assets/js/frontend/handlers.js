import { registerBySelector } from '@elementor/frontend-handlers';
import { Alpine } from '@elementor/alpinejs';

const LINK_ACTIONS_EDITOR_WHITELIST = [ 'off_canvas', 'lightbox' ];
const WHITELIST_FILTER = 'frontend/handlers/atomic-widgets/link-actions-whitelist';
const ACTION_LINK_SELECTOR = '[data-action-link]';
const REGISTRATION_SELECTOR = `${ ACTION_LINK_SELECTOR }, :has(> ${ ACTION_LINK_SELECTOR })`;
const ATOMIC_FORM_SELECTOR = '[data-element_type="e-form"]';
const ATOMIC_FORM_FIELD_SELECTOR = 'input[data-interaction-id], textarea[data-interaction-id]';

registerBySelector( {
	id: 'atomic-link-action-handler',
	selector: REGISTRATION_SELECTOR,
	callback: ( { element } ) => handleLinkActions( element ),
} );

registerBySelector( {
	id: 'atomic-form-submit-handler',
	selector: ATOMIC_FORM_SELECTOR,
	callback: ( { element } ) => handleAtomicFormSubmit( element ),
} );

function handleLinkActions( element ) {
	const actionLinkElement = element.matches( ACTION_LINK_SELECTOR )
		? element
		: element.querySelector( ACTION_LINK_SELECTOR );
	const url = actionLinkElement?.dataset.actionLink;

	if ( ! url ) {
		return;
	}

	const handler = ( event ) => {
		if ( actionLinkElement && actionLinkElement !== element && ! actionLinkElement.contains( event.target ) ) {
			return;
		}

		if ( ! shouldFireLinkActionHandler( url ) ) {
			return;
		}

		if ( ! window.elementorFrontend?.utils?.urlActions ) {
			return;
		}

		event.preventDefault();
		elementorFrontend.utils.urlActions.runAction( url, event );
	};

	element.addEventListener( 'click', handler );

	return () => element.removeEventListener( 'click', handler );
}

function handleAtomicFormSubmit( element ) {
	const form = element;

	if ( ! form || ! Alpine?.data ) {
		return;
	}

	const alpineId = getFormAlpineId( form );

	Alpine.data( alpineId, () => ( {
		async submit( event ) {
			if ( isEditorContext() ) {
				return;
			}

			event.preventDefault();

			if ( form.dataset.atomicFormSubmitting ) {
				return;
			}

			form.dataset.atomicFormSubmitting = 'true';

			const submitButtons = form.querySelectorAll( 'button[type="submit"], input[type="submit"]' );

			submitButtons.forEach( ( button ) => {
				button.disabled = true;
			} );

			const payload = buildAtomicFormPayload( form );

			if ( payload ) {
				try {
					const response = await submitAtomicForm( payload );
					setFormState( element, response?.success ? 'success' : 'error' );
				} catch ( error ) {
					setFormState( element, 'error' );
				} finally {
					clearAtomicFormSubmittingState( form, submitButtons );
				}
			} else {
				setFormState( element, 'error' );
				clearAtomicFormSubmittingState( form, submitButtons );
			}
		},
	} ) );

	return () => {
		Alpine.destroyTree( form );
	};
}

function getFormAlpineId( form ) {
	return form.getAttribute( 'x-data' );
}

function clearAtomicFormSubmittingState( form, submitButtons ) {
	delete form.dataset.atomicFormSubmitting;

	submitButtons.forEach( ( button ) => {
		button.disabled = false;
	} );
}

function buildAtomicFormPayload( form ) {
	const postId = getPostId();
	const formId = form.dataset.id;
	const formName = form.dataset.formName || '';
	const formFields = getAtomicFormFields( form );

	if ( ! postId || ! formFields.length ) {
		return null;
	}

	return {
		postId,
		formId,
		formName,
		formFields,
	};
}

function getAtomicFormFields( form ) {
	const fields = [];
	const inputs = form.querySelectorAll( ATOMIC_FORM_FIELD_SELECTOR );

	inputs.forEach( ( input ) => {
		const id = input.dataset.interactionId;

		if ( ! id ) {
			return;
		}

		const label = getAtomicFormFieldLabel( input, form );
		const type = getAtomicFormFieldType( input );
		const value = input.value;

		fields.push( {
			id,
			type,
			label,
			value,
		} );
	} );

	return fields;
}

function getAtomicFormFieldLabel( field, form ) {
	const ariaLabel = field.getAttribute( 'aria-label' );
	if ( ariaLabel ) {
		return ariaLabel;
	}

	const placeholder = field.getAttribute( 'placeholder' );
	if ( placeholder ) {
		return placeholder;
	}

	const fieldId = field.getAttribute( 'id' );
	if ( fieldId ) {
		const labelElement = form.querySelector( `label[for="${ fieldId }"]` );
		const labelText = labelElement?.textContent?.trim();
		if ( labelText ) {
			return labelText;
		}
	}

	const parentLabelText = field.closest( 'label' )?.textContent?.trim();
	return parentLabelText || '';
}

function getAtomicFormFieldType( field ) {
	if ( field.matches( 'textarea' ) ) {
		return 'textarea';
	}

	return field.getAttribute( 'type' ) || 'text';
}

async function submitAtomicForm( payload ) {
	const ajaxUrl = elementorFrontendConfig?.urls?.ajaxurl;

	if ( ! ajaxUrl ) {
		return { success: false };
	}

	const formData = new FormData();
	formData.append( 'action', 'elementor_pro_atomic_forms_send_form' );
	formData.append( '_nonce', elementorFrontendConfig?.nonces?.atomicFormsSendForm );
	formData.append( 'post_id', payload.postId );
	formData.append( 'form_id', payload.formId );
	formData.append( 'form_name', payload.formName );
	payload.formFields.forEach( ( field, index ) => {
		formData.append( `form_fields[${ index }][id]`, field.id );
		formData.append( `form_fields[${ index }][type]`, field.type );
		formData.append( `form_fields[${ index }][label]`, field.label );

		if ( Array.isArray( field.value ) ) {
			field.value.forEach( ( value, valueIndex ) => {
				formData.append( `form_fields[${ index }][value][${ valueIndex }]`, value );
			} );
		} else {
			formData.append( `form_fields[${ index }][value]`, field.value );
		}
	} );

	const response = await fetch( ajaxUrl, {
		method: 'POST',
		body: formData,
	} );

	if ( ! response.ok ) {
		return { success: false };
	}

	return response.json();
}

function setFormState( element, state ) {
	if ( ! state ) {
		return;
	}

	element.setAttribute( 'data-form-state', state );

	const id = extractId( element );
	const container = id ? window.elementor?.getContainer?.( id ) : null;
	container?.view?._updateStatusVisibility?.();
}

function extractId( element ) {
	return element?.dataset?.id || null;
}

function getPostId() {
	return elementorFrontend?.config?.post?.id || null;
}

function shouldFireLinkActionHandler( url ) {
	if ( ! isEditorContext() ) {
		return true;
	}

	url = decodeURI( url );
	url = decodeURIComponent( url );

	const actionMatch = url.match( /action=([^&]+)/ );
	const action = actionMatch?.[ 1 ] ?? null;

	if ( ! action ) {
		return false;
	}

	const whitelist = elementorFrontend?.hooks?.applyFilters( WHITELIST_FILTER, LINK_ACTIONS_EDITOR_WHITELIST ) ??
		LINK_ACTIONS_EDITOR_WHITELIST;

	return !! whitelist.find( ( allowedAction ) => action.includes( allowedAction ) );
}

function isEditorContext() {
	return !! window.elementor || !! window.parent?.elementor;
}
