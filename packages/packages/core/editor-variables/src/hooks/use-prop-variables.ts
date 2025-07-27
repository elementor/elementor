import { useMemo } from 'react';
import { type PropKey } from '@elementor/editor-props';

import { service } from '../service';
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

const isNotDeleted = ( { deleted }: { deleted?: boolean } ) => ! deleted;

const normalizeVariables = ( propKey: string ) => {
	const variables = service.variables();

	return Object.entries( variables )
		.filter( ( [ , variable ] ) => variable.type === propKey && isNotDeleted( variable ) )
		.map( ( [ key, { label, value } ] ) => ( {
			key,
			label,
			value,
		} ) );
};

export const createVariable = ( newVariable: Variable ): Promise< string > => {
	return service.create( newVariable ).then( ( { id }: { id: string } ) => {
		return id;
	} );
};

export const updateVariable = ( updateId: string, { value, label }: { value: string; label: string } ) => {
	return service.update( updateId, { value, label } ).then( ( { id }: { id: string } ) => {
		return id;
	} );
};

export const deleteVariable = ( deleteId: string ) => {
	return service.delete( deleteId ).then( ( { id }: { id: string } ) => {
		return id;
	} );
};

export const restoreVariable = ( restoreId: string, label?: string, value?: string ) => {
	return service.restore( restoreId, label, value ).then( ( { id }: { id: string } ) => {
		return id;
	} );
};
