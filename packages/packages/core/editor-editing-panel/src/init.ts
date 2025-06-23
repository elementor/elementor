import { injectIntoLogic } from '@elementor/editor';
import { __registerPanel as registerPanel } from '@elementor/editor-panels';
import { blockCommand, isExperimentActive } from '@elementor/editor-v1-adapters';

import { EditingPanelHooks } from './components/editing-panel-hooks';
import { init as initDynamics } from './dynamics/init';
import { panel } from './panel';
import { initResetStyleProps } from './reset-style-props';
import { init as initStylesInheritance } from './styles-inheritance/init';
import { EXPERIMENTAL_FEATURES } from './sync/experiments-flags';
import { isAtomicWidgetSelected } from './sync/is-atomic-widget-selected';

export function init() {
	registerPanel( panel );
	blockV1Panel();

	injectIntoLogic( {
		id: 'editing-panel-hooks',
		component: EditingPanelHooks,
	} );

	// TODO: Move it from here once we have dynamic package.
	initDynamics();

	// TODO: Move it from here once we have styles-inheritance package.
	initStylesInheritance();

	if ( isExperimentActive( EXPERIMENTAL_FEATURES.V_3_30 ) ) {
		initResetStyleProps();
	}
}

const blockV1Panel = () => {
	blockCommand( {
		command: 'panel/editor/open',
		condition: isAtomicWidgetSelected,
	} );
};
