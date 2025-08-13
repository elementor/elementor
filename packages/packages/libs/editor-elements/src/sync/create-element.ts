import { __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

import { getContainer } from './get-container';
import { type V1ElementModelProps, type V1ElementSettingsProps } from './types';

export function createElement( {
	containerId,
	settings,
	type,
}: {
	settings: V1ElementSettingsProps;
	type: string;
	containerId: string;
} ): void {
	const container = getContainer( containerId );
	const model = createElementModel( { settings, type } );

	runCommand( 'document/elements/create', {
		container,
		model,
		options: {
			edit: false,
		},
	} );
}

function createElementModel( {
	settings,
	type,
}: {
	settings: V1ElementSettingsProps;
	type: string;
} ): Omit< V1ElementModelProps, 'id' > {
	return {
		elType: 'widget',
		widgetType: type,
		settings: {
			...settings,
		},
	};
}
