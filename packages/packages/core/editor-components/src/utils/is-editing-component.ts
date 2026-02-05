import { __getStore as getStore } from '@elementor/store';

import { type ComponentsSlice, selectCurrentComponentId } from '../store/store';

export function isEditingComponent(): boolean {
	const state = getStore()?.getState() as ComponentsSlice | undefined;

	if ( ! state ) {
		return false;
	}

	return selectCurrentComponentId( state ) !== null;
}
