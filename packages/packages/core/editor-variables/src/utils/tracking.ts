type VariableEventData = {
    varType: string;  // e.g., 'color', 'typography', etc.
    path: string;     // e.g., 'settings.typography.font-family'
    action: 'open' | 'create' | 'connect' | 'save';
};

export const trackVariableEvent = ({ varType, path, action }: VariableEventData) => {
    const extendedWindow = window as unknown as Window & {
        elementor?: {
            editorEvents?: {
                dispatchEvent: (name: string, data: Record<string, string>) => void;
                config?: {
                    locations: Record<string, string>;
                    secondaryLocations: Record<string, string>;
                    names: {
                        variables?: Record<string, string>;
                    };
                    triggers: Record<string, string>;
                    elements: Record<string, string>;
                };
            };
        };
    };

    const config = extendedWindow?.elementor?.editorEvents?.config;
    if (!config?.names?.variables?.[action]) return;

    extendedWindow.elementor?.editorEvents?.dispatchEvent(
        config.names.variables[action],
        {
            location: config.locations.variables,
            secondaryLocation: config.secondaryLocations.variablesPopover,
            trigger: config.triggers.click,
            element: config.elements.button,
            var_type: varType,
            path: path,
        }
    );
};