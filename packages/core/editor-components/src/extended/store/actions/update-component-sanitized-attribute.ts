import { componentsActions } from '../../../store/dispatchers';
import { type SanitizeAttributes } from '../../../store/store';
import { type ComponentId } from '../../../types';

export function updateComponentSanitizedAttribute(componentId: ComponentId, attribute: SanitizeAttributes) {
	componentsActions.updateComponentSanitizedAttribute(componentId, attribute);
}
