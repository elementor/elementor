import { createPanel } from '@elementor/editor-panels';

import { AtomicElementsPanel } from './components/atomic-elements-panel';

export const { panel } = createPanel( {
	id: 'atomic-elements-panel',
	component: AtomicElementsPanel,
	isOpenPreviousElement: true,
} );
