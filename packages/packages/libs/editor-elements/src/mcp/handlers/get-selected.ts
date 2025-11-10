import { getSelectedElements } from '../../sync/get-selected-elements';

export function handleGetSelected(): Array< { id: string; type: string } > {
	return getSelectedElements();
}
