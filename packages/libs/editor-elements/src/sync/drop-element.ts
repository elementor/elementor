import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { getContainer } from './get-container';
import { type V1Element, type V1ElementModelProps, type V1ElementSettingsProps } from './types';

type Options = {
	useHistory?: boolean;
	at?: number;
	scrollIntoView: boolean;
};

export type DropElementParams = {
	containerId: string;
	options?: Options;
	model?: Omit< V1ElementModelProps, 'settings' | 'id' > & { settings?: V1ElementSettingsProps; id?: string };
};

export function dropElement( { containerId, model, options }: DropElementParams ) {
	const container = getContainer( containerId );

	if ( ! container ) {
		throw new Error( `Container with ID "${ containerId }" not found` );
	}

	return runCommandSync< V1Element >( 'preview/drop', {
		container,
		model,
		options,
	} );
}
