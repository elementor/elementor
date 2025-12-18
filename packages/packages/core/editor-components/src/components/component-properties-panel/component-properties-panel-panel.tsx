import * as React from 'react';
import { ElementProvider, usePanelActions as useEditingPanelActions } from '@elementor/editor-editing-panel';
import { useSelectedElement } from '@elementor/editor-elements';
import { __createPanel as createPanel, Panel } from '@elementor/editor-panels';
import { ThemeProvider } from '@elementor/editor-ui';
import { ErrorBoundary } from '@elementor/ui';

import { ComponentPropertiesPanel } from './component-properties-panel';

const id = 'component-properties-panel';

export const { panel, usePanelActions } = createPanel( {
	id,
	component: ComponentPropertiesPanelPanel,
} );

function ComponentPropertiesPanelPanel() {
	const { element, elementType } = useSelectedElement();
	const { close: closePanel } = usePanelActions();
	const { open: openEditingPanel } = useEditingPanelActions();

	if ( ! element || ! elementType ) {
		return null;
	}

	return (
		<ErrorBoundary fallback={ null }>
			<ThemeProvider>
				<ElementProvider element={ element } elementType={ elementType }>
					<Panel>
						<ComponentPropertiesPanel
							onClose={ () => {
								closePanel();
								openEditingPanel();
							} }
						/>
					</Panel>
				</ElementProvider>
			</ThemeProvider>
		</ErrorBoundary>
	);
}
