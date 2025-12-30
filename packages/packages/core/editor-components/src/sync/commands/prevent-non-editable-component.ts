import { getCurrentDocumentId, type V1Element } from '@elementor/editor-elements';
import { type NotificationData, notify } from '@elementor/editor-notifications';
import { __ } from '@wordpress/i18n';

import { type ComponentInstanceProp } from '../../prop-types/component-instance-prop-type';
import { isComponentInstance } from '../../utils/is-component-instance';
import { type CreateArgs, type MoveArgs, type PasteArgs } from './types';

const COMPONENT_NOT_IN_EDIT_MODE_ALERT: NotificationData = {
	type: 'default',
	message: __( 'Cannot add elements to a component that is not being edited.', 'elementor' ),
	id: 'component-not-in-edit-mode-blocked',
};

export function isTargetInNonEditableComponent( targetContainer: V1Element | undefined ): boolean {
	if ( ! targetContainer ) {
		return false;
	}

	const componentAncestor = getComponentAncestor( targetContainer );

	if ( ! componentAncestor ) {
		return false;
	}

	const componentIdFromSettings = extractComponentIdFromAncestor( componentAncestor );

	if ( componentIdFromSettings === null ) {
		return false;
	}

	const currentDocumentId = getCurrentDocumentId();

	return componentIdFromSettings !== currentDocumentId;
}

export function blockCreateInNonEditableComponent( args: CreateArgs ): boolean {
	const isBlocked = isTargetInNonEditableComponent( args.container );

	if ( isBlocked ) {
		notify( COMPONENT_NOT_IN_EDIT_MODE_ALERT );
	}

	return isBlocked;
}

export function blockMoveToNonEditableComponent( args: MoveArgs ): boolean {
	const isBlocked = isTargetInNonEditableComponent( args.target );

	if ( isBlocked ) {
		notify( COMPONENT_NOT_IN_EDIT_MODE_ALERT );
	}

	return isBlocked;
}

export function blockPasteToNonEditableComponent( args: PasteArgs ): boolean {
	const { containers = [ args.container ] } = args;

	const isBlocked = containers.some( isTargetInNonEditableComponent );

	if ( isBlocked ) {
		notify( COMPONENT_NOT_IN_EDIT_MODE_ALERT );
	}

	return isBlocked;
}

function getComponentAncestor( container: V1Element ): V1Element | null {
	let current: V1Element | undefined = container;

	while ( current ) {
		if ( isComponentInstance( current.model.toJSON() ) ) {
			return current;
		}
		current = current.parent;
	}

	return null;
}

function extractComponentIdFromAncestor( componentAncestor: V1Element ): number | string | null {
	const componentInstance = componentAncestor.settings?.get?.( 'component_instance' ) as ComponentInstanceProp;

	return componentInstance?.value?.component_id?.value ?? null;
}
