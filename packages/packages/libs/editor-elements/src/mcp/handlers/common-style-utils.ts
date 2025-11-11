import { type BreakpointId } from '@elementor/editor-responsive';

const VALID_BREAKPOINTS: BreakpointId[] = [
	'widescreen',
	'desktop',
	'laptop',
	'tablet_extra',
	'tablet',
	'mobile_extra',
	'mobile',
];

export function resolveBreakpointId( breakpoint: string | null ): BreakpointId | null {
	if ( breakpoint === null ) {
		return null;
	}

	if ( VALID_BREAKPOINTS.includes( breakpoint as BreakpointId ) ) {
		return breakpoint as BreakpointId;
	}

	return 'desktop';
}
