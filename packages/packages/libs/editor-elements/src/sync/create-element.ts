import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { type V1Element, type V1ElementModelProps, type V1ElementSettingsProps } from './types';

type Options = {
	useHistory?: boolean;
	at?: number;
	clone?: boolean;
};

export type CreateElementParams = {
	container: V1Element;
	model?: Omit< V1ElementModelProps, 'settings' | 'id' > & { settings?: V1ElementSettingsProps; id?: string };
	options?: Options;
};

export function createElement( { container, model, options }: CreateElementParams ): V1Element {
	return runCommandSync< V1Element >( 'document/elements/create', {
		container,
		model,
		options: { edit: false, ...options },
	} );
}
