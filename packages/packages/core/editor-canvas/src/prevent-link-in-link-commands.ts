import {
	getAnchoredAncestorId,
	getAnchoredDescendantId,
	isElementAnchored,
	type V1Element,
} from '@elementor/editor-elements';
import { type NotificationData, notify } from '@elementor/editor-notifications';
import { blockCommand } from '@elementor/editor-v1-adapters';
import { type ButtonProps } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { type CanvasExtendedWindow } from './sync/types';

export function initLinkInLinkPrevention() {
	blockCommand( {
		command: 'document/elements/paste',
		condition: blockLinkInLinkPaste,
	} );

	blockCommand( {
		command: 'document/elements/move',
		condition: blockLinkInLinkMove,
	} );
}

type PasteArgs = {
	containers?: V1Element[];
	container?: V1Element;
	storageType?: string;
};

type MoveArgs = {
	containers?: V1Element[];
	container?: V1Element;
	target?: V1Element;
};

export type StorageContent = {
	clipboard?: {
		elements?: { id?: string }[];
	};
};

const learnMoreActionProps: Partial< ButtonProps > = {
	href: 'https://go.elementor.com/element-link-inside-link-infotip',
	target: '_blank',
	color: 'inherit',
	variant: 'text',
	sx: {
		marginInlineStart: '20px',
	},
	children: 'Learn more',
};

function blockLinkInLinkPaste( args: PasteArgs ): boolean {
	const { containers = [ args.container ], storageType } = args;
	const targetElements = containers;

	if ( storageType !== 'localstorage' ) {
		return false;
	}

	const data = ( window as CanvasExtendedWindow )?.elementorCommon?.storage?.get();

	if ( ! data?.clipboard?.elements ) {
		return false;
	}

	const sourceElements = data.clipboard.elements;

	const notification: NotificationData = {
		type: 'default',
		message: __(
			"To paste a link to this element, first remove the link from it's parent container.",
			'elementor'
		),
		id: 'paste-in-link-blocked',
		additionalActionProps: [ learnMoreActionProps ],
	};

	const blocked = shouldBlock( sourceElements, targetElements );

	if ( blocked ) {
		notify( notification );
	}

	return blocked;
}

function blockLinkInLinkMove( args: MoveArgs ): boolean {
	const { containers = [ args.container ], target } = args;
	const sourceElements = containers;
	const targetElement = target;

	const notification: NotificationData = {
		type: 'default',
		message: __( "To drag a link to this element, first remove the link from it's parent container.", 'elementor' ),
		id: 'move-in-link-blocked',
		additionalActionProps: [ learnMoreActionProps ],
	};

	const isBlocked = shouldBlock( sourceElements, [ targetElement ] );

	if ( isBlocked ) {
		notify( notification );
	}

	return isBlocked;
}

function shouldBlock(
	sourceElements?: ( { id?: string } | undefined )[],
	targetElements?: ( V1Element | undefined )[]
): boolean {
	if ( ! sourceElements?.length || ! targetElements?.length ) {
		return false;
	}

	const isSourceContainsAnAnchor = sourceElements.some( ( src ) => {
		return src?.id ? isElementAnchored( src.id ) || !! getAnchoredDescendantId( src.id ) : false;
	} );

	if ( ! isSourceContainsAnAnchor ) {
		return false;
	}

	const isTargetContainsAnAnchor = targetElements.some( ( target ) => {
		return target?.id ? isElementAnchored( target.id ) || !! getAnchoredAncestorId( target.id ) : false;
	} );

	return isTargetContainsAnAnchor;
}
