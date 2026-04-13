import { injectIntoLogic } from '@elementor/editor';
import { __registerPanel as registerPanel } from '@elementor/editor-panels';
import { blockCommand } from '@elementor/editor-v1-adapters';

import { AtomicDocumentPanelHooks } from './components/atomic-document-panel-hooks';
import { EditingPanelHooks } from './components/editing-panel-hooks';
import { init as initPromotionsSections } from './components/promotions/init';
import { registerElementControls } from './controls-registry/element-controls/registry';
import { init as initDynamics } from './dynamics/init';
import { panel } from './panel';
import { atomicDocumentPanel } from './panel-atomic-document';
import { initResetStyleProps } from './reset-style-props';
import { init as initStylesInheritance } from './styles-inheritance/init';
import { isAtomicDocumentOpen } from './sync/is-atomic-document-open';
import { isAtomicWidgetSelected } from './sync/is-atomic-widget-selected';

export function init() {
	registerPanel( panel );
	registerPanel( atomicDocumentPanel );
	blockV1Panel();
	blockV1DocumentPanel();

	injectIntoLogic( {
		id: 'editing-panel-hooks',
		component: EditingPanelHooks,
	} );

	injectIntoLogic( {
		id: 'atomic-document-panel-hooks',
		component: AtomicDocumentPanelHooks,
	} );

	// TODO: Move it from here once we have dynamic package.
	initDynamics();

	// TODO: Move it from here once we have styles-inheritance package.
	initStylesInheritance();

	// TODO: Move it from here once we have element-controls package.
	registerElementControls();

	initResetStyleProps();

	initPromotionsSections();
}

const blockV1Panel = () => {
	blockCommand( {
		command: 'panel/editor/open',
		condition: isAtomicWidgetSelected,
	} );
};

const blockV1DocumentPanel = () => {
	blockCommand( {
		command: 'panel/page-settings/style',
		condition: isAtomicDocumentOpen,
	} );
};
