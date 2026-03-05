import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

import { type V1Element } from './types';

type Options = {
	useHistory?: boolean;
	at?: number;
};

type DeleteElementParams = {
	container: V1Element;
	options?: Options;
};

export function deleteElement( { container, options = {} }: DeleteElementParams ): Promise< void > {
	return runCommand( 'document/elements/delete', {
		container,
		options,
	} );
}
