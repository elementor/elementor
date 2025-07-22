import { type PropKey, type PropTypeUtil } from '@elementor/editor-props';

export type CollectionPropUtil< T > = PropTypeUtil< PropKey, T[] >;

type Item< T > = {
	disabled?: boolean;
} & T;

type RepeaterItemContentProps< T > = {
	anchorEl: HTMLElement | null;
	bind: PropKey;
	value: T;
	collectionPropUtil?: CollectionPropUtil< T >;
};

type RepeaterItemContent< T > = React.ComponentType< RepeaterItemContentProps< T > >;

export type ItemProps< T > = {
	Label: React.ComponentType< { value: T } >;
	Icon: React.ComponentType< { value: T } >;
	Content: RepeaterItemContent< T >;
	value?: Item< T >;
	key?: string | number;
	index?: number;
	openOnMount?: boolean;
};
