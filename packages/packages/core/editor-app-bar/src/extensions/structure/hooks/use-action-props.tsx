import {
	__privateRunCommand as runCommand,
	__privateUseRouteStatus as useRouteStatus,
} from '@elementor/editor-v1-adapters';
import { StructureIcon } from '@elementor/icons';
import { __ } from '@wordpress/i18n';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, CardActions, Button, CardHeader, Link, ThemeProvider } from '@elementor/ui';
import { Infotip } from '@elementor/ui';

import { type ExtendedWindow, type ToggleActionProps } from '../../../types';

// Declare global types for our data
declare global {
	interface Window {
		elementorShowInfotip?: {
			show: string;
		};
		elementorCommon?: {
			ajax?: {
				addRequest: (action: string, options?: any) => Promise<any>;
			};
		};
	}
}

const StructurePopupContent = ({ onClose }: { onClose: () => void }) => {
	const handleDismiss = async () => {
		try {
			// Use Elementor's AJAX system - simple and effective
			await window.elementorCommon?.ajax?.addRequest('structure_popup_dismiss');
			onClose();
		} catch (error) {
			console.error('Failed to dismiss structure popup:', error);
			onClose(); // Close anyway to avoid blocking user
		}
	};

	return (
		<ThemeProvider colorScheme="light">
<Card elevation={ 0 } sx={ { maxWidth: 300 } }>
	<CardHeader title={ __( 'Refreshed Top Bar layout!', 'elementor' ) } />
	<CardContent>
		<Typography variant="body2">{ __( 'The Top Bar layout has been updated to make navigation faster and improve workflows.', 'elementor' ) } <Link color="info.main" href={ __( 'Learn more', 'elementor' ) } target="_blank">{ __( 'Learn more about the changes', 'elementor' ) }</Link></Typography>
	</CardContent>
	<CardActions>
		<Button size="small" variant="contained" onClick={ handleDismiss }>{ __( 'Got it', 'elementor' ) }</Button>
	</CardActions>
</Card>
</ThemeProvider>
	)
		
		
	
};

const StructureIconWithPopup = () => {
	const [showPopup, setShowPopup] = useState(true);

	// useEffect(() => {
	// 	// Check if popup should show - similar to topbar-icon.js logic
	// 	if (window.elementorShowInfotip?.show === '1') {
	// 		// Show popup after a short delay to ensure UI is ready
	// 		const timer = setTimeout(() => {
	// 			setShowPopup(true);
	// 		}, 1500);
			
	// 		return () => clearTimeout(timer);
	// 	}
	// }, []);

	const handleClosePopup = () => {
		setShowPopup(false);
	};

	// If show condition is not met, just return the regular icon
	// if (window.elementorShowInfotip?.show !== '1') {
	// 	return <StructureIcon />;
	// }

	return (
		<ThemeProvider colorScheme="light">
		<Infotip
			placement="bottom"
			content={<StructurePopupContent onClose={handleClosePopup} />}
			open={showPopup}
			PopperProps={{
				modifiers: [
					{
						name: 'offset',
						options: { offset: [-16, 12] },
					},
				],
			}}
		>
			<StructureIcon />
		</Infotip>
		</ThemeProvider>
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
