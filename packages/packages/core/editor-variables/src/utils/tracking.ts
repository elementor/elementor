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
