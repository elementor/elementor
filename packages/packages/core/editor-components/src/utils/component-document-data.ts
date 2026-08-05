import { apiClient } from '../api';

export const getComponentDocumentData = async ( id: number ) => {
	try {
		return await apiClient.getComponentConfig( id );
	} catch {
		return null;
	}
};
