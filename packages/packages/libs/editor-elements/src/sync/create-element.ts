import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { getContainer } from './get-container';
import { type V1Element, type V1ElementSettingsProps } from './types';

type Options = {
	useHistory?: boolean;
};

export function createElement( {
	containerId,
	settings,
	type,
	id,
	options,
}: {
	settings: V1ElementSettingsProps;
	type: string;
	containerId: string;
	id?: string;
	options?: Options;
} ) {
	const container = getContainer( containerId );
	const model = createElementModel( { settings, type, id } );

	if ( ! container ) {
		throw new Error( `Container with ID "${ containerId }" not found` );
	}

	return runCommandSync< V1Element >( 'document/elements/create', {
		container,
		model,
		options: { edit: false, ...options },
	} );
}

function createElementModel( { settings, type, id }: { settings: V1ElementSettingsProps; type: string; id?: string } ) {
	return {
		id,
		elType: 'widget',
		widgetType: type,
		settings: {
			...settings,
		},
	};
}
