import { __getState as getState, __getStore as getStore } from '@elementor/store';

import { type ComponentId } from '../types';
import {
	type ComponentsSlice,
	selectArchivedThisSession,
	selectComponentByUid,
	selectComponents,
	selectCurrentComponent,
	selectCurrentComponentId,
	selectOverridableProps,
	selectUnpublishedComponents,
	selectUpdatedComponentNames,
} from './store';

function safeGetState(): ComponentsSlice | undefined {
	return getStore()?.getState() as ComponentsSlice | undefined;
}

export const componentsSelectors = {
	getOverridableProps(componentId: ComponentId) {
		return selectOverridableProps(getState(), componentId);
	},
	getCurrentComponent() {
		return selectCurrentComponent(getState());
	},
	getCurrentComponentId() {
		const state = safeGetState();
		if (!state) {
			return null;
		}
		return selectCurrentComponentId(state);
	},
	getUnpublishedComponents() {
		return selectUnpublishedComponents(getState());
	},
	getUpdatedComponentNames() {
		return selectUpdatedComponentNames(getState());
	},
	getArchivedThisSession() {
		return selectArchivedThisSession(getState());
	},
	getComponents() {
		return selectComponents(getState());
	},
	getComponentByUid(componentUid: string) {
		return selectComponentByUid(getState(), componentUid);
	},
};
