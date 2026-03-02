import { componentsStore } from '../../store/dispatchers';

export function isEditingComponent(): boolean {
	return componentsStore.getCurrentComponentId() !== null;
}
