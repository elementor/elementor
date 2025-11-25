import { __getState as getState } from '@elementor/store';

import { apiClient } from '../api';
import { selectOverridableProps } from '../store/store';

export const saveOverrideProps = ( elementId: number ) => {
	const componentOverrides = selectOverridableProps( getState(), elementId );
	try {
		apiClient.setOverrideProps( elementId, componentOverrides );
	} catch ( e ) {}
};

export const loadOverridableProps = async ( componentId: number ) => {
	return await apiClient.getOverrideProps( componentId );
};
