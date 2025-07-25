import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

import { type ExtendedWindow } from './types';

export function getContainer( id: string ) {
	const extendedWindow = window as unknown as ExtendedWindow;
	const container = extendedWindow.elementor?.getContainer?.( id );

	return container ?? null;
}

export const selectElement = ( elementId: string ) => {
	try {
		const container = getContainer( elementId );

		runCommand( 'document/elements/select', { container } );
	} catch {}
};
