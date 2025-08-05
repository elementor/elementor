import * as React from 'react';
import { setDocumentModifiedStatus } from '@elementor/editor-documents';
import { closeDialog } from '@elementor/editor-global-dialog';
import { validateStyleLabel } from '@elementor/editor-styles-repository';
import { __useDispatch as useDispatch } from '@elementor/store';
import { Button, TextField } from '@elementor/ui';

import { useCssClassById } from '../../hooks/use-css-class-by-id';
import { slice } from '../../store';

export const DuplicateLabelDialog = ( { id }: { id: string } ) => {
	const cssClass = useCssClassById( id );
	const [ label, setLabel ] = React.useState( cssClass.label );
	const [ error, setError ] = React.useState< string | null >( null );
	const dispatch = useDispatch();

	const handleLabelChange = ( event: React.ChangeEvent< HTMLInputElement > ) => {
		const newLabel = event.target.value;

		setLabel( newLabel );
		const validationError = validateStyleLabel( newLabel, 'rename' );

		setError( validationError.errorMessage );
	};

	const handleSave = () => {
		const validationError = validateStyleLabel( label, 'rename' );
		if ( ! validationError.isValid ) {
			setError( validationError.errorMessage );
			return;
		}
		dispatch(
			slice.actions.updateStyleAndResetDirty( {
				id,
				label,
			} )
		);

		// Mark document as modified to enable publish button
		setDocumentModifiedStatus( true );

		closeDialog();
	};

	return (
		<>
			<h1>Edit Class: { id }</h1>
			<div style={ { marginBottom: '16px' } }>
				<TextField
					label="Class Name"
					value={ label }
					onChange={ handleLabelChange }
					onKeyDown={ ( event: React.KeyboardEvent< HTMLInputElement > ) => {
						if ( event.key === 'Enter' ) {
							handleSave();
						}
						if ( event.key === 'Escape' ) {
							setLabel( cssClass.label );
							setError( null );
						}
					} }
					onBlur={ handleSave }
					placeholder="Enter class name"
					error={ !! error }
					helperText={ error }
					fullWidth
					size="small"
				/>
			</div>
			<div style={ { display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' } }>
				<Button
					variant="contained"
					color="primary"
					disabled={ !! error || ! label }
					onClick={ () => {
						closeDialog();
					} }
				>
					Rename
				</Button>
			</div>
		</>
	);
};
