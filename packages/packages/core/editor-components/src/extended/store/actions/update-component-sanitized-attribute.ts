import { componentsStore } from '../../../store/dispatchers';
import { type SanitizeAttributes } from '../../../store/store';
import { type ComponentId } from '../../../types';

export function updateComponentSanitizedAttribute( componentId: ComponentId, attribute: SanitizeAttributes ) {
	componentsStore.updateComponentSanitizedAttribute( componentId, attribute );
}
