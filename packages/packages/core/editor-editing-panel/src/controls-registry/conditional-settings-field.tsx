import type * as React from 'react';
import { useBoundProp } from '@elementor/editor-controls';
import { useElementSettings } from '@elementor/editor-elements';
import type { PropKey, PropType, PropValue } from '@elementor/editor-props';
import { isDependency, isDependencyMet } from '@elementor/editor-props';

import { useElement } from '../contexts/element-context';

export const ConditionalSettingsField: React.FC< {
	children: React.ReactNode;
} > = ( { children } ) => {
	const { propType } = useBoundProp();
	const {
		element: { id: elementId },
		elementType: { propsSchema },
	} = useElement();

	const elementSettingValues = useElementSettings< PropValue >( elementId, Object.keys( propsSchema ) );

	const shouldHide = propType?.dependencies?.shouldHide === true;
	const dependencyNotMet = ! isDependencyMet( propType?.dependencies, elementSettingValues ).isMet;

	if ( shouldHide && dependencyNotMet ) {
		return null;
	}

	return children;
};

export function getDependencies( propType?: PropType ): PropKey[] {
	if ( ! propType?.dependencies?.terms.length ) {
		return [];
	}

	return propType.dependencies.terms.flatMap( ( term ) => ( ! isDependency( term ) ? term.path : [] ) );
}
