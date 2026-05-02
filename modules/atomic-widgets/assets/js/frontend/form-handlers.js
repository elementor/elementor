import { registerBySelector } from '@elementor/frontend-handlers';
import { Alpine } from '@elementor/alpinejs';
import { getAlpineId, ATOMIC_FORM_SELECTOR, ATOMIC_FORM_FIELD_SELECTOR, getPostId, isEditorContext } from './utils';
import _ from 'lodash';

registerBySelector( {
	id: 'atomic-form-submit-handler',
	selector: ATOMIC_FORM_SELECTOR,
	callback: ( { element } ) => handleAtomicFormSubmit( element ),
} );

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
	const allInputs = [ ...form.querySelectorAll( ATOMIC_FORM_FIELD_SELECTOR ) ].filter( ( input ) => input.dataset.interactionId );
	const inputGroups = _.groupBy( allInputs, ( input ) => input.getAttribute( 'name' ) );

	Object.entries( inputGroups ).forEach( ( [ name, inputs ] ) => {
		if ( name && inputs.every( ( input ) => 'radio' === input.getAttribute( 'type' ) ) ) {
			fields.push( getGroupedFields( name, inputs, 'radio', form ) );
			return;
		}

		if ( name && inputs.length > 1 && inputs.every( ( input ) => 'checkbox' === input.getAttribute( 'type' ) ) ) {
			fields.push( getGroupedFields( name, inputs, 'checkbox', form ) );
			return;
		}

		inputs.forEach( ( input ) => {
			const id = input.dataset.interactionId;
			const label = getAtomicFormFieldLabel( input, form );
			const type = getAtomicFormFieldType( input );
			const value = getAtomicFormFieldValue( input, type );
			const options = getAtomicFieldOptions( input, type, form );

			fields.push( {
				id,
				type,
				label,
				value,
				name,
				options,
			} );
		} );
	} );

	return fields;
}

function getGroupedFields( name, inputs, type, form ) {
	const checkedInputs = inputs.filter( ( input ) => input.checked );
	const value = getAtomicFormFieldValue( checkedInputs, type );
	const options = getAtomicFieldOptions( inputs, type, form );
	return {
		id: name,
		type,
		label: name,
		value,
		name,
		options,
	};
}

function getAtomicFieldOptions( fieldOrGroup, type, form ) {
	if ( 'select' === type ) {
		const optionElements = fieldOrGroup.querySelectorAll( 'option' );
		return Array.from( optionElements ).map( ( option ) => {
			return {
				value: option.value,
				label: option.textContent,
			};
		} );
	}

	if ( Array.isArray( fieldOrGroup ) && [ 'radio', 'checkbox' ].includes( type ) ) {
		return fieldOrGroup.map( ( input ) => {
			return {
				value: input.value,
				label: getAtomicFormFieldLabel( input, form ),
			};
		} );
	}

	return null;
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

	return placeholder || fieldId || '';
}

function getAtomicFormFieldValue( inputs, type ) {
	if ( Array.isArray( inputs ) ) {
		return inputs.map( ( input ) => input.value ).join( ', ' );
	}

	if ( 'checkbox' === type ) {
		return inputs.checked ? inputs.value || 'on' : '';
	}

	return inputs.value;
}

function getAtomicFormFieldType( field ) {
	const tagName = field.tagName.toLowerCase();
	if ( 'input' === tagName ) {
		return field.getAttribute( 'type' ) || 'text';
	}

	return tagName;
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
		formData.append( `form_fields[${ index }][name]`, field.name );
		formData.append( `form_fields[${ index }][options]`, JSON.stringify( field.options ) );

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
