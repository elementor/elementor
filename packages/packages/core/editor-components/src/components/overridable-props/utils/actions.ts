import { __getState as getState } from '@elementor/store';

import { apiClient } from '../../../api';
import { selectOverridableProps } from '../../../store/store';
import { OverridableProps } from '../../../types';

export const overrideActions = {
	save: (componentId: number	) => {
		const componentOverrides = selectOverridableProps(getState(), componentId);
		if ( ! componentOverrides ) {
			return;
		}
		apiClient.setOverrideProps( componentId, componentOverrides as OverridableProps );
	},
	
	load: async (componentId: number) => {
		return await apiClient.getOverrideProps( componentId );
	},
};