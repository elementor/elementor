import { useEffect, useState } from 'react';
import { editModeChangeEvent, getCurrentEditMode, listenTo } from '../';

export default function useIsPreviewMode() {
	const [ isPreview, setIsPreview ] = useState( () => isPreviewMode() );

	useEffect( () => {
		const updateState = () => setIsPreview( isPreviewMode() );

		const cleanup = listenTo(
			editModeChangeEvent(),
			updateState,
		);

		return cleanup;
	}, [] );

	return isPreview;
}

function isPreviewMode() {
	return getCurrentEditMode() === 'preview';
}
