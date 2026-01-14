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
	registerDataHook( 'dependency', 'document/elements/delete', ( args: DeleteCommandArgs ) => {
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
