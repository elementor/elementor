import { type BatchOperation } from './api';
import { type TVariable, type TVariablesList } from './storage';

export type OperationType = 'create' | 'update' | 'delete' | 'restore';

export type OperationResult = {
	id: string;
	type: OperationType;
	variable?: TVariable & { id: string };
	deleted?: boolean;
};

export const generateTempId = (): string => {
	const timestamp = Date.now().toString( 36 );
	const random = Math.random().toString( 36 ).substring( 2, 8 );
	return `tmp-${ timestamp }-${ random }`;
};

export const isTempId = ( id: string ): boolean => {
	return id.startsWith( 'tmp-' );
};

export const buildOperationsArray = (
	originalVariables: TVariablesList,
	currentVariables: TVariablesList,
	deletedVariables: string[]
): BatchOperation[] => {
	const operations: BatchOperation[] = [];

	Object.entries( currentVariables ).forEach( ( [ id, variable ] ) => {
		if ( isTempId( id ) ) {
			operations.push( {
				type: 'create',
				variable: {
					...variable,
					id,
				},
			} );
		} else if ( originalVariables[ id ] ) {
			const original = originalVariables[ id ];
			const syncChanged = original.sync_to_v3 !== variable.sync_to_v3;

			if ( original.deleted && ! variable.deleted ) {
				operations.push( {
					type: 'restore',
					id,
					...( original.label !== variable.label && { label: variable.label } ),
					...( original.value !== variable.value && { value: variable.value } ),
				} );
			} else if (
				! variable.deleted &&
				( original.label !== variable.label ||
					original.value !== variable.value ||
					original.order !== variable.order ||
					original.type !== variable.type ||
					syncChanged )
			) {
				operations.push( {
					type: 'update',
					id,
					variable: {
						...( original.label !== variable.label && { label: variable.label } ),
						...( original.value !== variable.value && { value: variable.value } ),
						...( original.order !== variable.order && { order: variable.order } ),
						...( original.type !== variable.type && { type: variable.type } ),
						...( syncChanged && { sync_to_v3: variable.sync_to_v3 } ),
					},
				} );
			}
		}
	} );

	deletedVariables.forEach( ( id: string ) => {
		operations.push( {
			type: 'delete',
			id,
		} );
	} );

	return operations.filter( ( op ) => {
		const id = op.id || op.variable?.id;
		return id && ! ( isTempId( id ) && currentVariables[ id ]?.deleted );
	} );
};
