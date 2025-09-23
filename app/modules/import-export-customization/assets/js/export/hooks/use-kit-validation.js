import { useState, useEffect } from 'react';
import { useExportContext } from '../context/export-context';

export function useKitValidation() {
	const { data, dispatch } = useExportContext();
	const [ nameError, setNameError ] = useState( null );

	const DESCRIPTION_MAX_LENGTH = 300;

	const validateKitName = ( value ) => {
		if ( ! value || 0 === value.trim().length ) {
			return __( 'Must add a website template name', 'elementor' );
		}

		const problematicCharsRegex = /[^\w\s\-_.()]/g;

		if ( problematicCharsRegex.test( value ) ) {
			return __( 'Use characters only', 'elementor' );
		}

		return null;
	};

	const validateDescription = ( value ) => {
		if ( value.length > DESCRIPTION_MAX_LENGTH ) {
			return __( 'Description exceeds 300 characters', 'elementor' );
		}

		return null;
	};

	const templateName = data.kitInfo.title || '';
	const description = data.kitInfo.description || '';

	const hasDescriptionError = description.length > DESCRIPTION_MAX_LENGTH;
	const descriptionCounterColor = hasDescriptionError ? 'error' : 'text.secondary';

	useEffect( () => {
		const nameValidationError = validateKitName( templateName );
		const descriptionValidationError = validateDescription( description );

		setNameError( nameValidationError );

		dispatch( {
			type: 'SET_VALIDATION_ERRORS',
			payload: {
				name: nameValidationError,
				description: descriptionValidationError,
			},
		} );
	}, [ templateName, description, dispatch ] );

	const handleNameChange = ( e ) => {
		const value = e.target.value || '';
		dispatch( { type: 'SET_KIT_TITLE', payload: value } );
	};

	const handleDescriptionChange = ( e ) => {
		const value = e.target.value || '';
		if ( value.length <= DESCRIPTION_MAX_LENGTH ) {
			dispatch( { type: 'SET_KIT_DESCRIPTION', payload: value } );
		}
	};

	return {
		templateName,
		description,
		nameError,
		hasDescriptionError,
		descriptionCounterColor,
		handleNameChange,
		handleDescriptionChange,
		DESCRIPTION_MAX_LENGTH,
		validateKitName,
		validateDescription,
	};
}
