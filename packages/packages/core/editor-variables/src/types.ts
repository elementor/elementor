import type * as React from 'react';
import { type StyleVariables, type Variable } from '@elementor/editor-styles';
import { type VirtualizedItem } from '@elementor/editor-ui';

export type { StyleVariables, Variable };

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
