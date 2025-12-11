import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { getContainer } from './get-container';
import { type V1Element } from './types';

type Options = {
	useHistory?: boolean;
	at?: number;
	clone?: boolean;
};

export type DuplicateElementParams = {
	elementId: string;
	options?: Options;
};

export function duplicateElement( { elementId, options = {} }: DuplicateElementParams ): V1Element {
	const elementToDuplicate = getContainer( elementId );

	if ( ! elementToDuplicate ) {
		throw new Error( `Element with ID "${ elementId }" not found` );
	}

	// Get the position after the original element (only when cloning)
	const currentIndex = elementToDuplicate.view?._index ?? 0;
	const insertPosition = options.clone !== false ? currentIndex + 1 : undefined;

	return runCommandSync< V1Element >( 'document/elements/duplicate', {
		container: elementToDuplicate,
		options: { at: insertPosition, edit: false, ...options },
	} );
}
