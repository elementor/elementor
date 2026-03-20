import { getMixpanel } from '@elementor/events';

type VariableEventData = {
	varType: string;
	controlPath: string;
	action: 'open' | 'add' | 'connect' | 'save';
};

export const trackVariableEvent = ( { varType, controlPath, action }: VariableEventData ) => {
	const { dispatchEvent, config } = getMixpanel();
	if ( ! config?.names?.variables?.[ action ] ) {
		return;
	}

	const name = config.names.variables[ action ];
	dispatchEvent?.( name, {
		location: config?.locations?.variables || '',
		secondaryLocation: config?.secondaryLocations?.variablesPopover || '',
		trigger: config?.triggers?.click || '',
		var_type: varType,
		control_path: controlPath,
		action_type: name,
	} );
};

type VariablesManagerEventData = {
	action: 'openManager' | 'add' | 'saveChanges' | 'delete';
	varType?: string;
	controlPath?: string;
};

export const trackVariablesManagerEvent = ( { action, varType, controlPath }: VariablesManagerEventData ) => {
	const { dispatchEvent, config } = getMixpanel();
	if ( ! config?.names?.variables?.[ action ] ) {
		return;
	}

	const name = config.names.variables[ action ];
	const eventData: Record< string, string > = {
		location: config?.locations?.variablesManager || '',
		trigger: config?.triggers?.click || '',
		action_type: name,
	};

	if ( varType ) {
		eventData.var_type = varType;
	}

	if ( controlPath ) {
		eventData.style_control_path = controlPath;
	}

	dispatchEvent?.( name, eventData );
};

type VariableSyncToV3Data = {
	variableLabel: string;
	action: 'sync' | 'unsync';
};

export const trackVariableSyncToV3 = ( { variableLabel, action }: VariableSyncToV3Data ) => {
	try {
		const { dispatchEvent, config } = getMixpanel();
		if ( ! config?.names?.variables?.variableSyncToV3 ) {
			return;
		}

		const name = config.names.variables.variableSyncToV3;
		const isSync = action === 'sync';

		dispatchEvent?.( name, {
			interaction_type: 'click',
			target_type: variableLabel,
			target_name: isSync ? 'sync_to_v3' : 'unsync_to_v3',
			interaction_result: isSync ? 'var_is_synced_to_V3' : 'var_is_unsynced_from_V3',
			target_location: 'widget_panel',
			location_l1: 'var_manager',
			interaction_description: isSync
				? `user_synced_${ variableLabel }_to_v3`
				: `user_unsync_${ variableLabel }_from_v3`,
		} );
	} catch ( error ) {
		console.error( 'Failed to track variable sync to V3:', error );
	}
};
