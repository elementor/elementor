import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { getContainer } from './get-container';
import { type V1Element, type V1ElementModelProps, type V1ElementSettingsProps } from './types';

export type Options = {
	useHistory?: boolean;
	at?: number;
	clone?: boolean;
	cloneId?: string;
};

export type CreateElementParams = {
	containerId: string;
	options?: Options;
	model?: Omit< V1ElementModelProps, 'settings' | 'id' > & { settings?: V1ElementSettingsProps; id?: string };
};

export function createElement( { containerId, model, options }: CreateElementParams ) {
	const container = getContainer( containerId );

	if ( ! container ) {
		throw new Error( `Container with ID "${ containerId }" not found` );
	}

	return runCommandSync< V1Element >( 'document/elements/create', {
		container,
		model,
		options: { edit: false, ...options },
	} );
}
