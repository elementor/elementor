import { useElement } from '../contexts/element-context';

type Defaults = {
	defaultSectionsExpanded: Record< string, string[] >;
	defaultTab: string;
};

export type { Defaults as ElementPanelDefaults };

const fallbackEditorSettings: Defaults = {
	defaultSectionsExpanded: {
		settings: [ 'Content', 'Settings' ],
		style: [],
	},
	defaultTab: 'settings',
};

const elementPanelDefaults: Record< string, Defaults > = {
	'e-div-block': {
		defaultSectionsExpanded: fallbackEditorSettings.defaultSectionsExpanded,
		defaultTab: 'style',
	},
	'e-flexbox': {
		defaultSectionsExpanded: fallbackEditorSettings.defaultSectionsExpanded,
		defaultTab: 'style',
	},
	'e-grid': {
		defaultSectionsExpanded: fallbackEditorSettings.defaultSectionsExpanded,
		defaultTab: 'style',
	},
	'e-divider': {
		defaultSectionsExpanded: fallbackEditorSettings.defaultSectionsExpanded,
		defaultTab: 'style',
	},
};

export function registerElementPanelDefaults( type: string, defaults: Defaults ): void {
	elementPanelDefaults[ type ] = defaults;
}

export const useDefaultPanelSettings = () => {
	const { element } = useElement();
	return elementPanelDefaults[ element.type ] ?? fallbackEditorSettings;
};
