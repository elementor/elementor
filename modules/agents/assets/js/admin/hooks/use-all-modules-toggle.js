import { useState } from 'react';

import { saveAgentReadySettings } from '../api';
import { getSaveErrorMessage } from './get-save-error-message';

export const useAllModulesToggle = ( modules ) => {
	const [ isSaving, setIsSaving ] = useState( false );
	const [ saveError, setSaveError ] = useState( '' );

	const toggleableModules = modules.filter( ( module ) => module.isToggleable );
	const isAnyEnabled = toggleableModules.some( ( module ) => module.settings.isEnabled );
	const isAnyModuleSaving = modules.some( ( module ) => module.settings.isSaving );

	const toggleAll = () => {
		const nextIsEnabled = ! isAnyEnabled;
		const previousStates = toggleableModules.map( ( module ) => [ module, module.settings.isEnabled ] );

		setSaveError( '' );
		setIsSaving( true );
		toggleableModules.forEach( ( module ) => module.settings.setIsEnabled( nextIsEnabled ) );

		return saveAgentReadySettings(
			Object.fromEntries( toggleableModules.map( ( module ) => [ module.settingsKey, { enabled: nextIsEnabled } ] ) ),
		)
			.catch( ( reason ) => {
				previousStates.forEach( ( [ module, isEnabled ] ) => module.settings.setIsEnabled( isEnabled ) );
				setSaveError( getSaveErrorMessage( reason ) );
			} )
			.finally( () => setIsSaving( false ) );
	};

	return {
		isAnyEnabled,
		isDisabled: isSaving || isAnyModuleSaving || 0 === toggleableModules.length,
		isSaving,
		saveError,
		toggleAll,
	};
};
