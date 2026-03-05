type BreakpointId = 'widescreen' | 'desktop' | 'laptop' | 'tablet_extra' | 'tablet' | 'mobile_extra' | 'mobile';
type BreakpointSize = number;
type BreakpointLabel = string;
type Breakpoint = {
	id: BreakpointId;
	label: BreakpointLabel;
	width?: BreakpointSize;
	type?: 'min-width' | 'max-width';
};
type BreakpointsMap = Record<BreakpointId, Breakpoint>;
type BreakpointNode = Breakpoint & {
	children: BreakpointNode[];
};
type V1Breakpoint = {
	direction: 'min' | 'max';
	is_enabled: boolean;
	value: BreakpointSize;
	label: BreakpointLabel;
};
type V1Breakpoints = Record<Exclude<BreakpointId, 'desktop'>, V1Breakpoint>;
type ExtendedWindow = Window & {
	elementor?: {
		config?: {
			responsive?: {
				breakpoints?: V1Breakpoints;
			};
		};
		channels?: {
			deviceMode?: {
				request?: (request: 'currentMode') => BreakpointId;
			};
		};
	};
};

declare function useActivateBreakpoint(): (breakpoint: BreakpointId) => Promise<any>;

declare function useActiveBreakpoint(): BreakpointId | null;

declare function useBreakpoints(): Breakpoint[];

declare function useBreakpointsMap(): BreakpointsMap;

declare function getBreakpoints(): Breakpoint[];

declare function getBreakpointsTree(): BreakpointNode;

export {
	type Breakpoint,
	type BreakpointId,
	type BreakpointNode,
	type BreakpointSize,
	type BreakpointsMap,
	type ExtendedWindow,
	getBreakpoints,
	getBreakpointsTree,
	useActivateBreakpoint,
	useActiveBreakpoint,
	useBreakpoints,
	useBreakpointsMap,
};
