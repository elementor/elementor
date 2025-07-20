type VariableEventData = {
	varType: string;
	controlPath: string;
	action: 'open' | 'add' | 'connect' | 'save';
};

export const trackVariableEvent = ( { varType, controlPath, action }: VariableEventData ) => {
	const extendedWindow = window as unknown as Window & {
		elementor?: {
			editorEvents?: {
				dispatchEvent: ( name: string, data: Record< string, string > ) => void;
				config?: {
					locations: Record< string, string >;
					secondaryLocations: Record< string, string >;
					names: {
						variables?: Record< string, string >;
					};
					triggers: Record< string, string >;
					elements?: Record< string, string >;
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
