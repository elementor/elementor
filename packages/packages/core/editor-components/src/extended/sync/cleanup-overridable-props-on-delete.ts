import { getAllDescendants, type V1Element } from '@elementor/editor-elements';
import { type HookOptions, registerDataHook } from '@elementor/editor-v1-adapters';
import { __getState as getState } from '@elementor/store';

import { type ComponentsSlice, selectCurrentComponentId, selectOverridableProps } from '../../store/store';
import { deleteOverridableProp } from '../store/actions/delete-overridable-prop';

type DeleteCommandArgs = {
	container?: V1Element;
	containers?: V1Element[];
};

export function initCleanupOverridablePropsOnDelete() {
	// This hook is not a real dependency - it doesn't block the execution of the command in any case, only perform side effect.
	// We use `dependency` and not `after` hook because the `after` hook doesn't include the children of a deleted container
	// in the callback parameters (as they already were deleted).
	registerDataHook( 'dependency', 'document/elements/delete', ( args: DeleteCommandArgs, options?: HookOptions ) => {
		if ( isPartOfMoveCommand( options ) ) {
			return true;
		}

		const state = getState() as ComponentsSlice | undefined;

		if ( ! state ) {
			return true;
		}

		const currentComponentId = selectCurrentComponentId( state );

		if ( ! currentComponentId ) {
			return true;
		}

		const overridableProps = selectOverridableProps( state, currentComponentId );

		if ( ! overridableProps || Object.keys( overridableProps.props ).length === 0 ) {
			return true;
		}

		const containers = args.containers ?? ( args.container ? [ args.container ] : [] );

		if ( containers.length === 0 ) {
			return true;
		}

		const deletedElementIds = collectDeletedElementIds( containers );

		if ( deletedElementIds.length === 0 ) {
			return true;
		}

		const propKeysToDelete = Object.entries( overridableProps.props )
			.filter( ( [ , prop ] ) => deletedElementIds.includes( prop.elementId ) )
			.map( ( [ propKey ] ) => propKey );

		if ( propKeysToDelete.length === 0 ) {
			return true;
		}

		deleteOverridableProp( { componentId: currentComponentId, propKey: propKeysToDelete, source: 'system' } );

		return true;
	} );
}

function collectDeletedElementIds( containers: V1Element[] ): string[] {
	const elementIds = containers
		.filter( Boolean )
		.flatMap( ( container ) => [ container, ...getAllDescendants( container ) ] )
		.map( ( element ) => element.model?.get?.( 'id' ) ?? element.id )
		.filter( ( id ): id is string => Boolean( id ) );

	return elementIds;
}

function isPartOfMoveCommand( options?: HookOptions ): boolean {
	// Skip cleanup if this delete is part of a move command
	// Move = delete + create, and we don't want to delete the overridable prop in this case.
	// See assets/dev/js/editor/document/elements/commands/move.js
	const isMoveCommandInTrace =
		options?.commandsCurrentTrace?.includes( 'document/elements/move' ) ||
		options?.commandsCurrentTrace?.includes( 'document/repeater/move' );

	return Boolean( isMoveCommandInTrace );
}
