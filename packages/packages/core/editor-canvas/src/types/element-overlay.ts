import type * as React from 'react';

export type ElementOverlayProps = {
	element: HTMLElement;
	id: string;
	isSelected: boolean;
};

export type OverlayFilterArgs = {
	id: string;
	element: HTMLElement;
	isSelected: boolean;
};

export type ElementOverlayConfig = {
	component: React.ComponentType< ElementOverlayProps >;
	shouldRender: ( args: OverlayFilterArgs ) => boolean;
};
