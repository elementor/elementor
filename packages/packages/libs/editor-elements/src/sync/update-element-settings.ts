import { type Props } from '@elementor/editor-props';
import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { type ElementID } from '../types';
import { getContainer } from './get-container';

export type UpdateElementSettingsArgs = {
	id: ElementID;
	props: Props;
	withHistory?: boolean;
};

export const updateElementSettings = ( { id, props, withHistory = true }: UpdateElementSettingsArgs ) => {
	const container = getContainer( id );

	const args = {
		container,
		settings: { ...props },
	};

	if ( withHistory ) {
		runCommandSync( 'document/elements/settings', args );
	} else {
		runCommandSync( 'document/elements/set-settings', args, { internal: true } );
	}
};
