import { findClosestContainer, type V1Element } from '@elementor/editor-elements';
import { type NotificationData, notify } from '@elementor/editor-notifications';
import { blockCommand } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { isElementLocked, isInsertionLocked } from './find-locking-widget-root';
import { WIDGET_STRUCTURE_ORIGIN } from './widget-structure-origin';

type StructureCommandArgs = {
	container?: V1Element;
	containers?: V1Element[];
	target?: V1Element;
	options?: { origin?: string };
};

const STRUCTURE_CLOSED_NOTIFICATION: NotificationData = {
	type: 'default',
	message: __( 'Elements inside a widget can’t be added, moved or removed.', 'elementor' ),
	id: 'composite-widget-structure-closed',
};

export function initStructureGuards() {
	guardCommand( 'document/elements/create', ( args ) => getContainers( args ).some( isInsertionLocked ) );
	guardCommand( 'document/elements/delete', deletesLockedElement );
	guardCommand( 'document/elements/move', movesLockedStructure );
	guardCommand( 'document/elements/paste', ( args ) => getContainers( args ).some( isInsertionLocked ) );
	guardCommand( 'document/elements/duplicate', ( args ) => getContainers( args ).some( isElementLocked ) );
	guardCommand( 'document/elements/copy', ( args ) => getContainers( args ).some( isElementLocked ) );
}

function guardCommand( command: string, isBlocked: ( args: StructureCommandArgs ) => boolean ) {
	blockCommand( {
		command,
		condition: ( args ) => {
			const structureArgs = args as StructureCommandArgs;

			if ( WIDGET_STRUCTURE_ORIGIN === structureArgs.options?.origin || ! isBlocked( structureArgs ) ) {
				return false;
			}

			notify( STRUCTURE_CLOSED_NOTIFICATION );

			return true;
		},
	} );
}

function deletesLockedElement( args: StructureCommandArgs ): boolean {
	const containers = getContainers( args );
	const deletedIds = new Set( containers.map( ( { id } ) => id ) );

	return containers.some(
		( container ) => isElementLocked( container ) && ! isDeletedWithAncestor( container, deletedIds )
	);
}

function isDeletedWithAncestor( container: V1Element, deletedIds: Set< string > ): boolean {
	return null !== findClosestContainer( container.parent, ( { id } ) => deletedIds.has( id ) );
}

function movesLockedStructure( args: StructureCommandArgs ): boolean {
	const movesLockedElement = getContainers( args ).some( isElementLocked );
	const movesIntoLockedTarget = !! args.target && isInsertionLocked( args.target );

	return movesLockedElement || movesIntoLockedTarget;
}

function getContainers( args: StructureCommandArgs ): V1Element[] {
	const containers = args.containers ?? [ args.container ];

	return containers.filter( ( container ): container is V1Element => !! container );
}
