import { type BatchOperation, type BatchPayload } from './api';
import { type TVariable, type TVariablesList } from './storage';

export type OperationResult = {
	id: string;
	type: 'create' | 'update' | 'delete' | 'restore';
	variable?: TVariable & { id: string };
	deleted?: boolean;
};

export type BatchResponse = {
	success: boolean;
	watermark?: number;
	results?: OperationResult[];
	code?: string;
	message?: string;
	data?: Record< string, { status: number; message: string } >;
};

export type VariableChange = {
	type: 'create' | 'update' | 'delete' | 'restore';
	id: string;
	originalId?: string;
	variable?: Partial< TVariable >;
	label?: string;
};

export type OperationTracker = {
	originalVariables: TVariablesList;
	currentVariables: TVariablesList;
	watermark: number;
	changes: VariableChange[];
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
				const restoreOperation: BatchOperation = {
					type: 'restore',
					id,
					label: variable.label || original.label,
					value: variable.value || original.value,
				};

				operations.push( restoreOperation );
			} else if (
				! variable.deleted &&
				( original.label !== variable.label || original.value !== variable.value )
			) {
				operations.push( {
					type: 'update',
					id,
					variable: {
						label: variable.label,
						value: variable.value,
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
