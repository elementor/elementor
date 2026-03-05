import * as React from 'react';
import { usePanelActions as useEditingPanelActions } from '@elementor/editor-editing-panel';
import { __createPanel as createPanel, Panel } from '@elementor/editor-panels';
import { ThemeProvider } from '@elementor/editor-ui';
import { Alert, Box, ErrorBoundary } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ComponentPropertiesPanelContent } from './component-properties-panel-content';

const id = 'component-properties-panel';

export const { panel, usePanelActions } = createPanel( {
	id,
	component: ComponentPropertiesPanel,
} );

function ComponentPropertiesPanel() {
	const { close: closePanel } = usePanelActions();
	const { open: openEditingPanel } = useEditingPanelActions();

	return (
		<ThemeProvider>
			<ErrorBoundary fallback={ <ErrorBoundaryFallback /> }>
				<Panel>
					<ComponentPropertiesPanelContent
						onClose={ () => {
							closePanel();
							openEditingPanel();
						} }
					/>
				</Panel>
			</ErrorBoundary>
		</ThemeProvider>
	);
}

const ErrorBoundaryFallback = () => (
	<Box role="alert" sx={ { minHeight: '100%', p: 2 } }>
		<Alert severity="error" sx={ { mb: 2, maxWidth: 400, textAlign: 'center' } }>
			<strong>{ __( 'Something went wrong', 'elementor' ) }</strong>
		</Alert>
	</Box>
);
