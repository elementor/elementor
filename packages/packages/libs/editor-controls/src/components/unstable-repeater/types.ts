import { type PropKey, type PropTypeUtil, type PropValue, type TransformablePropValue } from '@elementor/editor-props';

export type CollectionPropUtil< T > = PropTypeUtil< PropKey, T[] >;

export type Item< T > = {
	disabled?: boolean;
} & T;

export type RepeatablePropValue = TransformablePropValue< PropKey, PropValue >;

export type ItemProps< T > = {
	Label: React.ComponentType< { value: T } >;
	Icon: React.ComponentType< { value: T } >;
	value?: Item< T >;
	index?: number;
};
