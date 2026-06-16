import * as React from 'react';
import { useMemo } from 'react';

import { useElement } from '../contexts/element-context';
import { getSettingsSectionInjections } from './section-injections';

type Props = {
	sectionId: string;
	position?: 'before' | 'after';
};

export function SettingsSectionInjectionSlot( { sectionId, position }: Props ) {
	const { element } = useElement();
	const injections = useMemo(
		() => getSettingsSectionInjections( element.type, sectionId, position ),
		[ element.type, sectionId, position ]
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
