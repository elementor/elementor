import { useState } from 'react';

import { saveAgentReadySettings } from '../api';
import { BROWSER_TOOLS_SETTINGS_KEY } from '../constants';
import { getSaveErrorMessage } from './get-save-error-message';

export const useBrowserToolsSettings = ( initialState ) => {
	const [ isEnabled, setIsEnabled ] = useState( initialState.enabled );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ saveError, setSaveError ] = useState( '' );

	const toggleEnabled = () => {
		const previousIsEnabled = isEnabled;
		const nextIsEnabled = ! isEnabled;

		setSaveError( '' );
		setIsSaving( true );
		setIsEnabled( nextIsEnabled );

		return saveAgentReadySettings( {
			[ BROWSER_TOOLS_SETTINGS_KEY ]: { enabled: nextIsEnabled },
		} )
			.catch( ( reason ) => {
				setIsEnabled( previousIsEnabled );
				setSaveError( getSaveErrorMessage( reason ) );
			} )
			.finally( () => setIsSaving( false ) );
	};

	return {
		editDetailsUrl: initialState.editDetailsUrl,
		isAvailable: initialState.isAvailable,
		isEnabled,
		isSaving,
		saveError,
		tools: initialState.tools,
		toggleEnabled,
	};
};
