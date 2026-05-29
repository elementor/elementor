import { createLocation } from '@elementor/locations';

import { type FloatingPanelDeclaration } from './types';

export const { inject: injectIntoFloatingPanels, useInjections: useFloatingPanelsInjections } =
	createLocation< Pick< FloatingPanelDeclaration, 'id' | 'component' | 'icon' | 'title' > >();
