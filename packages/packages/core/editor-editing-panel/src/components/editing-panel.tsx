import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { ControlActionsProvider, ControlReplacementsProvider } from '@elementor/editor-controls';
import { type Element, type ElementType, useSelectedElement } from '@elementor/editor-elements';
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
import {
	getEditingPanelReplacement,
	subscribeToEditingPanelReplacementRegistry,
} from '../editing-panel-replacement-registry';
import { EditorPanelErrorFallback } from './editing-panel-error-fallback';
import { EditingPanelTabs } from './editing-panel-tabs';

export const { Slot: PanelHeaderTopSlot, inject: injectIntoPanelHeaderTop } = createLocation();

const { useMenuItems } = controlActionsMenu;

const useEditingPanelReplacement = ( element: Element | null, elementType: ElementType | null ) => {
	const [ replacement, setReplacement ] = useState( getEditingPanelReplacement( element, elementType ) );

	const recalculateReplacement = useCallback( () => {
		setReplacement( getEditingPanelReplacement( element, elementType ) );
	}, [ element, elementType ] );

	useEffect( () => {
		const unsubscribe = subscribeToEditingPanelReplacementRegistry( recalculateReplacement );

		return () => {
			unsubscribe();
		};
	}, [ recalculateReplacement ] );

	return replacement;
};

export const EditingPanel = () => {
	const { element, elementType } = useSelectedElement();
	const controlReplacements = getControlReplacements();
	const menuItems = useMenuItems().default;
	const replacement = useEditingPanelReplacement( element, elementType );

	if ( ! element || ! elementType ) {
		return null;
	}

	/* translators: %s: Element type title. */
	const panelTitle = __( 'Edit %s', 'elementor' ).replace( '%s', elementType.title );

	let panelContent = (
		<>
			<PanelHeader>
				<PanelHeaderTitle>{ panelTitle }</PanelHeaderTitle>
				<AtomIcon fontSize="small" sx={ { color: 'text.tertiary' } } />
			</PanelHeader>
			<PanelBody>
				<EditingPanelTabs />
			</PanelBody>
		</>
	);

	if ( replacement ) {
		panelContent = <replacement.component />;
	}

	return (
		<ErrorBoundary fallback={ <EditorPanelErrorFallback /> }>
			<SessionStorageProvider prefix={ 'elementor' }>
				<ThemeProvider>
					<ControlActionsProvider items={ menuItems }>
						<ControlReplacementsProvider replacements={ controlReplacements }>
							<ElementProvider element={ element } elementType={ elementType }>
								<Panel>
									<PanelHeaderTopSlot />
									{ panelContent }
								</Panel>
							</ElementProvider>
						</ControlReplacementsProvider>
					</ControlActionsProvider>
				</ThemeProvider>
			</SessionStorageProvider>
		</ErrorBoundary>
	);
};
