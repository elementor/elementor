import { type ComponentType } from 'react';

export type DockMode = 'docked' | 'floating';

export type LogicalPosition = {
	insetInlineStart: number;
	insetBlockStart: number;
};

export type LogicalSize = {
	inlineSize: number;
	blockSize: number;
};

/**
 * Public API for declaring a floating panel's initial dimensions.
 *
 * Sizes use physical names (width/height) intentionally — Elementor renders
 * in horizontal writing mode only, so these are equivalent to logical
 * inline-size/block-size. Positioning continues to use logical names
 * because position is genuinely direction-sensitive.
 *
 * If multi-writing-mode support is ever needed, replace these fields with
 * `size: LogicalSize` and `minSize: LogicalSize` and update the store's
 * register reducer.
 */
export type FloatingPanelDefaults = {
	width: number;
	height: number;
	minWidth: number;
	minHeight: number;
	initialMode: DockMode;
	initialPosition?: LogicalPosition;
};

export type FloatingPanelDeclaration = {
	id: string;
	title: string;
	icon: ComponentType;
	component: ComponentType;
	defaults: FloatingPanelDefaults;
};

export type FloatingPanelState = {
	isOpen: boolean;
	mode: DockMode;
	position: LogicalPosition;
	size: LogicalSize;
	zIndex: number;
};
