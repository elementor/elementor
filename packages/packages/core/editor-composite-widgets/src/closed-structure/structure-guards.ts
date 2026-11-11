import { type V1Element } from '@elementor/editor-elements';
import { type NotificationData, notify } from '@elementor/editor-notifications';
import { type HookOptions, registerDataHook } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { findClosingRoot, isClosedElement, isClosedTarget } from './find-closing-root';
import { type MarkedModel, stripOrphanMarkers } from './strip-orphan-markers';
import { isWidgetStructureOperationRunning } from './widget-structure-operation';

type ContainersArgs = {
	container?: V1Element;
	containers?: V1Element[];
};

type CreateArgs = ContainersArgs & {
	model?: MarkedModel;
};

type MoveArgs = ContainersArgs & {
	target?: V1Element;
};

const MOVE_COMMAND = 'document/elements/move';

const HISTORY_RESTORE_COMMANDS = [
	'document/history/undo',
	'document/history/redo',
	'document/history/do',
	'document/history/undo-all',
];

const STRUCTURE_CLOSED_NOTIFICATION: NotificationData = {
	type: 'default',
	message: __( 'Elements inside a widget can’t be added, moved or removed.', 'elementor' ),
	id: 'composite-widget-structure-closed',
};

export function initStructureGuards() {
	registerDataHook( 'dependency', 'document/elements/create', allowCreate );
	registerDataHook( 'dependency', 'document/elements/delete', allowDelete );
	registerDataHook( 'dependency', MOVE_COMMAND, allowMove );
	registerDataHook( 'dependency', 'document/elements/paste', allowPaste );
	registerDataHook( 'dependency', 'document/elements/duplicate', allowDuplicate );
}

function allowCreate( args: CreateArgs, options?: HookOptions ): boolean {
	if ( isBypassed( options ) || isInsideMove( options ) ) {
		return true;
	}

	if ( getContainers( args ).some( isClosedTarget ) ) {
		return block();
	}

	if ( args.model ) {
		args.model = stripOrphanMarkers( args.model );
	}

	return true;
}

function allowDelete( args: ContainersArgs, options?: HookOptions ): boolean {
	if ( isBypassed( options ) || isInsideMove( options ) ) {
		return true;
	}

	const containers = getContainers( args );
	const deletedIds = new Set( containers.map( ( container ) => container.id ) );

	const deletesClosedElement = containers.some( ( container ) => {
		const closingRoot = findClosingRoot( container, { includeSelf: false } );

		return null !== closingRoot && ! isDeletedWithAncestor( closingRoot, deletedIds );
	} );

	return deletesClosedElement ? block() : true;
}

function allowMove( args: MoveArgs, options?: HookOptions ): boolean {
	if ( isBypassed( options ) ) {
		return true;
	}

	const movesClosedElement = getContainers( args ).some( isClosedElement );
	const movesIntoClosedTarget = !! args.target && isClosedTarget( args.target );

	return movesClosedElement || movesIntoClosedTarget ? block() : true;
}

function allowPaste( args: ContainersArgs, options?: HookOptions ): boolean {
	if ( isBypassed( options ) ) {
		return true;
	}

	return getContainers( args ).some( isClosedTarget ) ? block() : true;
}

function allowDuplicate( args: ContainersArgs, options?: HookOptions ): boolean {
	if ( isBypassed( options ) ) {
		return true;
	}

	return getContainers( args ).some( isClosedElement ) ? block() : true;
}

function isBypassed( options?: HookOptions ): boolean {
	const trace = options?.commandsCurrentTrace ?? [];

	return (
		isWidgetStructureOperationRunning() || HISTORY_RESTORE_COMMANDS.some( ( command ) => trace.includes( command ) )
	);
}

function isInsideMove( options?: HookOptions ): boolean {
	return options?.commandsCurrentTrace?.includes( MOVE_COMMAND ) ?? false;
}

function getContainers( args: ContainersArgs ): V1Element[] {
	const containers = args.containers ?? [ args.container ];

	return containers.filter( ( container ): container is V1Element => !! container );
}

function isDeletedWithAncestor( element: V1Element, deletedIds: Set< string > ): boolean {
	let current: V1Element | undefined = element;

	while ( current ) {
		if ( deletedIds.has( current.id ) ) {
			return true;
		}

		current = current.parent;
	}

	return false;
}

function block(): false {
	notify( STRUCTURE_CLOSED_NOTIFICATION );

	return false;
}
