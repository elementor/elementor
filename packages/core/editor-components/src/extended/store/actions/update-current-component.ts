import { type V1Document } from '@elementor/editor-documents';

import { componentsActions } from '../../../store/dispatchers';
import { type ComponentsPathItem } from '../../../store/store';

export function updateCurrentComponent(params: {
	path: ComponentsPathItem[];
	currentComponentId: V1Document['id'] | null;
}) {
	componentsActions.setPath(params.path);
	componentsActions.setCurrentComponentId(params.currentComponentId);
}
