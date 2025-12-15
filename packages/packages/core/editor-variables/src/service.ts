import { __ } from '@wordpress/i18n';

import { apiClient } from './api';
import { buildOperationsArray, type OperationResult } from './batch-operations';
import { OP_RW, Storage, type TVariablesList } from './storage';
import { styleVariablesRepository } from './style-variables-repository';
import { type Variable } from './types';

const storage = new Storage();

export const service = {
	variables: (): TVariablesList => {
		return storage.load();
	},

	getWatermark: (): number => {
		return storage.state.watermark;
	},

	init: () => {
		return service.load();
	},

	load: () => {
		return apiClient
			.list()
			.then( ( response ) => {
				const { success, data: payload } = response.data;

				if ( ! success ) {
					throw new Error( 'Unexpected response from server' );
				}

				return payload;
			} )
			.then( ( data ) => {
				const { variables, watermark } = data;

				storage.fill( variables, watermark );

				styleVariablesRepository.update( variables );

				return variables;
			} );
	},

	create: ( { type, label, value }: Variable ) => {
		return apiClient
			.create( type, label, value )
			.then( ( response ) => {
				const { success, data: payload } = response.data;

				if ( ! success ) {
					const errorMessage = payload?.message || __( 'Unexpected response from server', 'elementor' );
					throw new Error( errorMessage );
				}

				return payload;
			} )
			.then( ( data ) => {
				const { variable, watermark } = data;

				handleWatermark( OP_RW, watermark );

				const { id: variableId, ...createdVariable } = variable;

				storage.add( variableId, createdVariable );

				styleVariablesRepository.update( {
					[ variableId ]: createdVariable,
				} );

				return {
					id: variableId,
					variable: createdVariable,
				};
			} );
	},

	update: ( id: string, { label, value, type }: Omit< Variable, 'type' > & { type?: Variable[ 'type' ] } ) => {
		return apiClient
			.update( id, label, value, type )
			.then( ( response ) => {
				const { success, data: payload } = response.data;

				if ( ! success ) {
					const errorMessage = payload?.message || __( 'Unexpected response from server', 'elementor' );
					throw new Error( errorMessage );
				}

				return payload;
			} )
			.then( ( data ) => {
				const { variable, watermark } = data;

				handleWatermark( OP_RW, watermark );

				const { id: variableId, ...updatedVariable } = variable;

				storage.update( variableId, updatedVariable );

				styleVariablesRepository.update( {
					[ variableId ]: updatedVariable,
				} );

				return {
					id: variableId,
					variable: updatedVariable,
				};
			} );
	},

	delete: ( id: string ) => {
		return apiClient
			.delete( id )
			.then( ( response ) => {
				const { success, data: payload } = response.data;

				if ( ! success ) {
					throw new Error( 'Unexpected response from server' );
				}

				return payload;
			} )
			.then( ( data ) => {
				const { variable, watermark } = data;

				handleWatermark( OP_RW, watermark );

				const { id: variableId, ...deletedVariable } = variable;

				storage.update( variableId, deletedVariable );

				styleVariablesRepository.update( {
					[ variableId ]: deletedVariable,
				} );

				return {
					id: variableId,
					variable: deletedVariable,
				};
			} );
	},

	restore: ( id: string, label?: string, value?: string, type?: string ) => {
		return apiClient
			.restore( id, label, value, type )
			.then( ( response ) => {
				const { success, data: payload } = response.data;

				if ( ! success ) {
					throw new Error( 'Unexpected response from server' );
				}

				return payload;
			} )
			.then( ( data ) => {
				const { variable, watermark } = data;

				handleWatermark( OP_RW, watermark );

				const { id: variableId, ...restoredVariable } = variable;

				storage.update( variableId, restoredVariable );

				styleVariablesRepository.update( {
					[ variableId ]: restoredVariable,
				} );

				return {
					id: variableId,
					variable: restoredVariable,
				};
			} );
	},

	batchSave: ( originalVariables: TVariablesList, currentVariables: TVariablesList ) => {
		const operations = buildOperationsArray( originalVariables, currentVariables );
		const batchPayload = { operations, watermark: storage.state.watermark };

		if ( operations.length === 0 ) {
			return Promise.resolve( {
				success: true,
				watermark: storage.state.watermark,
				operations: 0,
			} );
		}

		return apiClient
			.batch( batchPayload )
			.then( ( response ) => {
				const { success, data: payload } = response.data;

				if ( ! success ) {
					throw new Error( 'Unexpected response from server' );
				}

				return payload;
			} )
			.then( ( data ) => {
				const { results, watermark } = data;

				handleWatermark( OP_RW, watermark );

				if ( results ) {
					results.forEach( ( result: OperationResult ) => {
						if ( result.variable ) {
							const { id: variableId, ...variableData } = result.variable;

							if ( result.type === 'create' ) {
								storage.add( variableId, variableData );
							} else {
								storage.update( variableId, variableData );
							}

							styleVariablesRepository.update( {
								[ variableId ]: variableData,
							} );
						}
					} );
				}

				return {
					success: true,
					watermark,
					operations: operations.length,
				};
			} );
	},
};

const handleWatermark = ( operation: string, newWatermark: number ) => {
	if ( storage.watermarkDiff( operation, newWatermark ) ) {
		setTimeout( () => service.load(), 500 );
	}
	storage.watermark( newWatermark );
};
