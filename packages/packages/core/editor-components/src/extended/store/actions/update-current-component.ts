import { type V1Document } from '@elementor/editor-documents';

import { componentsStore } from '../../../store/dispatchers';
import { type ComponentsPathItem } from '../../../store/store';

export function updateCurrentComponent( params: {
	path: ComponentsPathItem[];
	currentComponentId: V1Document[ 'id' ] | null;
} ) {
	componentsStore.setPath( params.path );
	componentsStore.setCurrentComponentId( params.currentComponentId );
}
