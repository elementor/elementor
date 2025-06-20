import * as React from 'react';
import {
	type BreakpointId,
	useActivateBreakpoint,
	useActiveBreakpoint,
	useBreakpoints,
} from '@elementor/editor-responsive';
import {
	DesktopIcon,
	LaptopIcon,
	MobileLandscapeIcon,
	MobilePortraitIcon,
	TabletLandscapeIcon,
	TabletPortraitIcon,
	WidescreenIcon,
} from '@elementor/icons';
import { Tab, Tabs, Tooltip as BaseTooltip, type TooltipProps } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type ExtendedWindow } from '../../../types';

export default function BreakpointsSwitcher() {
	const breakpoints = useBreakpoints();
	const activeBreakpoint = useActiveBreakpoint();
	const activateBreakpoint = useActivateBreakpoint();

	if ( ! breakpoints.length || ! activeBreakpoint ) {
		return null;
	}

	const onChange = ( _: unknown, value: BreakpointId ) => {
		const extendedWindow = window as unknown as ExtendedWindow;
		const config = extendedWindow?.elementor?.editorEvents?.config;

		if ( config ) {
			extendedWindow.elementor.editorEvents.dispatchEvent( config.names.topBar.responsiveControls, {
				location: config.locations.topBar,
				secondaryLocation: config.secondaryLocations.responsiveControls,
				trigger: config.triggers.click,
				element: config.elements.buttonIcon,
				mode: value,
			} );
		}

		activateBreakpoint( value );
	};

	return (
		<Tabs
			textColor="inherit"
			indicatorColor="secondary"
			value={ activeBreakpoint }
			onChange={ onChange }
			aria-label={ __( 'Switch Device', 'elementor' ) }
			sx={ {
				'& .MuiTabs-indicator': {
					backgroundColor: 'text.primary',
				},
			} }
		>
			{ breakpoints.map( ( { id, label, type, width } ) => {
				const Icon = iconsMap[ id ];

				const title = labelsMap[ type || 'default' ]
					.replace( '%s', label )
					.replace( '%d', width?.toString() || '' );

				return (
					<Tab
						value={ id }
						key={ id }
						aria-label={ title }
						icon={
							<Tooltip title={ title }>
								<Icon />
							</Tooltip>
						}
						sx={ { minWidth: 'auto' } }
						data-testid={ `switch-device-to-${ id }` }
					/>
				);
			} ) }
		</Tabs>
	);
}

function Tooltip( props: TooltipProps ) {
	return (
		<BaseTooltip
			PopperProps={ {
				sx: {
					'&.MuiTooltip-popper .MuiTooltip-tooltip.MuiTooltip-tooltipPlacementBottom': {
						mt: 2.5,
					},
				},
			} }
			{ ...props }
		/>
	);
}

const iconsMap = {
	widescreen: WidescreenIcon,
	desktop: DesktopIcon,
	laptop: LaptopIcon,
	tablet_extra: TabletLandscapeIcon,
	tablet: TabletPortraitIcon,
	mobile_extra: MobileLandscapeIcon,
	mobile: MobilePortraitIcon,
};

const labelsMap = {
	default: '%s',
	// translators: %s: Breakpoint label, %d: Breakpoint size.
	'min-width': __( '%s (%dpx and up)', 'elementor' ),

	// translators: %s: Breakpoint label, %d: Breakpoint size.
	'max-width': __( '%s (up to %dpx)', 'elementor' ),
} as const;
