import { useMemo } from 'react';
import { type PropsSchema } from '@elementor/editor-props';
import { __privateUseListenTo as useListenTo, commandEndEvent, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { useElement } from '../contexts/element-context';
import { isHiddenByAncestor } from '../utils/ancestor-dependency-utils';

const SEPARATOR = '\n';

function getHiddenBindsKey( elementId: string, propsSchema: PropsSchema ): string {
	return Object.entries( propsSchema )
		.filter( ( [ , propType ] ) => isHiddenByAncestor( elementId, propType ) )
		.map( ( [ bind ] ) => bind )
		.join( SEPARATOR );
}

export function useAncestorDependencies(): ( bind: string ) => boolean {
	const {
		element: { id: elementId },
		elementType: { propsSchema },
	} = useElement();

	const hiddenBindsKey = useListenTo(
		[
			v1ReadyEvent(),
			commandEndEvent( 'document/elements/set-settings' ),
			commandEndEvent( 'document/elements/create' ),
			commandEndEvent( 'document/elements/delete' ),
			commandEndEvent( 'document/elements/move' ),
		],
		() => getHiddenBindsKey( elementId, propsSchema ),
		[ elementId, propsSchema ]
	);

	return useMemo( () => {
		const hiddenBinds = new Set( hiddenBindsKey ? hiddenBindsKey.split( SEPARATOR ) : [] );

		return ( bind: string ) => hiddenBinds.has( bind );
	}, [ hiddenBindsKey ] );
}
