import { type V1ElementData } from '@elementor/editor-elements';

export const ELEMENT_ADDED_EVENT = 'elementor/canvas/element-added';

export type ElementAddedEvent = {
	element: V1ElementData;
	executedBy: 'mcp_tool' | 'user';
};
