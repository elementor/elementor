import * as React from 'react';
import { useEffect, useRef } from 'react';
import { bootAngieSdk, EDITOR_ANGIE_CONTAINER_ID } from '@elementor/editor-angie';
import { FloatingPanelBody, FloatingPanelHeader, useFloatingPanelStatus } from '@elementor/editor-floating-panels';
import { AngieIcon } from '@elementor/icons';

import { ANGIE_PANEL_ID } from '../constants';

export default function AngiePanel() {
	const { isOpen } = useFloatingPanelStatus( ANGIE_PANEL_ID );
	const hasRequestedBoot = useRef( false );

	useEffect( () => {
		if ( ! isOpen || hasRequestedBoot.current ) {
			return;
		}

		void bootAngieSdk()
			.then( () => {
				hasRequestedBoot.current = true;
			} )
			.catch( ( error ) => {
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
