import { getContainer, type RestrictionRule, type V1Element } from '@elementor/editor-elements';
import { type NotificationData, notify } from '@elementor/editor-notifications';
import { blockCommand } from '@elementor/editor-v1-adapters';
import { type ButtonProps } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

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

type StorageContent = {
	clipboard?: {
		elements?: {
			id?: string;
			restrictions?: RestrictionRule[];
			elType?: string;
			widgetType?: string;
		}[];
	};
};

const learnMoreActionProps: Partial< ButtonProps > = {
	href: 'https://go.elementor.com/element-restrictions-infotip',
	target: '_blank',
	color: 'inherit',
	variant: 'text',
	sx: {
		marginInlineStart: '20px',
	},
	children: 'Learn more',
};

export function initElementRestrictions() {
	blockCommand( {
		command: 'document/elements/paste',
		condition: blockRestrictedPaste,
	} );

	blockCommand( {
		command: 'document/elements/move',
		condition: blockRestrictedMove,
	} );
}

function blockRestrictedPaste( args: PasteArgs ): boolean {
	const { containers = [ args.container ], storageType } = args;
	const targetElements = containers;

	if ( storageType !== 'localstorage' ) {
		return false;
	}

	const data = ( window as any )?.elementorCommon?.storage?.get() as StorageContent;

	if ( ! data?.clipboard?.elements ) {
		return false;
	}

	const sourceElements = data.clipboard.elements;

	const notification: NotificationData = {
		type: 'default',
		message: __( 'This element cannot be pasted here due to placement restrictions.', 'elementor' ),
		id: 'paste-restriction-blocked',
		additionalActionProps: [ learnMoreActionProps ],
	};

	const blocked = shouldBlockOperation( sourceElements, targetElements );

	if ( blocked ) {
		notify( notification );
	}

	return blocked;
}

function blockRestrictedMove( args: MoveArgs ): boolean {
	const { containers = [ args.container ], target } = args;
	const sourceElements = containers;
	const targetElement = target;

	const notification: NotificationData = {
		type: 'default',
		message: __( 'This element cannot be moved here due to placement restrictions.', 'elementor' ),
		id: 'move-restriction-blocked',
		additionalActionProps: [ learnMoreActionProps ],
	};

	const isBlocked = shouldBlockOperation( sourceElements, [ targetElement ] );

	if ( isBlocked ) {
		notify( notification );
	}

	return isBlocked;
}

function shouldBlockOperation(
	sourceElements?: ( V1Element | undefined )[],
	targetElements?: ( V1Element | undefined )[]
): boolean {
	console.log( sourceElements, targetElements );
	if ( ! sourceElements?.length || ! targetElements?.length ) {
		return false;
	}

	for ( const source of sourceElements ) {
		if ( ! source?.model.get( 'restrictions' )?.length ) {
			continue;
		}

		for ( const restriction of source.model.get( 'restrictions' ) ) {
			if ( ! isRestrictionSatisfied( restriction, source, targetElements ) ) {
				return true;
			}
		}
	}

	return false;
}

function isRestrictionSatisfied(
	restriction: RestrictionRule,
	sourceElement: V1Element,
	targetElements: ( V1Element | undefined )[]
): boolean {
	switch ( restriction.type ) {
		case 'parent':
			return isParentRestrictionSatisfied( restriction, sourceElement, targetElements );
		default:
			return true;
	}
}

function isParentRestrictionSatisfied(
	restriction: RestrictionRule,
	sourceElement: V1Element,
	targetElements: ( V1Element | undefined )[]
): boolean {
	const settings = restriction.settings;

	if ( ! settings ) {
		return true;
	}

	for ( const target of targetElements ) {
		if ( ! target ) {
			continue;
		}

		if ( settings.elType && target.model.get( 'elType' ) !== settings.elType ) {
			return false;
		}

		if ( settings.static === true ) {
			const sourceParent = getContainer( sourceElement.id );
			const targetParent = targetElements[ 0 ]?.id;

			if ( sourceParent !== targetParent ) {
				return false;
			}
		}
	}

	return true;
}
