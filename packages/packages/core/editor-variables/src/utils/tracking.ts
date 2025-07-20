type VariableEventData = {
	varType: string;
	controlPath: string;
	action: 'open' | 'add' | 'connect' | 'save';
};

export const trackVariableEvent = ( { varType, controlPath, action }: VariableEventData ) => {
	const extendedWindow = window as unknown as Window & {
		elementor?: {
			editorEvents?: {
				dispatchEvent: ( name: string, data: Record< string, unknown > ) => void;
				config?: {
					locations: Record< string, unknown >;
					secondaryLocations: Record< string, unknown >;
					names: {
						variables?: Record< string, unknown >;
					};
					triggers: Record< string, unknown >;
					elements: Record< string, unknown >;
				};
			};
		};
	};

	const config = extendedWindow?.elementor?.editorEvents?.config;
	if ( ! config?.names?.variables?.[ action ] ) {
		return;
	}

	const name = config.names.variables[ action ];
	extendedWindow.elementor?.editorEvents?.dispatchEvent( name, {
		location: config.locations.variables,
		secondaryLocation: config.secondaryLocations.variablesPopover,
		trigger: config.triggers.click,
		var_type: varType,
		control_path: controlPath,
		action_type: name,
	} );
};
