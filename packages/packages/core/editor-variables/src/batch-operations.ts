import { type BatchOperation, type BatchPayload } from './api';
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
	currentVariables: TVariablesList
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

			if ( original.deleted && ! variable.deleted ) {
				operations.push( {
					type: 'restore',
					id,
					...( original.label !== variable.label && { label: variable.label } ),
					...( original.value !== variable.value && { value: variable.value } ),
				} );
			} else if (
				! variable.deleted &&
				( original.label !== variable.label || original.value !== variable.value )
			) {
				operations.push( {
					type: 'update',
					id,
					variable: {
						...( original.label !== variable.label && { label: variable.label } ),
						...( original.value !== variable.value && { value: variable.value } ),
					},
				} );
			}
		}
	} );

	Object.entries( originalVariables ).forEach( ( [ id, variable ] ) => {
		if ( isTempId( id ) || variable.deleted ) {
			return;
		}

		const currentVariable = currentVariables[ id ];

		if ( ! currentVariable || currentVariable.deleted ) {
			operations.push( {
				type: 'delete',
				id,
			} );
		}
	} );

	return operations.filter( ( op ) => {
		const id = op.id || op.variable?.id;
		return id && ! ( isTempId( id ) && currentVariables[ id ]?.deleted );
	} );
};

export const createBatchPayload = ( operations: BatchOperation[], watermark: number ): BatchPayload => {
	return {
		watermark,
		operations,
	};
};
