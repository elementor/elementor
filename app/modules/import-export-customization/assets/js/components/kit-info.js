import React, { useState } from 'react';
import { Typography, Input, Card, CardContent } from '@elementor/ui';

import { useExportContext } from '../context/export-context';

export default function KitInfo() {
	const { data, dispatch } = useExportContext();
	const [ titleError, setTitleError ] = useState( null );

	const { templateName, description } = {
		templateName: data.kitInfo.title || '',
		description: data.kitInfo.description || '',
	};

	const validateKitName = ( value ) => {
		if ( ! value || 0 === value.trim().length ) {
			return __( 'Must add a name', 'elementor' );
		}

		return null;
	};

	const handleTitleChange = ( e ) => {
		const value = e.target.value;
		dispatch( { type: 'SET_KIT_TITLE', payload: value } );
		
		const validationError = validateKitName( value );
		setTitleError( validationError );
	};

	const handleTitleBlur = ( e ) => {
		const value = e.target.value;
		const validationError = validateKitName( value );
		setTitleError( validationError );
	};

	return (
		<Card sx={ { mb: 3, border: 1, borderRadius: 1, borderColor: 'action.focus' } } elevation={ 0 } square={ true }>
			<CardContent sx={ { p: 2.5 } }>
				<Typography variant="caption" component="label" color="text.secondary" sx={ { fontSize: '0.75rem', mb: 0.5, display: 'block' } }>
					{ __( 'Website templates name', 'elementor' ) }
				</Typography>
				<Input
					fullWidth
					required
					value={ templateName }
					onChange={ handleTitleChange }
					onBlur={ handleTitleBlur }
					placeholder={ __( 'Type name here...', 'elementor' ) }
					inputProps={ { maxLength: 75 } }
					sx={ { 
						mb: titleError ? 1 : 2,
						'& .MuiInputBase-root': {
							borderColor: titleError ? 'error.main' : undefined,
						},
					} }
					error={ !! titleError }
				/>
				
				{ titleError && (
					<Typography variant="caption" color="error" sx={ { fontSize: '0.75rem', mb: 1.5, display: 'block' } }>
						{ titleError }
					</Typography>
				) }

				<Typography variant="caption" component="label" color="text.secondary" sx={ { fontSize: '0.75rem', mb: 0.5, display: 'block' } }>
					{ __( 'Description (Optional)', 'elementor' ) }
				</Typography>
				<Input
					fullWidth
					multiline
					value={ description }
					onChange={ ( e ) => dispatch( { type: 'SET_KIT_DESCRIPTION', payload: e.target.value || '' } ) }
					placeholder={ __( 'Type description here...', 'elementor' ) }
				/>
			</CardContent>
		</Card>
	);
}
