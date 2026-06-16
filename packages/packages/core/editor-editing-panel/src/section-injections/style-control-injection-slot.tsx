import * as React from 'react';
import { useMemo } from 'react';

import { useElement } from '../contexts/element-context';
import { useStyleSectionName } from '../contexts/style-section-name-context';
import { getStyleControlInjections } from './section-injections';

type Props = {
	controlId: string;
};

export function StyleControlInjectionSlot( { controlId }: Props ) {
	const sectionName = useStyleSectionName();
	const { element } = useElement();

	const injections = useMemo( () => {
		if ( ! sectionName ) {
			return [];
		}

		return getStyleControlInjections( element.type, sectionName, controlId );
	}, [ element.type, sectionName, controlId ] );

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
