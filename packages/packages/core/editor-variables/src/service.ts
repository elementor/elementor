import { type AxiosResponse } from '@elementor/http-client';
import { __ } from '@wordpress/i18n';

import { apiClient } from './api';
import { OP_RW, Storage, type TVariablesList } from './storage';
import { styleVariablesRepository } from './style-variables-repository';
import { type Variable } from './types';
import { ERROR_MESSAGES } from './utils/validations';

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
			} )
			.catch( ( error ) => {
				const message = getErrorMessage( error.response );
				throw message ? new Error( message ) : error;
			} );
	},

	update: ( id: string, { label, value }: Omit< Variable, 'type' > ) => {
		return apiClient
			.update( id, label, value )
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
			} )
			.catch( ( error ) => {
				const message = getErrorMessage( error.response );
				throw message ? new Error( message ) : error;
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

	restore: ( id: string, label?: string, value?: string ) => {
		return apiClient
			.restore( id, label, value )
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
			} )
			.catch( ( error ) => {
				const message = getErrorMessage( error.response );
				throw message ? new Error( message ) : error;
			} );
	},
};

const handleWatermark = ( operation: string, newWatermark: number ) => {
	if ( storage.watermarkDiff( operation, newWatermark ) ) {
		setTimeout( () => service.load(), 500 );
	}
	storage.watermark( newWatermark );
};

const getErrorMessage = ( response: AxiosResponse ) => {
	if ( response?.data?.code === 'duplicated_label' ) {
		return ERROR_MESSAGES.DUPLICATED_LABEL;
	}

	return ERROR_MESSAGES.UNEXPECTED_ERROR;
};
