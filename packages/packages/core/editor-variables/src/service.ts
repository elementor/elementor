import { apiClient } from './api';
import { OP_RW, Storage, type TVariablesList } from './storage';
import { styleVariablesRepository } from './style-variables-repository';
import { type Variable } from './types';

const storage = new Storage();

export const service = {
	variables: (): TVariablesList => {
		return storage.load();
	},

	init: () => {
		service.load();
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
					throw new Error( 'Unexpected response from server' );
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

	update: ( id: string, { label, value }: Omit< Variable, 'type' > ) => {
		return apiClient
			.update( id, label, value )
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

	restore: ( id: string ) => {
		return apiClient
			.restore( id )
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
};

const handleWatermark = ( operation: string, newWatermark: number ) => {
	if ( storage.watermarkDiff( operation, newWatermark ) ) {
		setTimeout( () => service.load(), 500 );
	}
	storage.watermark( newWatermark );
};
