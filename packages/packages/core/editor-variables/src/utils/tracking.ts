import { getMixpanel } from '@elementor/events';

export type VariableEventData = {
	varType: string;
	controlPath?: string;
	action: 'open' | 'add' | 'connect' | 'save' | 'update';
	executedBy?: 'mcp_tool' | 'user';
};

export const trackVariableEvent = ( { varType, controlPath, action, executedBy }: VariableEventData ) => {
	const { dispatchEvent, config } = getMixpanel();
	if ( ! config?.names?.variables?.[ action ] ) {
		return;
	}

	const name = config.names.variables[ action ];

	let eventData: Record< string, string > = {
		var_type: varType,
		action_type: name,
	};

	if ( executedBy ) {
		eventData.executed_by = executedBy;
	}

	const defaultLocationInfo = {
		location: config?.locations?.variables || '',
		secondaryLocation: config?.secondaryLocations?.variablesPopover || '',
		trigger: config?.triggers?.click || '',
	};

	if ( ! executedBy || executedBy !== 'mcp_tool' ) {
		eventData = { ...defaultLocationInfo, ...eventData };
	}

	if ( controlPath ) {
		eventData.control_path = controlPath;
	}

	dispatchEvent?.( name, eventData );
};

export type VariablesManagerOpenSource = 'vars-popover' | 'system-panel';

type VariablesManagerEventData = {
	action: 'openManager' | 'add' | 'saveChanges' | 'delete' | 'duplicate';
	source?: VariablesManagerOpenSource;
	varType?: string;
	controlPath?: string;
};

export const trackVariablesManagerEvent = ( { action, source, varType, controlPath }: VariablesManagerEventData ) => {
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

	if ( source ) {
		eventData.source = source;
	}

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
	} catch {}
};
