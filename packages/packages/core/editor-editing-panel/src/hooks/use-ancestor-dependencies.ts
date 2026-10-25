import { useMemo } from 'react';
import { type PropsSchema, type PropType } from '@elementor/editor-props';
import { __privateUseListenTo as useListenTo, commandEndEvent, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { useElement } from '../contexts/element-context';
import { isHiddenByAncestor } from '../utils/ancestor-dependency-utils';

const SEPARATOR = '\n';

type AncestorBoundProp = [ string, PropType ];

function getAncestorBoundProps( propsSchema: PropsSchema ): AncestorBoundProp[] {
	return Object.entries( propsSchema ).filter( ( [ , propType ] ) => propType.meta?.ancestor_dependency );
}

function getHiddenBindsKey( elementId: string, ancestorBoundProps: AncestorBoundProp[] ): string {
	return ancestorBoundProps
		.filter( ( [ , propType ] ) => isHiddenByAncestor( elementId, propType ) )
		.map( ( [ bind ] ) => bind )
		.join( SEPARATOR );
}

export function useAncestorDependencies(): ( bind: string ) => boolean {
	const {
		element: { id: elementId },
		elementType: { propsSchema },
	} = useElement();

	const ancestorBoundProps = useMemo( () => getAncestorBoundProps( propsSchema ), [ propsSchema ] );

	const hiddenBindsKey = useListenTo(
		[
			v1ReadyEvent(),
			commandEndEvent( 'document/elements/set-settings' ),
			commandEndEvent( 'document/elements/create' ),
			commandEndEvent( 'document/elements/delete' ),
			commandEndEvent( 'document/elements/move' ),
		],
		() => getHiddenBindsKey( elementId, ancestorBoundProps ),
		[ elementId, ancestorBoundProps ]
	);

	return useMemo( () => {
		const hiddenBinds = new Set( hiddenBindsKey ? hiddenBindsKey.split( SEPARATOR ) : [] );

		return ( bind: string ) => hiddenBinds.has( bind );
	}, [ hiddenBindsKey ] );
}
