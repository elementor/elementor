import * as React from 'react';
import { useEffect, useRef } from 'react';
import {
	bootAngieSdk,
	canUseAngiePluginSidebar,
	EDITOR_ANGIE_CONTAINER_ID,
	removeAngieSidebarActiveBodyClass,
} from '@elementor/editor-angie';
import { FloatingPanelBody, FloatingPanelHeader, useFloatingPanelStatus } from '@elementor/editor-floating-panels';
import { AngieIcon } from '@elementor/icons';

import { ANGIE_PANEL_ID } from '../constants';

export default function AngiePanel() {
	const { isOpen } = useFloatingPanelStatus( ANGIE_PANEL_ID );
	const hasRequestedBoot = useRef( false );

	useEffect( () => {
		if ( ! isOpen ) {
			removeAngieSidebarActiveBodyClass();
			return;
		}

		if ( canUseAngiePluginSidebar() ) {
			return;
		}

		if ( hasRequestedBoot.current ) {
			return;
		}

		hasRequestedBoot.current = true;

		void bootAngieSdk().catch( ( error ) => {
			hasRequestedBoot.current = false;
			// eslint-disable-next-line no-console
			console.error( 'Angie SDK boot failed:', error );
		} );
	}, [ isOpen ] );

	return (
		<>
			<FloatingPanelHeader panelId={ ANGIE_PANEL_ID } title="Angie" icon={ AngieIcon } />
			<FloatingPanelBody>
				<div
					id={ EDITOR_ANGIE_CONTAINER_ID }
					role="region"
					aria-label="Angie"
					style={ { height: '100%', width: '100%' } }
				/>
			</FloatingPanelBody>
		</>
	);
}
