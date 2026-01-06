import { useCallback, useState } from 'react';

import { generateTempId } from '../../../batch-operations';
import { getVariables } from '../../../hooks/use-prop-variables';
import { service } from '../../../service';
import { type TVariablesList } from '../../../storage';
import { filterBySearch } from '../../../utils/filter-by-search';
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

	const handleDeleteVariable = useCallback( ( itemId: string ) => {
		setDeletedVariables( ( prev ) => [ ...prev, itemId ] );
		setVariables( ( prev ) => ( { ...prev, [ itemId ]: { ...prev[ itemId ], deleted: true } } ) );
		setIsDirty( true );
	}, [] );

	const handleSearch = ( searchTerm: string ) => {
		setSearchValue( searchTerm );
	};

	const handleSave = useCallback( async (): Promise< { success: boolean } > => {
		const originalVariables = getVariables( false );
		setIsSaving( true );
		const result = await service.batchSave( originalVariables, variables );

		if ( result.success ) {
			await service.load();
			const updatedVariables = service.variables();

			setVariables( updatedVariables );
			setDeletedVariables( [] );
			setIsDirty( false );
		}

		return { success: result.success };
	}, [ variables ] );

	const filteredVariables = () => {
		const variableTypes = getVariableTypes();

		const list = Object.entries( variables )
			.filter( ( [ , v ] ) => ! v.deleted )
			.map( ( [ key, v ] ) => ( { key, ...v } ) );

		const grouped: Record< string, typeof list > = {};
		list.forEach( ( item ) => ( grouped[ item.type ] ??= [] ).push( item ) );

		const typeFiltered = Object.entries( grouped ).flatMap( ( [ type, vars ] ) => {
			const filter = variableTypes[ type ]?.selectionFilter;
			const normalized = vars.map( ( { type: _, ...rest } ) => rest );

			return ( filter?.( normalized ) ?? normalized ).map( ( v ) => ( { ...v, type } ) );
		} );

		const searchFiltered = filterBySearch( typeFiltered, searchValue );

		return Object.fromEntries( searchFiltered.map( ( { key, ...rest } ) => [ key, rest ] ) );
	};

	return {
		variables: filteredVariables(),
		deletedVariables,
		isDirty,
		isSaveDisabled,
		handleOnChange,
		createVariable,
		handleDeleteVariable,
		handleSave,
		isSaving,
		handleSearch,
		searchValue,
		setIsSaving,
		setIsSaveDisabled,
	};
};
