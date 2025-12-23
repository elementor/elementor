import { httpService } from '@elementor/http-client';

import { type OperationType } from './batch-operations';

const BASE_PATH = 'elementor/v1/variables';

type RestoreVariablePayload = {
	id: string;
	label?: string;
	value?: string;
	type?: string;
};

export type BatchOperation = {
	type: OperationType;
	id?: string;
	variable?: {
		id?: string;
		type?: string;
		label?: string;
		value?: string;
	};
	label?: string;
	value?: string;
};

export type BatchPayload = {
	watermark: number;
	operations: BatchOperation[];
};

export const apiClient = {
	list: () => {
		return httpService().get( BASE_PATH + '/list' );
	},

	create: ( type: string, label: string, value: string ) => {
		return httpService().post( BASE_PATH + '/create', {
			type,
			label,
			value,
		} );
	},

	update: ( id: string, label: string, value: string, type?: string ) => {
		return httpService().put( BASE_PATH + '/update', {
			id,
			label,
			value,
			type,
		} );
	},

	delete: ( id: string ) => {
		return httpService().post( BASE_PATH + '/delete', { id } );
	},

	restore: ( id: string, label?: string, value?: string, type?: string ) => {
		const payload: RestoreVariablePayload = { id };

		if ( label ) {
			payload.label = label;
		}

		if ( value ) {
			payload.value = value;
		}

		if ( type ) {
			payload.type = type;
		}

		return httpService().post( BASE_PATH + '/restore', payload );
	},

	batch: ( payload: BatchPayload ) => {
		return httpService().post( BASE_PATH + '/batch', payload );
	},
};
