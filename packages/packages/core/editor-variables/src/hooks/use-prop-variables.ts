import { useMemo } from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { type PropKey } from '@elementor/editor-props';

import { useVariableType } from '../context/variable-type-context';
import { service } from '../service';
import { type NormalizedVariable, type Variable } from '../types';
import { filterBySearch } from '../utils/filter-by-search';
import { getVariableType, getVariableTypes } from '../variables-registry/variable-type-registry';

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
	const searchFilteredVariables = filterBySearch( typeFilteredVariables, searchValue );
	const sortedVariables = searchFilteredVariables.sort( ( a, b ) => {
		const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
		const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
		return orderA - orderB;
	} );

	return {
		list: sortedVariables,
		hasMatches: searchFilteredVariables.length > 0,
		isSourceNotEmpty: typeFilteredVariables.length > 0,
		hasNoCompatibleVariables: baseVariables.length > 0 && typeFilteredVariables.length === 0,
	};
};

const useVariableSelectionFilter = ( variables: NormalizedVariable[] ): NormalizedVariable[] => {
	const { selectionFilter } = useVariableType();
	const { propType } = useBoundProp();

	return selectionFilter ? selectionFilter( variables, propType ) : variables;
};

const usePropVariables = ( propKey: PropKey ): NormalizedVariable[] => {
	return useMemo( () => normalizeVariables( propKey ), [ propKey ] );
};

const getMatchingTypes = ( propKey: string ): string[] => {
	const matchingTypes: string[] = [];
	const allTypes = getVariableTypes();
	const variableType = getVariableType( propKey );

	Object.entries( allTypes ).forEach( ( [ key, typeOptions ] ) => {
		if ( variableType.variableType === typeOptions.variableType ) {
			matchingTypes.push( key );
		}
	} );

	return matchingTypes;
};

const normalizeVariables = ( propKey: string ) => {
	const variables = getVariables( false );
	const matchingTypes = getMatchingTypes( propKey );

	return Object.entries( variables )
		.filter( ( [ , variable ] ) => matchingTypes.includes( variable.type ) )
		.map( ( [ key, { label, value, order } ] ) => ( {
			key,
			label,
			value,
			order,
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
