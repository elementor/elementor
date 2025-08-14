import { httpService } from '@elementor/http-client';

import { type Variable, type VariableWithoutType } from './types';

const BASE_PATH = 'elementor/v1/variables';

type RestoreVariablePayload = {
	id: string;
	label?: string;
	value?: Variable[ 'value' ];
};

export const apiClient = {
	list: () => {
		return httpService().get( BASE_PATH + '/list' );
	},

	create: ( { type, label, value }: Variable ) => {
		return httpService().post( BASE_PATH + '/create', {
			type,
			label,
			value,
		} );
	},

	update: ( id: string, { label, value }: VariableWithoutType ) => {
		return httpService().put( BASE_PATH + '/update', {
			id,
			label,
			value,
		} );
	},

	delete: ( id: string ) => {
		return httpService().post( BASE_PATH + '/delete', { id } );
	},

	restore: ( id: string, { label, value }: Partial< VariableWithoutType > ) => {
		const payload: RestoreVariablePayload = { id };

		if ( label ) {
			payload.label = label;
		}

		if ( value ) {
			payload.value = value;
		}

		return httpService().post( BASE_PATH + '/restore', payload );
	},
};
