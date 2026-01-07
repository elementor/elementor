import { getAllDescendants, type V1Element } from '@elementor/editor-elements';
import { registerDataHook } from '@elementor/editor-v1-adapters';
import { __dispatch as dispatch, __getState as getState } from '@elementor/store';

import { type ComponentsSlice, selectCurrentComponentId, selectOverridableProps, slice } from '../store/store';
import { removePropFromAllGroups } from '../store/utils/groups-transformers';

type DeleteCommandArgs = {
	container?: V1Element;
	containers?: V1Element[];
};

export function initCleanupOverridablePropsOnDelete() {
	registerDataHook( 'after', 'document/elements/delete', ( args: DeleteCommandArgs ) => {
		const state = getState() as ComponentsSlice | undefined;

		if ( ! state ) {
			return;
		}

		const currentComponentId = selectCurrentComponentId( state );

		if ( ! currentComponentId ) {
			return;
		}

		const overridableProps = selectOverridableProps( state, currentComponentId );

		if ( ! overridableProps || Object.keys( overridableProps.props ).length === 0 ) {
			return;
		}

		const containers = args.containers ?? ( args.container ? [ args.container ] : [] );

		if ( containers.length === 0 ) {
			return;
		}

		const deletedElementIds = collectDeletedElementIds( containers );

		if ( deletedElementIds.size === 0 ) {
			return;
		}

		const propKeysToDelete = Object.entries( overridableProps.props )
			.filter( ( [ , prop ] ) => deletedElementIds.has( prop.elementId ) )
			.map( ( [ propKey ] ) => propKey );

		if ( propKeysToDelete.length === 0 ) {
			return;
		}

		const remainingProps = Object.fromEntries(
			Object.entries( overridableProps.props ).filter( ( [ propKey ] ) => ! propKeysToDelete.includes( propKey ) )
		);

		let updatedGroups = overridableProps.groups;
		for ( const propKey of propKeysToDelete ) {
			updatedGroups = removePropFromAllGroups( updatedGroups, propKey );
		}

		dispatch(
			slice.actions.setOverridableProps( {
				componentId: currentComponentId,
				overridableProps: {
					...overridableProps,
					props: remainingProps,
					groups: updatedGroups,
				},
			} )
		);
	} );
}

function collectDeletedElementIds( containers: V1Element[] ): Set< string > {
	const elementIds = new Set< string >();

	for ( const container of containers ) {
		if ( ! container ) {
			continue;
		}

		const elementId = container.model?.get?.( 'id' ) ?? container.id;

		if ( elementId ) {
			elementIds.add( elementId );
		}

		const descendants = getAllDescendants( container );

		for ( const descendant of descendants ) {
			const descendantId = descendant.model?.get?.( 'id' ) ?? descendant.id;

			if ( descendantId ) {
				elementIds.add( descendantId );
			}
		}
	}

	return elementIds;
}
