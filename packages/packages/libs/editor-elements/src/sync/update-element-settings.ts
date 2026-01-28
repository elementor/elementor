import { type Props } from '@elementor/editor-props';
import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { type ElementID } from '../types';
import { getContainer, getRealContainer } from './get-container';

export type UpdateElementSettingsArgs = {
	id: ElementID;
	props: Props;
	withHistory?: boolean;
};

export const updateElementSettings = ( { id, props, withHistory = true }: UpdateElementSettingsArgs ) => {
	const realContainer = getRealContainer( id );

	if ( realContainer ) {
		updateViaCommand( realContainer, props, withHistory );
		return;
	}

	updateViaModel( id, props );
};

function updateViaCommand(
	container: NonNullable< ReturnType< typeof getRealContainer > >,
	props: Props,
	withHistory: boolean
) {
	const args = {
		container,
		settings: { ...props },
	};

	if ( withHistory ) {
		runCommandSync( 'document/elements/settings', args );
	} else {
		runCommandSync( 'document/elements/set-settings', args, { internal: true } );
	}
}

function updateViaModel( id: ElementID, props: Props ) {
	const container = getContainer( id );

	if ( ! container ) {
		return;
	}

	const currentSettings = container.model.get( 'settings' ) ?? {};

	container.model.set( 'settings', { ...currentSettings, ...props } );
}
