import { useState } from 'react';

import { saveAgentReadySettings } from '../api';
import { BROWSER_TOOLS_SETTINGS_KEY, BUSINESS_DETAILS_SETTINGS_KEY } from '../constants';
import { getSaveErrorMessage } from './get-save-error-message';

export const useBrowserToolsSettings = ( initialState ) => {
	const [ isEnabled, setIsEnabled ] = useState( initialState.enabled );
	const [ businessDetails, setBusinessDetails ] = useState( initialState.businessDetails ?? '' );
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

	const saveBusinessDetails = ( details ) => {
		const trimmedDetails = details.trim();

		return saveAgentReadySettings( {
			[ BROWSER_TOOLS_SETTINGS_KEY ]: { [ BUSINESS_DETAILS_SETTINGS_KEY ]: trimmedDetails },
		} )
			.then( () => setBusinessDetails( trimmedDetails ) )
			.catch( ( reason ) => Promise.reject( getSaveErrorMessage( reason ) ) );
	};

	return {
		businessDetails,
		isAvailable: initialState.isAvailable,
		isEnabled,
		isSaving,
		maxBusinessDetailsLength: initialState.maxBusinessDetailsLength,
		saveBusinessDetails,
		saveError,
		tools: initialState.tools,
		toggleEnabled,
	};
};
