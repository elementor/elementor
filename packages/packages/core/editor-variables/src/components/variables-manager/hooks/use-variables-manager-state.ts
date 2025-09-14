import { useCallback, useState } from 'react';
import { __ } from '@wordpress/i18n';

import { generateTempId } from '../../../batch-operations';
import { getVariables } from '../../../hooks/use-prop-variables';
import { service } from '../../../service';
import { type TVariablesList } from '../../../storage';
import { ERROR_MESSAGES } from '../../../utils/validations';

export const useVariablesManagerState = () => {
	const [ variables, setVariables ] = useState( () => getVariables( false ) );
	const [ deletedVariables, setDeletedVariables ] = useState< string[] >( [] );
	const [ ids, setIds ] = useState< string[] >( () => Object.keys( getVariables( false ) ) );
	const [ isDirty, setIsDirty ] = useState( false );
	const [ hasValidationErrors, setHasValidationErrors ] = useState( false );

	const handleOnChange = useCallback( ( newVariables: TVariablesList ) => {
		setVariables( newVariables );
		setIsDirty( true );
	}, [] );

	const createVariable = useCallback( ( type: string, defaultName: string, defaultValue: string ) => {
		const newId = generateTempId();
		const newVariable = {
			id: newId,
			label: defaultName.trim(),
			value: defaultValue.trim(),
			type,
		};

		setVariables( ( prev ) => ( { ...prev, [ newId ]: newVariable } ) );
		setIds( ( prev ) => [ ...prev, newId ] );
		setIsDirty( true );

		return newId;
	}, [] );

	const handleDeleteVariable = useCallback( ( itemId: string ) => {
		setDeletedVariables( ( prev ) => [ ...prev, itemId ] );
		setVariables( ( prev ) => ( { ...prev, [ itemId ]: { ...prev[ itemId ], deleted: true } } ) );
		setIsDirty( true );
	}, [] );

	const handleSave = useCallback( async (): Promise< { success: boolean; error?: string } > => {
		try {
			const originalVariables = getVariables( false );
			const result = await service.batchSave( originalVariables, variables );

			if ( result.success ) {
				await service.load();
				const updatedVariables = service.variables();

				setVariables( updatedVariables );
				setIds( Object.keys( updatedVariables ) );
				setDeletedVariables( [] );
				setIsDirty( false );
				return { success: true };
			}
			throw new Error( __( 'Failed to save variables. Please try again.', 'elementor' ) );
		} catch ( error ) {
			const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.UNEXPECTED_ERROR;
			return { success: false, error: errorMessage };
		}
	}, [ variables ] );

	return {
		variables,
		deletedVariables,
		ids,
		isDirty,
		hasValidationErrors,
		setIds,
		handleOnChange,
		createVariable,
		handleDeleteVariable,
		handleSave,
		setHasValidationErrors,
	};
};
