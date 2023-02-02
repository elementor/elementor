import { useEffect, useState } from 'react';
import { editModeChangeEvent, getCurrentEditMode, listenTo } from '../';

export default function useIsPreviewMode() {
	const [ isActive, setIsActive ] = useState( () => isPreviewMode() );

	useEffect( () => {
		const updateState = () => setIsActive( isPreviewMode() );

		const cleanup = listenTo(
			editModeChangeEvent(),
			updateState,
		);

		return cleanup;
	}, [] );

	return isActive;
}

function isPreviewMode() {
	return getCurrentEditMode() === 'preview';
}
