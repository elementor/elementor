import { registerBySelector } from '@elementor/frontend-handlers';
import { Alpine } from '@elementor/alpinejs';

const LINK_ACTIONS_EDITOR_WHITELIST = [ 'off_canvas', 'lightbox' ];
const WHITELIST_FILTER = 'frontend/handlers/atomic-widgets/link-actions-whitelist';
const ACTION_LINK_SELECTOR = '[data-action-link]';
const REGISTRATION_SELECTOR = `${ ACTION_LINK_SELECTOR }, :has(${ ACTION_LINK_SELECTOR })`;
const ATOMIC_FORM_SELECTOR = '[data-element_type="e-form"]';
const ATOMIC_FORM_FIELD_SELECTOR = 'input[data-interaction-id], textarea[data-interaction-id]';
const ELEMENTOR_DOCUMENT_SELECTOR = '[data-elementor-id]';

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

function handleLinkActions( registrationElement ) {
	if ( ! registrationElement ) {
		return;
	}

	const actionLinkElement = registrationElement.matches( ACTION_LINK_SELECTOR )
		? registrationElement
		: registrationElement.querySelector( ACTION_LINK_SELECTOR );

	if ( ! actionLinkElement ) {
		return;
	}

	const url =
		actionLinkElement.dataset.actionLink ||
		actionLinkElement.getAttribute( 'href' ) ||
		'';

	if ( ! url ) {
		return;
	}

	const onClick = ( event ) => {
		if ( ! shouldFireLinkActionHandler( url ) ) {
			return;
		}

		if ( ! window.elementorFrontend?.utils?.urlActions ) {
			return;
		}

		event.preventDefault();
		elementorFrontend.utils.urlActions.runAction( url, event );
	};

	actionLinkElement.addEventListener( 'click', onClick );

	return () => {
		actionLinkElement.removeEventListener( 'click', onClick );
	};
}

function registerAtomicFormAlpineData( form ) {
	if ( ! form || ! Alpine?.data ) {
		return;
	}

	const alpineId = getAlpineId( form );

	if ( ! alpineId ) {
		return;
	}

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
					const state = response?.success ? 'success' : 'error';

					setFormState( form, state );

					if ( response?.success ) {
						form.reset();

						form.addEventListener( 'input', () => {
							setFormState( form, 'default' );
						}, { once: true } );
					}
				} catch ( error ) {
					setFormState( form, 'error' );
				} finally {
					clearAtomicFormSubmittingState( form, submitButtons );
				}
			} else {
				setFormState( form, 'error' );
				clearAtomicFormSubmittingState( form, submitButtons );
			}
		},
	} ) );
}

function handleAtomicFormSubmit( form ) {
	registerAtomicFormAlpineData( form );

	return refreshDom( form );
}

function getAlpineId( element ) {
	return element.getAttribute( 'x-data' );
}

function clearAtomicFormSubmittingState( form, submitButtons ) {
	delete form.dataset.atomicFormSubmitting;

	submitButtons.forEach( ( button ) => {
		button.disabled = false;
	} );
}

function buildAtomicFormPayload( form ) {
	const postId = getPostId( form );
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
		const value = getAtomicFormFieldValue( input, type );

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

	const fieldId = field.getAttribute( 'id' );
	if ( fieldId ) {
		const labelElement = form.querySelector( `label[for="${ fieldId }"]` );
		const labelText = labelElement?.textContent?.trim();
		if ( labelText ) {
			return labelText;
		}
	}

	const parentLabelText = field.closest( 'label' )?.textContent?.trim();
	if ( parentLabelText ) {
		return parentLabelText;
	}

	const placeholder = field.getAttribute( 'placeholder' );

	return placeholder || '';
}

function getAtomicFormFieldValue( input, type ) {
	if ( 'checkbox' !== type ) {
		return input.value;
	}

	return input.checked ? input.value || 'on' : '';
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
	formData.append( 'referer_title', document?.title ?? '' );
	formData.append( 'referrer', window?.location?.href ?? '' );
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

	element.classList.remove( 'form-state-default', 'form-state-success', 'form-state-error' );
	element.classList.add( `form-state-${ state }` );
}

function getPostId( form ) {
	const innerDocumentId = form?.closest?.( ELEMENTOR_DOCUMENT_SELECTOR )?.dataset?.elementorId;
	const ownerDocument = elementorFrontend?.config?.post?.id;

	return innerDocumentId || ownerDocument || null;
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

function refreshDom( element ) {
	if ( ! Alpine?.nextTick || ! Alpine?.destroyTree || ! Alpine?.initTree ) {
		return;
	}

	Alpine.nextTick( () => {
		Alpine.destroyTree( element );
		Alpine.initTree( element );
	} );

	return () => Alpine.destroyTree( element );
}
