import * as React from 'react';
import { useEffect } from 'react';
import { bootAngieSdk, EDITOR_ANGIE_CONTAINER_ID } from '@elementor/editor-angie';
import { FloatingPanelBody, FloatingPanelHeader } from '@elementor/editor-floating-panels';

import { ANGIE_PANEL_ID } from '../constants';

export default function AngiePanel() {
	useEffect( () => {
		void bootAngieSdk().catch( ( error ) => {
			// eslint-disable-next-line no-console
			console.error( 'Angie SDK boot failed:', error );
		} );
	}, [] );

	return (
		<>
			<FloatingPanelHeader panelId={ ANGIE_PANEL_ID } title="Angie" />
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
