declare function useBreakpoints(): Breakpoint[];

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

declare function useActiveBreakpoint(): BreakpointId | null;

declare function useActivateBreakpoint(): (breakpoint: BreakpointId) => Promise<any>;

declare function useBreakpointsMap(): BreakpointsMap;

declare function getBreakpoints(): Breakpoint[];

declare function getBreakpointsTree(): BreakpointNode;

export { type Breakpoint, type BreakpointId, type BreakpointNode, type BreakpointSize, type BreakpointsMap, getBreakpoints, getBreakpointsTree, useActivateBreakpoint, useActiveBreakpoint, useBreakpoints, useBreakpointsMap };
