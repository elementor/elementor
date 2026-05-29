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
