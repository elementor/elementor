import { useCallback, useState } from 'react';

import { generateTempId } from '../../../batch-operations';
import { getVariables } from '../../../hooks/use-prop-variables';
import { service } from '../../../service';
import { type TVariablesList } from '../../../storage';
import { filterBySearch } from '../../../utils/filter-by-search';
import { generateDuplicateLabel } from '../../../utils/validations';
import { applySelectionFilters, variablesToList } from '../../../utils/variables-to-list';
import { getVariableTypes } from '../../../variables-registry/variable-type-registry';

export const useVariablesManagerState = () => {
	const [ variables, setVariables ] = useState( () => getVariables( false ) );
	const [ deletedVariables, setDeletedVariables ] = useState< string[] >( [] );
	const [ isSaveDisabled, setIsSaveDisabled ] = useState( false );
	const [ isDirty, setIsDirty ] = useState( false );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ searchValue, setSearchValue ] = useState( '' );

	const handleOnChange = useCallback(
		( newVariables: TVariablesList ) => {
			setVariables( { ...variables, ...newVariables } );
			setIsDirty( true );
		},
		[ variables ]
	);

	const createVariable = useCallback( ( type: string, defaultName: string, defaultValue: string ) => {
		const newId = generateTempId();
		const newVariable = {
			id: newId,
			label: defaultName.trim(),
			value: defaultValue.trim(),
			type,
		};

		setVariables( ( prev ) => ( { ...prev, [ newId ]: newVariable } ) );
		setIsDirty( true );

		return newId;
	}, [] );

	const duplicateVariable = useCallback(
		( sourceId: string ): string | null => {
			const source = variables[ sourceId ];
			if ( ! source ) {
				return null;
			}

			const existingLabels = Object.values( variables )
				.filter( ( v ) => ! v.deleted )
				.map( ( v ) => v.label );

			const newId = generateTempId();
			const newLabel = generateDuplicateLabel( source.label, existingLabels );

			setVariables( ( prev ) => ( {
				...prev,
				[ newId ]: {
					label: newLabel,
					value: source.value,
					type: source.type,
				},
			} ) );
			setIsDirty( true );

			return newId;
		},
		[ variables ]
	);

	const handleDeleteVariable = useCallback( ( itemId: string ) => {
		setDeletedVariables( ( prev ) => [ ...prev, itemId ] );
		setVariables( ( prev ) => ( { ...prev, [ itemId ]: { ...prev[ itemId ], deleted: true } } ) );
		setIsDirty( true );
	}, [] );

	const handleStartSync = useCallback( ( itemId: string ) => {
		setVariables( ( prev ) => ( {
			...prev,
			[ itemId ]: { ...prev[ itemId ], sync_to_v3: true },
		} ) );
		setIsDirty( true );
	}, [] );

	const handleStopSync = useCallback( ( itemId: string ) => {
		setVariables( ( prev ) => ( {
			...prev,
			[ itemId ]: { ...prev[ itemId ], sync_to_v3: false },
		} ) );
		setIsDirty( true );
	}, [] );

	const handleSearch = ( searchTerm: string ) => {
		setSearchValue( searchTerm );
	};

	const handleSave = useCallback( async (): Promise< { success: boolean } > => {
		const originalVariables = getVariables( false );
		setIsSaving( true );
		const result = await service.batchSave( originalVariables, variables, deletedVariables );

		if ( result.success ) {
			await service.load();
			const updatedVariables = service.variables();

			setVariables( updatedVariables );
			setDeletedVariables( [] );
			setIsDirty( false );
		}

		return { success: result.success };
	}, [ variables, deletedVariables ] );

	const filteredVariables = useCallback( () => {
		const list = variablesToList( variables ).filter( ( v ) => ! v.deleted );
		const typeFiltered = applySelectionFilters( list, getVariableTypes() );
		const searchFiltered = filterBySearch( typeFiltered, searchValue );

		return Object.fromEntries( searchFiltered.map( ( { key, ...rest } ) => [ key, rest ] ) );
	}, [ variables, searchValue ] );

	return {
		variables: filteredVariables(),
		deletedVariables,
		isDirty,
		isSaveDisabled,
		handleOnChange,
		createVariable,
		duplicateVariable,
		handleDeleteVariable,
		handleStartSync,
		handleStopSync,
		handleSave,
		isSaving,
		handleSearch,
		searchValue,
		setIsSaving,
		setIsSaveDisabled,
	};
};
