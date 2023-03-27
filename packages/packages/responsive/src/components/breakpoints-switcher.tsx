import { __ } from '@wordpress/i18n';
import { BreakpointId } from '../types';
import useBreakpoints from '../hooks/use-breakpoints';
import { Tab, Tabs, Tooltip as BaseTooltip, TooltipProps } from '@elementor/ui';
import {
	DesktopIcon,
	TabletPortraitIcon,
	MobilePortraitIcon,
	WidescreenIcon,
	LaptopIcon,
	TabletLandscapeIcon,
	MobileLandscapeIcon,
} from '@elementor/icons';
import useBreakpointsActions from '../hooks/use-breakpoints-actions';

export default function BreakpointsSwitcher() {
	const { all, active } = useBreakpoints();
	const { activate } = useBreakpointsActions();

	if ( ! all.length || ! active ) {
		return null;
	}

	const onChange = ( _: unknown, value: BreakpointId ) => activate( value );

	return (
		<Tabs value={ active.id } onChange={ onChange } aria-label={ __( 'Switch Device', 'elementor' ) }>
			{
				all.map( ( { id, label, type, width } ) => {
					const Icon = iconsMap[ id ];

					const title = labelsMap[ type || 'default' ]
						.replace( '%s', label )
						.replace( '%d', width?.toString() || '' );

					return (
						<Tab value={ id }
							key={ id }
							aria-label={ title }
							icon={ <Tooltip title={ title }><Icon /></Tooltip> }
						/>
					);
				} )
			}
		</Tabs>

	);
}

function Tooltip( props: TooltipProps ) {
	return <BaseTooltip
		PopperProps={ {
			sx: {
				'&.MuiTooltip-popper .MuiTooltip-tooltip.MuiTooltip-tooltipPlacementBottom': {
					mt: 7,
				},
			},
		} }
		{ ...props }
	/>;
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
