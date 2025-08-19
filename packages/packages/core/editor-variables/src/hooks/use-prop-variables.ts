import { useMemo } from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { type PropKey } from '@elementor/editor-props';

import { useVariableType } from '../context/variable-type-context';
import { service } from '../service';
import { type NormalizedVariable, type Variable } from '../types';

export const getVariables = ( includeDeleted = true ) => {
	const variables = service.variables();

	if ( includeDeleted ) {
		return variables;
	}

	return Object.fromEntries( Object.entries( variables ).filter( ( [ , variable ] ) => ! variable.deleted ) );
};

export const useVariable = ( key: string ) => {
	const variables = getVariables();

	if ( ! variables?.[ key ] ) {
		return null;
	}

	return {
		...variables[ key ],
		key,
	};
};

export const useFilteredVariables = ( searchValue: string, propTypeKey: string ) => {
	const baseVariables = usePropVariables( propTypeKey );

	const typeFilteredVariables = useVariableSelectionFilter( baseVariables );
	const searchFilteredVariables = filterVariablesBySearchValue( typeFilteredVariables, searchValue );

	return {
		list: searchFilteredVariables,
		hasMatches: searchFilteredVariables.length > 0,
		isSourceNotEmpty: typeFilteredVariables.length > 0,
	};
};

const useVariableSelectionFilter = ( variables: NormalizedVariable[] ): NormalizedVariable[] => {
	const { selectionFilter } = useVariableType();
	const { propType } = useBoundProp();

	return selectionFilter ? selectionFilter( variables, propType ) : variables;
};

const filterVariablesBySearchValue = ( variables: NormalizedVariable[], searchValue: string ): NormalizedVariable[] => {
	const lowerSearchValue = searchValue.toLowerCase();
	return variables.filter( ( { label } ) => label.toLowerCase().includes( lowerSearchValue ) );
};

const usePropVariables = ( propKey: PropKey ): NormalizedVariable[] => {
	return useMemo( () => normalizeVariables( propKey ), [ propKey ] );
};

const normalizeVariables = ( propKey: string ) => {
	const variables = getVariables( false );

	return Object.entries( variables )
		.filter( ( [ , variable ] ) => variable.type === propKey )
		.map( ( [ key, { label, value } ] ) => ( {
			key,
			label,
			value,
		} ) );
};

const extractId = ( { id }: { id: string } ): string => id;

export const createVariable = ( newVariable: Variable ): Promise< string > => {
	return service.create( newVariable ).then( extractId );
};

export const updateVariable = (
	updateId: string,
	{ value, label }: { value: string; label: string }
): Promise< string > => {
	return service.update( updateId, { value, label } ).then( extractId );
};

export const deleteVariable = ( deleteId: string ): Promise< string > => {
	return service.delete( deleteId ).then( extractId );
};

export const restoreVariable = ( restoreId: string, label?: string, value?: string ): Promise< string > => {
	return service.restore( restoreId, label, value ).then( extractId );
};
