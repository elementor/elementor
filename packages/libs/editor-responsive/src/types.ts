export type BreakpointId = 'widescreen' | 'desktop' | 'laptop' | 'tablet_extra' | 'tablet' | 'mobile_extra' | 'mobile';

export type BreakpointSize = number;

type BreakpointLabel = string;

export type Breakpoint = {
	id: BreakpointId;
	label: BreakpointLabel;
	width?: BreakpointSize;
	type?: 'min-width' | 'max-width';
};

export type BreakpointsMap = Record< BreakpointId, Breakpoint >;

export type BreakpointNode = Breakpoint & {
	children: BreakpointNode[];
};

type V1Breakpoint = {
	direction: 'min' | 'max';
	is_enabled: boolean;
	value: BreakpointSize;
	label: BreakpointLabel;
};

export type V1Breakpoints = Record< Exclude< BreakpointId, 'desktop' >, V1Breakpoint >;

export type ExtendedWindow = Window & {
	elementor?: {
		config?: {
			responsive?: {
				breakpoints?: V1Breakpoints;
			};
		};
		channels?: {
			deviceMode?: {
				request?: ( request: 'currentMode' ) => BreakpointId;
			};
		};
	};
};
