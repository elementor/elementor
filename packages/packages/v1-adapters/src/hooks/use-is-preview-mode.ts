import useListenTo from './use-listen-to';
import { editModeChangeEvent, getCurrentEditMode } from '../';

export default function useIsPreviewMode() {
	return useListenTo(
		editModeChangeEvent(),
		() => getCurrentEditMode() === 'preview'
	);
}
