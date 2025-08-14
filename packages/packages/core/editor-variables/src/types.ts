import type * as React from 'react';
import { type PropValue } from '@elementor/editor-props';
import { type VirtualizedItem } from '@elementor/editor-ui';

type BaseVariable = {
	label: string;
	value: PropValue;
};

export type Variable = BaseVariable & {
	type: string;
	deleted?: boolean;
	deleted_at?: string;
};

export type VariablesList = Record< string, Variable >;

export type NormalizedVariable = BaseVariable & {
	key: string;
};

export type VariableWithoutType = Omit< Variable, 'type' >;

// export type Variable = {
// 	key?: string;
// 	label: string;
// 	value: string;
// 	type: string;
// 	deleted?: boolean;
// 	deleted_at?: string;
// };

export type TVariable = {
	type: string;
	label: string;
	value: string;
	deleted?: boolean;
	deleted_at?: string;
};

export type TVariablesList = Record< string, TVariable >;

export type ExtendedVirtualizedItem = VirtualizedItem< 'item', string > & {
	icon: React.ReactNode;
	secondaryText: string;
	onEdit?: () => void;
};
