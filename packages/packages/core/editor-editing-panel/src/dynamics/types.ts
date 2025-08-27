import { type ControlItem } from '@elementor/editor-elements';
import { type PropsSchema, type TransformablePropType, type TransformablePropValue } from '@elementor/editor-props';

export type ExtendedWindow = Window & {
	elementor?: {
		config?: {
			atomicDynamicTags?: {
				tags: DynamicTags;
				groups: Record< DynamicTag[ 'group' ], { title: string } >;
			};
		};
		dynamicTags?: DynamicTagsManager;
	};
};

export type DynamicTags = Record< DynamicTag[ 'name' ], DynamicTag >;

export type DynamicTag = {
	name: string;
	label: string;
	group: string;
	categories: string[];
	atomic_controls: ControlItem[];
	props_schema: PropsSchema;
};

export type DynamicPropType = TransformablePropType & {
	key: 'dynamic';
	settings: {
		categories: string[];
	};
};

export type DynamicPropValue = TransformablePropValue<
	'dynamic',
	{ name: string; settings?: Record< string, unknown > }
>;

export type DynamicTagsManager = {
	createTag: ( id: string, name: string, settings: Record< string, unknown > ) => TagInstance;
	loadTagDataFromCache: ( tag: TagInstance ) => unknown;
	refreshCacheFromServer: ( callback: () => void ) => void;
};

export type TagInstance = {
	options: {
		id: string;
		name: string;
	};
	model: {
		toJSON: () => Record< string, unknown >;
	};
};
