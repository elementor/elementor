import * as React from 'react';
import { ControlActionsProvider, ControlReplacementsProvider } from '@elementor/editor-controls';
import { useSelectedElement } from '@elementor/editor-elements';
import { Panel, PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { ThemeProvider } from '@elementor/editor-ui';
import { AtomIcon } from '@elementor/icons';
import { SessionStorageProvider } from '@elementor/session';
import { ErrorBoundary } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ElementProvider } from '../contexts/element-context';
import { getControlReplacements } from '../control-replacement';
import { controlActionsMenu } from '../controls-actions';
import { EditorPanelErrorFallback } from './editing-panel-error-fallback';
import { EditingPanelTabs } from './editing-panel-tabs';

const { useMenuItems } = controlActionsMenu;

export const EditingPanel = () => {
	const { element, elementType } = useSelectedElement();
	const controlReplacements = getControlReplacements();
	const menuItems = useMenuItems().default;

	if ( ! element || ! elementType ) {
		return null;
	}

	/* translators: %s: Element type title. */
	const panelTitle = __( 'Edit %s', 'elementor' ).replace( '%s', elementType.title );

	return (
		<ErrorBoundary fallback={ <EditorPanelErrorFallback /> }>
			<SessionStorageProvider prefix={ 'elementor' }>
				<ThemeProvider>
					<Panel>
						<PanelHeader>
							<PanelHeaderTitle>{ panelTitle }</PanelHeaderTitle>
							<AtomIcon fontSize="small" sx={ { color: 'text.tertiary' } } />
						</PanelHeader>
						<PanelBody>
							<ControlActionsProvider items={ menuItems }>
								<ControlReplacementsProvider replacements={ controlReplacements }>
									<ElementProvider element={ element } elementType={ elementType }>
										<EditingPanelTabs />
									</ElementProvider>
								</ControlReplacementsProvider>
							</ControlActionsProvider>
						</PanelBody>
					</Panel>
				</ThemeProvider>
			</SessionStorageProvider>
		</ErrorBoundary>
	);
};
