import { createContext, useContext } from 'react';

import { useElement } from '../contexts/element-context';

type Defaults = {
	defaultSectionsExpanded: Record< string, string[] >;
	defaultTab: string;
};

const fallbackEditorSettings: Defaults = {
	defaultSectionsExpanded: {
		settings: [ 'Content', 'Settings' ],
		style: [],
	},
	defaultTab: 'settings',
};

const defaultPanelSettingsContext = createContext< Record< string, Defaults | undefined > >( {
	'e-div-block': {
		defaultSectionsExpanded: fallbackEditorSettings.defaultSectionsExpanded,
		defaultTab: 'style',
	},
	'e-flexbox': {
		defaultSectionsExpanded: fallbackEditorSettings.defaultSectionsExpanded,
		defaultTab: 'style',
	},
	'e-divider': {
		defaultSectionsExpanded: fallbackEditorSettings.defaultSectionsExpanded,
		defaultTab: 'style',
	},
} );

export const useDefaultPanelSettings = () => {
	const { element } = useElement();
	const defaults = useContext( defaultPanelSettingsContext )[ element.type ];
	return defaults || fallbackEditorSettings;
};
