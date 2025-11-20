import * as React from 'react';

export type ElementOverlayProps = {
	element: HTMLElement;
	id: string;
	isSelected: boolean;
};

export type ElementOverlayConfig = {
	component: React.ComponentType< ElementOverlayProps >;
	filter: ( element: HTMLElement, elementId: string, isSelected: boolean ) => boolean;
};

