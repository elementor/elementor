import * as React from 'react';
import { useEffect, useState } from 'react';
import {
	__privateRunCommand as runCommand,
	__privateUseRouteStatus as useRouteStatus,
} from '@elementor/editor-v1-adapters';
import { StructureIcon } from '@elementor/icons';
import { Button, Card, CardActions, CardContent, CardHeader, Infotip, Link, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type ExtendedWindow, type ToggleActionProps } from '../../../types';

const extendedWindow = window as unknown as ExtendedWindow;

const StructurePopupContent = ( { onClose }: { onClose: () => void } ) => {
	const handleDismiss = async () => {
		onClose();

		extendedWindow.elementorCommon?.ajax?.addRequest?.( 'structure_popup_dismiss' ).catch( ( error ) => {
			console.error( 'Failed to dismiss structure popup:', error );
		} );
	};

	return (
		<Card elevation={ 0 } sx={ { maxWidth: 300 } }>
			<CardContent>
				<Typography variant="subtitle2" sx={ { mb: 2 } }>
					{ __( 'Refreshed Top Bar layout!', 'elementor' ) }
				</Typography>
				<Typography variant="body2">
					{ __( 'We’ve fine-tuned the Top Bar to make navigation faster and smoother.', 'elementor' ) }
				</Typography>
			</CardContent>
			<CardActions sx={ { pt: 0 } }>
				<Button
					size="small"
					color="secondary"
					href="https://go.elementor.com/editor-top-bar-learn/"
					target="_blank"
				>
					{ __( 'Learn More', 'elementor' ) }
				</Button>
				<Button size="small" variant="contained" onClick={ handleDismiss }>
					{ __( 'Got it', 'elementor' ) }
				</Button>
			</CardActions>
		</Card>
	);
};

const StructureIconWithPopup = () => {
	const [ showPopup, setShowPopup ] = useState( false );

	useEffect( () => {
		if ( extendedWindow.elementorShowInfotip?.shouldShow === '1' ) {
			setShowPopup( true );
		}
	}, [] );

	const handleClosePopup = () => {
		setShowPopup( false );
	};

	if ( extendedWindow.elementorShowInfotip?.shouldShow !== '1' ) {
		return <StructureIcon />;
	}

	return (
		<Infotip
			placement="bottom"
			arrow={ false }
			content={ <StructurePopupContent onClose={ handleClosePopup } /> }
			open={ showPopup }
			PopperProps={ {
				modifiers: [
					{
						name: 'offset',
						options: { offset: [ -16, 12 ] },
					},
				],
			} }
		>
			<StructureIcon />
		</Infotip>
	);
};

export default function useActionProps(): ToggleActionProps {
	const { isActive, isBlocked } = useRouteStatus( 'navigator' );

	return {
		title: __( 'Structure', 'elementor' ),
		icon: StructureIconWithPopup,
		onClick: () => {
			const extendedWindow = window as unknown as ExtendedWindow;
			const config = extendedWindow?.elementorCommon?.eventsManager?.config;

			if ( config ) {
				extendedWindow.elementorCommon.eventsManager.dispatchEvent( config.names.topBar.structure, {
					location: config.locations.topBar,
					secondaryLocation: config.secondaryLocations.structure,
					trigger: config.triggers.toggleClick,
					element: config.elements.buttonIcon,
				} );
			}

			runCommand( 'navigator/toggle' );
		},
		selected: isActive,
		disabled: isBlocked,
	};
}
