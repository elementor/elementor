import type * as React from 'react';
import { type VirtualizedItem } from '@elementor/editor-ui';

export type Variable = {
	key?: string;
	label: string;
	value: string;
	type: string;
	deleted?: boolean;
	deleted_at?: string;
	sync_to_v3?: boolean;
};

export type StyleVariables = Record< string, Variable >;

export type ExtendedVirtualizedItem = VirtualizedItem< 'item', string > & {
	icon: React.ReactNode;
	secondaryText: string;
	onEdit?: () => void;
};

export type NormalizedVariable = {
	key: string;
	label: string;
	value: string;
	order?: number;
	sync_to_v3?: boolean;
};
