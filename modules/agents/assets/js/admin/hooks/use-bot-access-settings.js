import { useState } from 'react';

import { saveAgentReadySettings } from '../api';
import {
	addBot as addBotToList,
	setColumn as setColumnValue,
	setRow as setRowValue,
	toSettingsBots,
	togglePermission as togglePermissionValue,
} from '../components/bot-access/bot-access-rules';
import { BOT_ACCESS_SETTINGS_KEY } from '../constants';
import { getSaveErrorMessage } from './get-save-error-message';

export const useBotAccessSettings = ( initialState ) => {
	const { catalog, hasPhysicalFile } = initialState;
	const catalogTokens = catalog.map( ( bot ) => bot.token );

	const [ isEnabled, setIsEnabled ] = useState( initialState.enabled );
	const [ bots, setBots ] = useState( initialState.bots );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ saveError, setSaveError ] = useState( '' );

	const saveSettings = ( nextIsEnabled, nextBots ) => {
		const previousIsEnabled = isEnabled;
		const previousBots = bots;

		setSaveError( '' );
		setIsSaving( true );
		setIsEnabled( nextIsEnabled );
		setBots( nextBots );

		return saveAgentReadySettings( {
			[ BOT_ACCESS_SETTINGS_KEY ]: {
				enabled: nextIsEnabled,
				bots: toSettingsBots( nextBots ),
			},
		} )
			.catch( ( reason ) => {
				setIsEnabled( previousIsEnabled );
				setBots( previousBots );
				setSaveError( getSaveErrorMessage( reason ) );
			} )
			.finally( () => setIsSaving( false ) );
	};

	const toggleEnabled = () => saveSettings( ! isEnabled, bots );

	const togglePermission = ( token, permission ) => saveSettings( isEnabled, togglePermissionValue( bots, token, permission ) );

	const setColumn = ( permission, value ) => saveSettings( isEnabled, setColumnValue( bots, permission, value ) );

	const setRow = ( token, value ) => saveSettings( isEnabled, setRowValue( bots, token, value ) );

	const addBot = ( token ) => saveSettings( isEnabled, addBotToList( bots, token, catalogTokens ) );

	return {
		addBot,
		bots,
		catalog,
		hasPhysicalFile,
		isEnabled: isEnabled && ! hasPhysicalFile,
		isSaving,
		saveError,
		setColumn,
		setRow,
		toggleEnabled,
		togglePermission,
	};
};
