import { useState } from 'react';

import { FEATURE_WELL_KNOWN } from '../analytics/agent-ready-events';
import { trackFeatureToggled } from '../analytics/track-agent-ready-event';
import { saveAgentReadySettings } from '../api';
import { AGENT_DISCOVERY_SETTINGS_KEY } from '../constants';
import { getSaveErrorMessage } from './get-save-error-message';

export const useAgentDiscoverySettings = ( initialState ) => {
	const [ isEnabled, setIsEnabled ] = useState( initialState.enabled );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ saveError, setSaveError ] = useState( '' );

	const toggleEnabled = () => {
		const previousIsEnabled = isEnabled;
		const nextIsEnabled = ! isEnabled;

		trackFeatureToggled( { featureName: FEATURE_WELL_KNOWN, isEnabled: nextIsEnabled, hasConflict: false } );
		setSaveError( '' );
		setIsSaving( true );
		setIsEnabled( nextIsEnabled );

		return saveAgentReadySettings( {
			[ AGENT_DISCOVERY_SETTINGS_KEY ]: { enabled: nextIsEnabled },
		} )
			.catch( ( reason ) => {
				setIsEnabled( previousIsEnabled );
				setSaveError( getSaveErrorMessage( reason ) );
			} )
			.finally( () => setIsSaving( false ) );
	};

	return {
		files: initialState.files,
		isEnabled,
		isSaving,
		saveError,
		setIsEnabled,
		toggleEnabled,
	};
};
