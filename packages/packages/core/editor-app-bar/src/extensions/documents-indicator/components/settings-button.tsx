import * as React from 'react';
import {
	__useActiveDocument as useActiveDocument,
	__useHostDocument as useHostDocument,
} from '@elementor/editor-documents';
import {
	__privateOpenRoute as openRoute,
	__privateUseRouteStatus as useRouteStatus,
} from '@elementor/editor-v1-adapters';
import { SettingsIcon } from '@elementor/icons';
import { Box, ToggleButton, Tooltip as BaseTooltip, type TooltipProps } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type ExtendedWindow } from '../../../types';

export default function SettingsButton() {
	const activeDocument = useActiveDocument();
	const hostDocument = useHostDocument();

	const document = activeDocument && activeDocument.type.value !== 'kit' ? activeDocument : hostDocument;

	const { isActive, isBlocked } = useRouteStatus( 'panel/page-settings' );

	if ( ! document ) {
		return null;
	}

	/* translators: %s: Post type label. */
	const title = __( '%s Settings', 'elementor' ).replace( '%s', document.type.label );

	return (
		<Tooltip title={ title }>
			{ /* @see https://mui.com/material-ui/react-tooltip/#disabled-elements */ }
			<Box component="span" aria-label={ undefined }>
				<ToggleButton
					value="document-settings"
					selected={ isActive }
					disabled={ isBlocked }
					onChange={ () => {
						const extendedWindow = window as unknown as ExtendedWindow;
						const config = extendedWindow?.elementor?.editorEvents?.config;

						if ( config ) {
							extendedWindow.elementor.editorEvents.dispatchEvent( config.names.topBar.documentSettings, {
								location: config.locations.topBar,
								secondaryLocation: config.secondaryLocations[ 'document-settings' ],
								trigger: config.triggers.click,
								element: config.elements.buttonIcon,
							} );
						}

						openRoute( 'panel/page-settings/settings' );
					} }
					aria-label={ title }
					size="small"
					sx={ {
						border: 0, // Temp fix until the style of the ToggleButton component will be decided.
						'&.Mui-disabled': {
							border: 0, // Temp fix until the style of the ToggleButton component will be decided.
						},
					} }
				>
					<SettingsIcon fontSize="small" />
				</ToggleButton>
			</Box>
		</Tooltip>
	);
}

function Tooltip( props: TooltipProps ) {
	return (
		<BaseTooltip
			PopperProps={ {
				sx: {
					'&.MuiTooltip-popper .MuiTooltip-tooltip.MuiTooltip-tooltipPlacementBottom': {
						mt: 1.7,
					},
				},
			} }
			{ ...props }
		/>
	);
}
