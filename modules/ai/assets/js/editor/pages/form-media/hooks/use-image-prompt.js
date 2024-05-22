import { useEffect } from 'react';
import usePrompt from '../../../hooks/use-prompt';
import { useGlobalActions } from '../context/global-actions-context';

const useImagePrompt = ( ...args ) => {
	const promptData = usePrompt( ...args );
	const { setHasUnsavedChanges, state } = useGlobalActions();

	useEffect( () => {
		if ( promptData.data?.result ) {
			// Updating the hasUnsavedChanges global state that will trigger the unsaved changes dialog.
			setHasUnsavedChanges( true );
		}
	}, [ promptData.data ] );

	useEffect( () => {
		if ( state.isAllSaved ) {
			promptData.sendUsageData();
		}
	}, [ state.isAllSaved ] );

	return promptData;
};

export default useImagePrompt;
