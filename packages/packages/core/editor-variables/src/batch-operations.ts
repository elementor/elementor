import { __ } from '@wordpress/i18n';

import { type BatchOperation, type BatchPayload } from './api';
import { type TVariable, type TVariablesList } from './storage';

export type OperationResult = {
	id: string;
	type: 'create' | 'update' | 'delete' | 'restore';
	variable?: TVariable & { id: string; created_at?: string; updated_at?: string };
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
					id,
					type: variable.type,
					label: variable.label,
					value: variable.value,
				},
			} );
		} else if ( originalVariables[ id ] ) {
			const original = originalVariables[ id ];

			if ( original.deleted && ! variable.deleted ) {
				const restoreOperation: BatchOperation = {
					type: 'restore',
					id,
				};

				if ( variable.label !== original.label ) {
					restoreOperation.label = variable.label;
				}

				if ( variable.value !== original.value ) {
					restoreOperation.value = variable.value;
				}

				operations.push( restoreOperation );
			} else if (
				! variable.deleted &&
				( original.label !== variable.label || original.value !== variable.value )
			) {
				const updateData: Record< string, string > = {};

				if ( original.label !== variable.label ) {
					updateData.label = variable.label;
				}
				if ( original.value !== variable.value ) {
					updateData.value = variable.value;
				}

				operations.push( {
					type: 'update',
					id,
					variable: updateData,
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

	return operations.filter( ( op ) => op.id && ! ( isTempId( op.id ) && currentVariables[ op.id ].deleted ) );
};

export const validateOperations = ( operations: BatchOperation[] ): { isValid: boolean; errors: string[] } => {
	const errors: string[] = [];

	operations.forEach( ( op, index ) => {
		switch ( op.type ) {
			case 'create':
				if ( ! op.variable?.type || ! op.variable?.label || ! op.variable?.value ) {
					errors.push( __( `Create operation at index ${ index } is missing required fields`, 'elementor' ) );
				}
				break;
			case 'update':
				if ( ! op.id || ! op.variable || ( ! op.variable.label && ! op.variable.value ) ) {
					errors.push( __( `Update operation at index ${ index } is missing required fields`, 'elementor' ) );
				}
				break;
			case 'delete':
				if ( ! op.id ) {
					errors.push( __( `Delete operation at index ${ index } is missing ID`, 'elementor' ) );
				}
				break;
			case 'restore':
				if ( ! op.id ) {
					errors.push( __( `Restore operation at index ${ index } is missing ID`, 'elementor' ) );
				}
				break;
		}
	} );

	return {
		isValid: errors.length === 0,
		errors,
	};
};

export const createBatchPayload = ( operations: BatchOperation[], watermark: number ): BatchPayload => {
	return {
		watermark,
		operations,
	};
};

export const processBatchResponse = (
	response: BatchResponse
): {
	success: boolean;
	newWatermark?: number;
	results?: OperationResult[];
	errors?: Record< string, string >;
	generalError?: string;
} => {
	if ( response.success ) {
		return {
			success: true,
			newWatermark: response.watermark,
			results: response.results,
		};
	}

	const errors: Record< string, string > = {};
	const generalError = response.message || __( 'An error occurred while saving variables', 'elementor' );

	if ( response.data ) {
		Object.entries( response.data ).forEach( ( [ id, errorInfo ] ) => {
			errors[ id ] = errorInfo.message;
		} );
	}

	return {
		success: false,
		errors,
		generalError,
	};
};
