import { getMixpanel } from '@elementor/mixpanel';

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
	action: 'openManager' | 'add' | 'saveChanges' | 'delete' | 'sync_to_v3';
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
