import useListenTo from './use-listen-to';
import { getCurrentEditMode } from '../readers';
import { editModeChangeEvent } from '../listeners';

export default function useIsPreviewMode() {
	return useListenTo(
		editModeChangeEvent(),
		() => getCurrentEditMode() === 'preview'
	);
}
