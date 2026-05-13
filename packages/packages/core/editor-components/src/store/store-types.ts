import { type V1Document } from '@elementor/editor-documents';

import {
	type Component,
	type ComponentId,
	type PublishedComponent,
	type StylesDefinition,
	type UnpublishedComponent,
} from '../types';

export type SanitizeAttributes = 'overridableProps';

export type ComponentsState = {
	data: PublishedComponent[];
	unpublishedData: UnpublishedComponent[];
	loadStatus: 'idle' | 'pending' | 'error';
	styles: StylesDefinition;
	createdThisSession: Component[ 'uid' ][];
	archivedThisSession: ComponentId[];
	path: ComponentsPathItem[];
	currentComponentId: V1Document[ 'id' ] | null;
	updatedComponentNames: Record< number, string >;

	// We use this map to flag any sanitized attribute of a given component
	// This map currently resets in response to the `editor/documents/open` command
	sanitized: Record< ComponentId, Partial< Record< SanitizeAttributes, boolean > > >;
};

export type ComponentsPathItem = {
	instanceId?: string;
	instanceTitle?: string;
	componentId: V1Document[ 'id' ];
};

export const initialState: ComponentsState = {
	data: [],
	unpublishedData: [],
	loadStatus: 'idle',
	styles: {},
	createdThisSession: [],
	archivedThisSession: [],
	path: [],
	currentComponentId: null,
	updatedComponentNames: {},
	sanitized: {},
};

export const SLICE_NAME = 'components';
