import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { type V1Element } from './types';

type Options = {
	useHistory?: boolean;
	at?: number;
	clone?: boolean;
};

export type DuplicateElementParams = {
	element: V1Element;
	options?: Options;
};

export function duplicateElement( { element, options = {} }: DuplicateElementParams ): V1Element {
	const currentIndex = element.view?._index ?? 0;
	const insertPosition = options.clone !== false ? currentIndex + 1 : undefined;

	return runCommandSync< V1Element >( 'document/elements/duplicate', {
		container: element,
		options: { at: insertPosition, edit: false, ...options },
	} );
}
