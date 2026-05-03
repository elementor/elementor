import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { type V1Element } from './types';

type Options = {
	useHistory?: boolean;
	at?: number;
};

type DeleteElementParams = {
	container: V1Element;
	options?: Options;
};

export function deleteElement( { container, options = {} }: DeleteElementParams ): void {
	runCommandSync( 'document/elements/delete', {
		container,
		options,
	} );
}
