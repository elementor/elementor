import * as React from 'react';
import { ControlActionsProvider, ControlReplacementsProvider } from '@elementor/editor-controls';
import { useSelectedElement } from '@elementor/editor-elements';
import { Panel, PanelBody, PanelHeader, PanelHeaderTitle } from '@elementor/editor-panels';
import { ThemeProvider } from '@elementor/editor-ui';
import { AtomIcon } from '@elementor/icons';
import { createLocation } from '@elementor/locations';
import { SessionStorageProvider } from '@elementor/session';
import { ErrorBoundary } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ElementProvider } from '../contexts/element-context';
import { getControlReplacements } from '../control-replacement';
import { controlActionsMenu } from '../controls-actions';
import { getEditingPanelReplacement } from '../editing-panel-replacement-registry';
import { EditorPanelErrorFallback } from './editing-panel-error-fallback';
import { EditingPanelTabs } from './editing-panel-tabs';

export const { Slot: PanelHeaderTopSlot, inject: injectIntoPanelHeaderTop } = createLocation();

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

	const { component: ReplacementComponent } = getEditingPanelReplacement( element, elementType ) ?? {};

	return (
		<ErrorBoundary fallback={ <EditorPanelErrorFallback /> }>
			<SessionStorageProvider prefix={ 'elementor' }>
				<ThemeProvider>
					<ControlActionsProvider items={ menuItems }>
						<ControlReplacementsProvider replacements={ controlReplacements }>
							<ElementProvider element={ element } elementType={ elementType }>
								<Panel>
									<PanelHeaderTopSlot />
									{ ReplacementComponent ? (
										<ReplacementComponent />
									) : (
										<>
											<PanelHeader>
												<PanelHeaderTitle>{ panelTitle }</PanelHeaderTitle>
												<AtomIcon fontSize="small" sx={ { color: 'text.tertiary' } } />
											</PanelHeader>
											<PanelBody>
												<EditingPanelTabs />
											</PanelBody>
										</>
									) }
								</Panel>
							</ElementProvider>
						</ControlReplacementsProvider>
					</ControlActionsProvider>
				</ThemeProvider>
			</SessionStorageProvider>
		</ErrorBoundary>
	);
};
