import { getElementStyles, useElementSetting } from '@elementor/editor-elements';
import { type ClassesPropValue, type PropKey } from '@elementor/editor-props';
import { type StyleDefinitionID } from '@elementor/editor-styles';

import { useElement } from '../contexts/element-context';
import { useStateByElement } from './use-state-by-element';

export function useActiveStyleDefId( classProp: PropKey ) {
	const [ activeStyledDefId, setActiveStyledDefId ] = useStateByElement< StyleDefinitionID | null >(
		'active-style-id',
		null
	);

	const appliedClassesIds = useAppliedClassesIds( classProp )?.value || [];

	const fallback = useFirstAppliedClass( appliedClassesIds );

	const activeAndAppliedClassId = useActiveAndAppliedClassId( activeStyledDefId, appliedClassesIds );
	return [ activeAndAppliedClassId || fallback?.id || null, setActiveStyledDefId ] as const;
}

function useFirstAppliedClass( appliedClassesIds: string[] ) {
	const { element } = useElement();
	const stylesDefs = getElementStyles( element.id ) ?? {};

	return Object.values( stylesDefs ).find( ( styleDef ) => appliedClassesIds.includes( styleDef.id ) );
}

function useAppliedClassesIds( classProp: PropKey ) {
	const { element } = useElement();

	return useElementSetting< ClassesPropValue >( element.id, classProp );
}

function useActiveAndAppliedClassId( id: StyleDefinitionID | null, appliedClassesIds: string[] ) {
	const isClassApplied = !! id && appliedClassesIds.includes( id );

	return isClassApplied ? id : null;
}
