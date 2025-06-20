import type * as React from 'react';
import { type VirtualizedItem } from '@elementor/editor-ui';

export type Variable = {
	key?: string;
	label: string;
	value: string;
	type: string;
	deleted?: boolean;
	deleted_at?: string;
};

export type StyleVariables = Record< string, string >;

export type ExtendedVirtualizedItem = VirtualizedItem< 'item', string > & {
	icon: React.ReactNode;
	secondaryText: string;
	onEdit?: () => void;
};
