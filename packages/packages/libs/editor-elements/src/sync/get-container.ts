import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

import { createVirtualContainer, findModelWithParent } from './get-model';
import { type ExtendedWindow, type V1Element } from './types';

export function getContainer( id: string ): V1Element | null {
	const extendedWindow = window as unknown as ExtendedWindow;
	const container = extendedWindow.elementor?.getContainer?.( id );

	if ( container ) {
		return container;
	}

	return getContainerFromModel( id );
}

export function getRealContainer( id: string ): V1Element | null {
	const extendedWindow = window as unknown as ExtendedWindow;
	const container = extendedWindow.elementor?.getContainer?.( id );

	return container ?? null;
}

function getContainerFromModel( id: string ): V1Element | null {
	const result = findModelWithParent( id );

	if ( ! result ) {
		return null;
	}

	const { model, parentModel } = result;

	return createVirtualContainer( model, parentModel );
}

export const selectElement = ( elementId: string ) => {
	try {
		const container = getRealContainer( elementId );

		if ( container ) {
			runCommand( 'document/elements/select', { container } );
		}
	} catch {}
};
