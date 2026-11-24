import { type V1Element } from '@elementor/editor-elements';
import { type NotificationData, notify } from '@elementor/editor-notifications';
import { blockCommand } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { type CreateArgs, type MoveArgs, type PasteArgs, type StorageContent } from '../form-structure/utils';
import { learnMoreActionProps } from '../prevent-link-in-link-commands';
import { clipboardContainsMenu, containersContainMenu, isInsideLink, isInsideMenu, modelContainsMenu } from './utils';

const MENU_IN_LINK_NOTIFICATION: NotificationData = {
	type: 'default',
	message: __(
		"A Menu can't be placed inside a link. Remove the link from the parent container first.",
		'elementor'
	),
	id: 'menu-in-link-blocked',
	additionalActionProps: [ learnMoreActionProps ],
};

const MENU_IN_MENU_NOTIFICATION: NotificationData = {
	type: 'default',
	message: __( "A Menu can't be placed inside another Menu.", 'elementor' ),
	id: 'menu-in-menu-blocked',
};

export function initMenuPlacementPrevention() {
	blockCommand( {
		command: 'document/elements/create',
		condition: blockMenuCreate,
	} );

	blockCommand( {
		command: 'document/elements/move',
		condition: blockMenuMove,
	} );

	blockCommand( {
		command: 'document/elements/paste',
		condition: blockMenuPaste,
	} );
}

function blockMenuCreate( args: CreateArgs ): boolean {
	if ( ! modelContainsMenu( args.model ) ) {
		return false;
	}

	return blockIfMisplaced( args.containers ?? [ args.container ] );
}

function blockMenuMove( args: MoveArgs ): boolean {
	if ( ! containersContainMenu( args.containers ?? [ args.container ] ) ) {
		return false;
	}

	return blockIfMisplaced( [ args.target ] );
}

function blockMenuPaste( args: PasteArgs & { containers?: V1Element[] } ): boolean {
	if ( args.storageType !== 'localstorage' ) {
		return false;
	}

	const data = (
		window as { elementorCommon?: { storage?: { get: () => StorageContent } } }
	 )?.elementorCommon?.storage?.get();

	if ( ! data?.clipboard?.elements || ! clipboardContainsMenu( data.clipboard.elements ) ) {
		return false;
	}

	return blockIfMisplaced( args.containers ?? [ args.container ] );
}

function blockIfMisplaced( targets: ( V1Element | undefined )[] ): boolean {
	if ( targets.some( isInsideLink ) ) {
		notify( MENU_IN_LINK_NOTIFICATION );

		return true;
	}

	if ( targets.some( isInsideMenu ) ) {
		notify( MENU_IN_MENU_NOTIFICATION );

		return true;
	}

	return false;
}
