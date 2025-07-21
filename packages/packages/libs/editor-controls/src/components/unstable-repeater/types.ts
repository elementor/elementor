import { type PropKey, type PropTypeUtil } from '@elementor/editor-props';

type AnchorEl = HTMLElement | null;

type Item< T > = {
	disabled?: boolean;
} & T;
export type CollectionPropUtil< T > = PropTypeUtil< PropKey, T[] >;

type RepeaterItemContentProps< T > = {
	anchorEl: AnchorEl;
	bind: PropKey;
	value: T;
	collectionPropUtil?: CollectionPropUtil< T >;
};

type RepeaterItemContent< T > = React.ComponentType< RepeaterItemContentProps< T > >;

type RepeaterProps< T > = {
	label: string;
	values?: T[];
	addToBottom?: boolean;
	openOnAdd?: boolean;
	setValues: ( newValue: T[] ) => void;
	disabled?: boolean;
	itemSettings: {
		initialValues: T;
		Label: React.ComponentType< { value: T } >;
		Icon: React.ComponentType< { value: T } >;
		Content: RepeaterItemContent< T >;
	};
	showDuplicate?: boolean;
	showToggle?: boolean;
	isSortable?: boolean;
	collectionPropUtil?: CollectionPropUtil< T >;
};

export type ItemProps< T > = {
	Label: React.ComponentType< { value: T } >;
	Icon: React.ComponentType< { value: T } >;
	Content: RepeaterItemContent< T >;
	value?: T;
	key?: string | number;
};

const EMPTY_OPEN_ITEM = -1;
