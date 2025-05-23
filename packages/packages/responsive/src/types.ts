import type { createSlice } from './store';

export type BreakpointId = 'widescreen' | 'desktop' | 'laptop' | 'tablet_extra' | 'tablet' | 'mobile_extra' | 'mobile';

export type BreakpointSize = number;

export type BreakpointLabel = string;

export type Breakpoint = {
	id: BreakpointId,
	label: BreakpointLabel,
	width?: BreakpointSize,
	type?: 'min-width' | 'max-width',
}

export type Slice = ReturnType<typeof createSlice>;

export type ExtendedWindow = Window & {
	elementor: {
		config: {
			responsive: {
				breakpoints: Record<Exclude<BreakpointId, 'desktop'>, {
					direction: 'min' | 'max',
					is_enabled: boolean,
					value: BreakpointSize,
					label: BreakpointLabel,
				}>
			}
		},
		channels: {
			deviceMode: {
				request: ( request: 'currentMode' ) => BreakpointId,
			}
		}
	}
}
