import type * as React from 'react';

export type ElementOverlayProps = {
	element: HTMLElement;
	id: string;
	isSelected: boolean;
	isGlobal?: boolean;
	widgetType?: string;
};

export type OverlayFilterArgs = {
	id: string;
	element: HTMLElement;
	isSelected: boolean;
	widgetType?: string;
};

export type ElementOverlayConfig = {
	component: React.ComponentType< ElementOverlayProps >;
	shouldRender: ( args: OverlayFilterArgs ) => boolean;
};
