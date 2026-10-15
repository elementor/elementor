import { type StyleDefinition, type StyleDefinitionID } from '@elementor/editor-styles';

import { type GlobalClasses } from '../store';
import { calculateChanges } from './calculate-changes';

// Three-way merge of the user's unsaved edits onto the state the server holds now.
//
// - `base` is the last state this client loaded or saved.
// - `local` is the working copy, including the unsaved edits.
// - `server` is the fresh server state.
//
// Returns the working copy to continue with (`data`) and the baseline to diff it against (`baseline`),
// so the next diff contains exactly the user's unsaved edits and nothing from other sessions.
//
// A class the server no longer has, and the user did not touch, was removed by another session and stays removed.
// A class the user edited is kept, and is saved again.
export function rebaseLocalChanges( base: GlobalClasses, local: GlobalClasses, server: GlobalClasses ) {
	const changes = calculateChanges( local, base );

	const added = new Set( changes.added );
	const modified = new Set( changes.modified );
	const deleted = new Set( changes.deleted );
	const serverIds = new Set( server.order );

	const isEdited = ( id: StyleDefinitionID ) => added.has( id ) || modified.has( id );

	const items: Record< StyleDefinitionID, StyleDefinition > = {};

	for ( const [ id, item ] of Object.entries( local.items ) ) {
		if ( isEdited( id ) ) {
			items[ id ] = item;
		} else if ( serverIds.has( id ) ) {
			items[ id ] = server.items[ id ] ?? item;
		}
	}

	for ( const [ id, item ] of Object.entries( server.items ) ) {
		if ( ! ( id in items ) && ! deleted.has( id ) ) {
			items[ id ] = item;
		}
	}

	const order = rebaseOrder( base, local, server, { deleted, isEdited } );

	const baseline: GlobalClasses = {
		items: Object.fromEntries(
			Object.entries( { ...base.items, ...server.items } ).filter( ( [ id ] ) => serverIds.has( id ) )
		),
		order: server.order,
	};

	return { data: { items, order }, baseline };
}

function rebaseOrder(
	base: GlobalClasses,
	local: GlobalClasses,
	server: GlobalClasses,
	{ deleted, isEdited }: { deleted: Set< StyleDefinitionID >; isEdited: ( id: StyleDefinitionID ) => boolean }
) {
	const serverIds = new Set( server.order );
	const localIds = new Set( local.order );
	const baseIds = new Set( base.order );

	const keptFromBase = base.order.filter( ( id ) => localIds.has( id ) );
	const localBaseOrder = local.order.filter( ( id ) => baseIds.has( id ) );
	const reordered = keptFromBase.join( ';' ) !== localBaseOrder.join( ';' );

	if ( reordered ) {
		const newOnServer = server.order.filter( ( id ) => ! localIds.has( id ) && ! deleted.has( id ) );

		return [ ...newOnServer, ...local.order.filter( ( id ) => serverIds.has( id ) || isEdited( id ) ) ];
	}

	const order = server.order.filter( ( id ) => ! deleted.has( id ) );

	// Classes the server does not have yet keep their place after the nearest class before them that is still there.
	local.order.forEach( ( id, index ) => {
		if ( ! isEdited( id ) || serverIds.has( id ) ) {
			return;
		}

		const anchorId = local.order
			.slice( 0, index )
			.reverse()
			.find( ( candidate ) => order.includes( candidate ) );

		order.splice( anchorId === undefined ? 0 : order.indexOf( anchorId ) + 1, 0, id );
	} );

	return order;
}
