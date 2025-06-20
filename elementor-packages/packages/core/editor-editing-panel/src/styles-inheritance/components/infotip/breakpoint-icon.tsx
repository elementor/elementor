import * as React from 'react';
import { type BreakpointId, useBreakpoints } from '@elementor/editor-responsive';
import {
	DesktopIcon,
	LaptopIcon,
	MobileLandscapeIcon,
	MobilePortraitIcon,
	TabletLandscapeIcon,
	TabletPortraitIcon,
	WidescreenIcon,
} from '@elementor/icons';
import { Tooltip } from '@elementor/ui';

type Props = {
	breakpoint?: BreakpointId | null;
};

const SIZE = 'tiny';
const DEFAULT_BREAKPOINT = 'desktop';

const breakpointIconMap: Record< string, React.ElementType > = {
	widescreen: WidescreenIcon,
	desktop: DesktopIcon,
	laptop: LaptopIcon,
	tablet_extra: TabletLandscapeIcon,
	tablet: TabletPortraitIcon,
	mobile_extra: MobileLandscapeIcon,
	mobile: MobilePortraitIcon,
};

export const BreakpointIcon = ( { breakpoint }: Props ) => {
	const breakpoints = useBreakpoints();
	const currentBreakpoint = breakpoint || DEFAULT_BREAKPOINT;
	const IconComponent = breakpointIconMap[ currentBreakpoint ];

	if ( ! IconComponent ) {
		return null;
	}

	const breakpointLabel = breakpoints.find( ( breakpointItem ) => breakpointItem.id === currentBreakpoint )?.label;

	return (
		<Tooltip title={ breakpointLabel } placement="top">
			<IconComponent fontSize={ SIZE } sx={ { mt: '2px' } } />
		</Tooltip>
	);
};
