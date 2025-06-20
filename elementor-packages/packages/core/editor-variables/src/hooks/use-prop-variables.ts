import { useMemo } from 'react';
import { type PropKey } from '@elementor/editor-props';

import { service } from '../service';
import { type TVariable } from '../storage';
import { styleVariablesRepository } from '../style-variables-repository';
import { type Variable } from '../types';

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
	const variables = usePropVariables( propTypeKey );

	const filteredVariables = variables.filter( ( { label } ) => {
		return label.toLowerCase().includes( searchValue.toLowerCase() );
	} );

	return {
		list: filteredVariables,
		hasMatches: filteredVariables.length > 0,
		isSourceNotEmpty: variables.length > 0,
	};
};

const usePropVariables = ( propKey: PropKey ) => {
	return useMemo( () => normalizeVariables( propKey ), [ propKey ] );
};

const normalizeVariables = ( propKey: string ) => {
	const variables = service.variables();

	styleVariablesRepository.update( variables );

	return Object.entries( variables )
		.filter( ( [ , { type } ] ) => type === propKey )
		.map( ( [ key, { label, value } ] ) => ( {
			key,
			label,
			value,
		} ) );
};

export const createVariable = ( newVariable: Variable ): Promise< string > => {
	return service.create( newVariable ).then( ( { id, variable }: { id: string; variable: TVariable } ) => {
		styleVariablesRepository.update( {
			[ id ]: variable,
		} );

		return id;
	} );
};

export const updateVariable = ( updateId: string, { value, label }: { value: string; label: string } ) => {
	return service
		.update( updateId, { value, label } )
		.then( ( { id, variable }: { id: string; variable: TVariable } ) => {
			styleVariablesRepository.update( {
				[ id ]: variable,
			} );

			return id;
		} );
};
