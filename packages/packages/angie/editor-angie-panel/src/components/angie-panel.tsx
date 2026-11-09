import * as React from 'react';
import { useEffect, useRef } from 'react';
import { bootAngieSdk, canUseAngiePluginSidebar, EDITOR_ANGIE_CONTAINER_ID } from '@elementor/editor-angie';
import {
	closeFloatingPanel,
	FloatingPanelBody,
	FloatingPanelHeader,
	useFloatingPanelStatus,
} from '@elementor/editor-floating-panels';
import { AngieIcon } from '@elementor/icons';

import { ANGIE_PANEL_ID } from '../constants';

export default function AngiePanel() {
	const { isOpen } = useFloatingPanelStatus( ANGIE_PANEL_ID );
	const hasRequestedBoot = useRef( false );

	useEffect( () => {
		if ( ! isOpen ) {
			return;
		}

		if ( canUseAngiePluginSidebar() ) {
			// The plugin sidebar hosts Angie, so this panel would stay empty. This happens when `persistOpenState`
			// restores it open on reload; closing it also writes the closed state back to storage.
			closeFloatingPanel( ANGIE_PANEL_ID );
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
