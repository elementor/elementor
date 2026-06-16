import * as React from 'react';
import { useMemo } from 'react';

import { useElement } from '../contexts/element-context';
import { getStyleSectionInjections } from './section-injections';

type Props = {
	sectionName: string;
};

export function StyleSectionInjectionSlot( { sectionName }: Props ) {
	const { element } = useElement();
	const injections = useMemo(
		() => getStyleSectionInjections( element.type, sectionName ),
		[ element.type, sectionName ]
	);

	if ( ! injections.length ) {
		return null;
	}

	return (
		<>
			{ injections.map( ( { id, component: Component } ) => (
				<Component key={ id } />
			) ) }
		</>
	);
}
