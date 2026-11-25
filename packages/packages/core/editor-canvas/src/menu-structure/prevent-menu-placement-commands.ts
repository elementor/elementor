import { type V1Element } from '@elementor/editor-elements';
import { type NotificationData, notify } from '@elementor/editor-notifications';
import { blockCommand } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { type CreateArgs, type MoveArgs, type PasteArgs } from '../form-structure/utils';
import { isInsideLink, learnMoreActionProps } from '../prevent-link-in-link-commands';
import { getLocalClipboardElements } from '../utils/get-local-clipboard-elements';
import { containersContainMenu, dataContainsMenu, type ElementData, isInsideMenu } from './utils';

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

type MenuSource = {
	hasMenu: boolean;
	hasMenuOutsideSubmenus: boolean;
	hasLinkedMenu: boolean;
};

function blockMenuCreate( args: CreateArgs ): boolean {
	return blockIfMisplaced( describeData( [ args.model ] ), args.containers ?? [ args.container ] );
}

function blockMenuMove( args: MoveArgs ): boolean {
	const containers = args.containers ?? [ args.container ];

	return blockIfMisplaced(
		{
			hasMenu: containersContainMenu( containers ),
			hasMenuOutsideSubmenus: containersContainMenu( containers, { skipSubmenus: true } ),
			hasLinkedMenu: false,
		},
		[ args.target ]
	);
}

function blockMenuPaste( args: PasteArgs & { containers?: V1Element[] } ): boolean {
	const clipboardElements = getLocalClipboardElements( args.storageType );

	if ( ! clipboardElements ) {
		return false;
	}

	return blockIfMisplaced( describeData( clipboardElements ), args.containers ?? [ args.container ] );
}

function describeData( elements: ( ElementData | undefined )[] ): MenuSource {
	return {
		hasMenu: dataContainsMenu( elements ),
		hasMenuOutsideSubmenus: dataContainsMenu( elements, { skipSubmenus: true } ),
		hasLinkedMenu: dataContainsMenu( elements, { onlyUnderLink: true } ),
	};
}

function blockIfMisplaced( source: MenuSource, targets: ( V1Element | undefined )[] ): boolean {
	if ( source.hasLinkedMenu || ( source.hasMenu && targets.some( isInsideLink ) ) ) {
		notify( MENU_IN_LINK_NOTIFICATION );

		return true;
	}

	if ( source.hasMenuOutsideSubmenus && targets.some( isInsideMenu ) ) {
		notify( MENU_IN_MENU_NOTIFICATION );

		return true;
	}

	return false;
}
