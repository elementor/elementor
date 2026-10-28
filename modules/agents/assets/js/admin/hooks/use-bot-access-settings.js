import { useState } from 'react';

import {
	CRAWLER_ID_ALL,
	FEATURE_BOT_ACCESS,
	SCOPE_BULK,
	SCOPE_SINGLE,
	TARGET_TYPE_BUTTON,
	TARGET_TYPE_CHECKBOX,
} from '../analytics/agent-ready-events';
import { trackBotPermissionChanged, trackFeatureToggled } from '../analytics/track-agent-ready-event';
import { saveAgentReadySettings } from '../api';
import {
	addBot as addBotToList,
	setColumn as setColumnValue,
	setRow as setRowValue,
	toSettingsBots,
	togglePermission as togglePermissionValue,
} from '../components/bot-access/bot-access-rules';
import { BOT_ACCESS_SETTINGS_KEY, BOT_PERMISSION_SETTING_KEYS } from '../constants';
import { getSaveErrorMessage } from './get-save-error-message';

export const useBotAccessSettings = ( initialState ) => {
	const { catalog, hasPhysicalFile } = initialState;
	const unavailableReason = initialState.unavailableReason ?? null;
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

	const toggleEnabled = () => {
		trackFeatureToggled( { featureName: FEATURE_BOT_ACCESS, isEnabled: ! isEnabled, hasConflict: hasPhysicalFile } );

		return saveSettings( ! isEnabled, bots );
	};

	const togglePermission = ( token, permission ) => {
		const currentBot = bots.find( ( bot ) => bot.token === token );

		trackBotPermissionChanged( {
			scope: SCOPE_SINGLE,
			crawlerId: token,
			permissionType: BOT_PERMISSION_SETTING_KEYS[ permission ],
			isAllowed: ! currentBot?.[ permission ],
			targetType: TARGET_TYPE_CHECKBOX,
		} );

		return saveSettings( isEnabled, togglePermissionValue( bots, token, permission ) );
	};

	const setColumn = ( permission, value ) => {
		trackBotPermissionChanged( {
			scope: SCOPE_BULK,
			crawlerId: CRAWLER_ID_ALL,
			permissionType: BOT_PERMISSION_SETTING_KEYS[ permission ],
			isAllowed: value,
			targetType: TARGET_TYPE_BUTTON,
		} );

		return saveSettings( isEnabled, setColumnValue( bots, permission, value ) );
	};

	const setRow = ( token, value ) => {
		trackBotPermissionChanged( {
			scope: SCOPE_BULK,
			crawlerId: token,
			isAllowed: value,
			targetType: TARGET_TYPE_BUTTON,
		} );

		return saveSettings( isEnabled, setRowValue( bots, token, value ) );
	};

	const addBot = ( token ) => saveSettings( isEnabled, addBotToList( bots, token, catalogTokens ) );

	return {
		addBot,
		bots,
		catalog,
		hasPhysicalFile,
		isEnabled: isEnabled && ! unavailableReason,
		isSaving,
		saveError,
		setColumn,
		setIsEnabled,
		setRow,
		toggleEnabled,
		togglePermission,
		unavailableReason,
	};
};
