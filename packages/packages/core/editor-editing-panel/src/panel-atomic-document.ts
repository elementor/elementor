import { __createPanel as createPanel } from '@elementor/editor-panels';

import { AtomicDocumentPanel } from './components/atomic-document-panel';

/**
 * Separate React panel for atomic document settings (Header V4, Footer V4, etc.).
 *
 * This panel is opened when the user clicks the document gear icon and the active
 * document has `elementor.config.document.panel.atomic === true`. It replaces the
 * legacy Backbone Settings/Style/Advanced tabs with a v4 atomic controls panel.
 *
 * Usage:
 *   const { open } = useAtomicDocumentPanelActions();
 *   open(); // opens the panel
 */
export const {
	panel: atomicDocumentPanel,
	usePanelActions: useAtomicDocumentPanelActions,
	usePanelStatus: useAtomicDocumentPanelStatus,
} = createPanel( {
	id: 'atomic-document-panel',
	component: AtomicDocumentPanel,
} );
