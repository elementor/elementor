import { componentsSelectors } from '../../store/selectors';

export function isEditingComponent(): boolean {
	return componentsSelectors.getCurrentComponentId() !== null;
}
