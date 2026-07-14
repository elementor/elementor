import { DEFAULT_MAX_TOOLBAR_ACTIONS, type MaxToolbarActions, MIN_APP_BAR_WIDTH } from '../constants';

// Breakpoints are checked from the widest to the narrowest, so items in the left ("tools") and
// right ("utilities") sections of the app bar collapse into their "More" popover as the app bar
// narrows, freeing up space for the center section (document title, breakpoints switcher).
//
// The utilities section also holds the primary action (e.g. "Publish"), which has a fixed
// minimum width and can't shrink, so it gets fewer inline items than tools at the same width.
const BREAKPOINTS: Array< { minWidth: number } & MaxToolbarActions > = [
	{ minWidth: 1200, ...DEFAULT_MAX_TOOLBAR_ACTIONS },
	{ minWidth: 950, tools: 3, utilities: 2 },
	{ minWidth: MIN_APP_BAR_WIDTH, tools: 1, utilities: 0 },
	{ minWidth: 0, tools: 0, utilities: 0 },
];

export function getMaxToolbarActions( containerWidth: number ): MaxToolbarActions {
	// Avoid collapsing the toolbar before its width has been measured.
	if ( ! containerWidth ) {
		return DEFAULT_MAX_TOOLBAR_ACTIONS;
	}

	const breakpoint = BREAKPOINTS.find( ( { minWidth } ) => containerWidth >= minWidth ) ?? BREAKPOINTS.at( -1 );

	return { tools: breakpoint?.tools ?? 0, utilities: breakpoint?.utilities ?? 0 };
}
