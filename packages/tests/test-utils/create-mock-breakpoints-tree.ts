import type { BreakpointNode } from '@elementor/editor-responsive';

export const createMockBreakpointsTree = (): BreakpointNode => ( {
	id: 'desktop',
	label: 'Desktop',
	children: [
		{
			id: 'tablet',
			label: 'Tablet',
			children: [ { id: 'mobile', label: 'Mobile', children: [] } ],
		},
	],
} );
