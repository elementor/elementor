import { useMemo } from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { type PropKey } from '@elementor/editor-props';

import { useVariableType } from '../context/variable-type-context';
import { service } from '../service';
import { type Variable } from '../types';

type NormalizedVariable = {
	key: string;
	label: string;
	value: string;
};

export const useVariable = ( key: string ) => {
	const variables = service.variables();

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
	return variables.filter( ( { label } ) => label.toLowerCase().includes( searchValue.toLowerCase() ) );
};

const usePropVariables = ( propKey: PropKey ): NormalizedVariable[] => {
	return useMemo( () => normalizeVariables( propKey ), [ propKey ] );
};

const isNotDeleted = ( { deleted }: { deleted?: boolean } ): boolean => ! deleted;

const normalizeVariables = ( propKey: string ): NormalizedVariable[] => {
	const variables = service.variables();

	return Object.entries( variables )
		.filter( ( [ , variable ] ) => variable.type === propKey && isNotDeleted( variable ) )
		.map(
			( [ key, { label, value } ] ): NormalizedVariable => ( {
				key,
				label,
				value,
			} )
		);
};

type VariableUpdateData = {
	value: string;
	label: string;
};

const extractId = ( { id }: { id: string } ): string => id;

export const createVariable = ( newVariable: Variable ): Promise< string > => {
	return service.create( newVariable ).then( extractId );
};

export const updateVariable = ( updateId: string, updateData: VariableUpdateData ): Promise< string > => {
	return service.update( updateId, updateData ).then( extractId );
};

export const deleteVariable = ( deleteId: string ): Promise< string > => {
	return service.delete( deleteId ).then( extractId );
};

export const restoreVariable = ( restoreId: string, label?: string, value?: string ): Promise< string > => {
	return service.restore( restoreId, label, value ).then( extractId );
};
