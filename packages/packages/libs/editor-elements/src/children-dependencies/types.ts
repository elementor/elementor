import { type Dependency } from '@elementor/editor-props';

import { type ElementPosition, type V1ElementData } from '../sync/types';

export type ChildDependencyRule = {
	child_type: string;
	when: Dependency;
	position: ElementPosition;
	stash: boolean;
	default_model: V1ElementData | null;
};

export type ChildDependenciesConfig = ChildDependencyRule[];

export type ChildrenStash = {
	get: ( elementId: string, childType: string ) => V1ElementData | undefined;
	save: ( elementId: string, childType: string, data: V1ElementData ) => void;
	clear: ( elementId: string, childType: string ) => void;
	clearAllForElement: ( elementId: string ) => void;
};
