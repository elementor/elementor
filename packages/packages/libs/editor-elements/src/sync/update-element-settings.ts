import { type Props } from '@elementor/editor-props';
import { __privateRunCommandSync as runCommandSync } from '@elementor/editor-v1-adapters';

import { type ElementID } from '../types';
import { getContainer } from './get-container';
import { findModel } from './get-model';

export type UpdateElementSettingsArgs = {
	id: ElementID;
	props: Props;
	withHistory?: boolean;
};

export const updateElementSettings = ( { id, props, withHistory = true }: UpdateElementSettingsArgs ) => {
	const container = getContainer( id );

	if ( container ) {
		updateViaCommand( container, props, withHistory );
		return;
	}

	updateViaModel( id, props );
};

function updateViaCommand(
	container: NonNullable< ReturnType< typeof getContainer > >,
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
	const result = findModel( id );

	if ( ! result ) {
		return;
	}

	const { model } = result;
	const currentSettings = model.get( 'settings' ) ?? {};

	model.set( 'settings', { ...currentSettings, ...props } );
}
