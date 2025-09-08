import { useMixpanel } from '@elementor/mixpanel';

type VariableEventData = {
	varType: string;
	controlPath: string;
	action: 'open' | 'add' | 'connect' | 'save';
};

export const trackVariableEvent = ( { varType, controlPath, action }: VariableEventData ) => {
	const { trackEvent, mixpanelConfig } = useMixpanel();
	const config = mixpanelConfig;
	if ( ! config?.names?.variables?.[ action ] ) {
		return;
	}

	const name = config.names.variables[ action ];
	trackEvent?.( name, {
		location: config?.locations?.variables || '',
		secondaryLocation: config?.secondaryLocations?.variablesPopover || '',
		trigger: config?.triggers?.click || '',
		var_type: varType,
		control_path: controlPath,
		action_type: name,
	} );
};
