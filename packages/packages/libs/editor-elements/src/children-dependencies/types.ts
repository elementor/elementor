import { type Dependency } from '@elementor/editor-props';

import { type V1ElementData } from '../sync/types';

export type ChildPositionKind = 'last' | 'first' | 'index' | 'after_type' | 'before_type';

export type ChildPosition = {
	kind: ChildPositionKind;
	value: number | string | null;
};

export type ChildDependencyRule = {
	child_type: string;
	when: Dependency;
	position: ChildPosition;
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
