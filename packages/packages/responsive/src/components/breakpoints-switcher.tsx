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
} from '../icons';

export default function BreakpointsSwitcher() {
	const { all, active, activate } = useBreakpoints();

	if ( ! all.length || ! active ) {
		return null;
	}

	const onChange = ( e: unknown, value: BreakpointId ) => activate( value );

	return (
		<Tabs value={ active.id } onChange={ onChange } sx={ {
			'& .MuiTabs-flexContainer': {
				gap: 0,
			},
		} }>
			{
				all.map( ( { id, type, size } ) => {
					const { label, icon: Icon } = breakpointsUiMap[ id ];

					const title = labelsMap[ type ?? 'default' ]
						.replace( '%s', label )
						.replace( '%d', size?.toString() ?? '' );

					return (
						<Tab value={ id }
							key={ id }
							aria-label={ title }
							sx={ { padding: '4px' } }
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
const breakpointsUiMap = {
	widescreen: {
		icon: WidescreenIcon,
		label: __( 'Widescreen', 'elementor' ),
	},
	desktop: {
		icon: DesktopIcon,
		label: __( 'Desktop', 'elementor' ),
	},
	laptop: {
		icon: LaptopIcon,
		label: __( 'Laptop', 'elementor' ),
	},
	tablet_extra: {
		icon: TabletLandscapeIcon,
		label: __( 'Tablet Landscape', 'elementor' ),
	},
	tablet: {
		icon: TabletPortraitIcon,
		label: __( 'Tablet Portrait', 'elementor' ),
	},
	mobile_extra: {
		icon: MobileLandscapeIcon,
		label: __( 'Mobile Landscape', 'elementor' ),
	},
	mobile: {
		icon: MobilePortraitIcon,
		label: __( 'Mobile Portrait', 'elementor' ),
	},
};

const labelsMap = {
	default: '%s',
	// translators: %s: Breakpoint label, %d: Breakpoint size.
	from: __( '%s (%dpx and up)', 'elementor' ),

	// translators: %s: Breakpoint label, %d: Breakpoint size.
	'up-to': __( '%s (up to %dpx)', 'elementor' ),
} as const;
