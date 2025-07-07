import { httpService } from '@elementor/http-client';

const BASE_PATH = 'elementor/v1/variables';

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

	update: ( id: string, label: string, value: string ) => {
		return httpService().put( BASE_PATH + '/update', {
			id,
			label,
			value,
		} );
	},

	delete: ( id: string ) => {
		return httpService().post( BASE_PATH + '/delete', { id } );
	},

	restore: ( id: string ) => {
		return httpService().post( BASE_PATH + '/restore', { id } );
	},
};
