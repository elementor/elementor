import { getElementStyles } from '@elementor/editor-elements';
import { type ClassesPropValue, type PropKey } from '@elementor/editor-props';
import { type StyleDefinitionID } from '@elementor/editor-styles';
import { useProviders } from '@elementor/editor-styles-repository';

import { useElement, usePanelElementSetting } from '../contexts/element-context';
import { useStateByElement } from './use-state-by-element';

export function useActiveStyleDefId( classProp: PropKey ) {
	const [ activeStyledDefId, setActiveStyledDefId ] = useStateByElement< StyleDefinitionID | null >(
		'active-style-id',
		null
	);

	const appliedClassesIds = usePanelElementSetting< ClassesPropValue >( classProp )?.value || [];
	const validAppliedClassesIds = useValidClassIds( appliedClassesIds );

	const fallback = useFirstAppliedClass( appliedClassesIds );

	const activeAndAppliedClassId = useActiveAndAppliedClassId( activeStyledDefId, validAppliedClassesIds );
	return [ activeAndAppliedClassId || fallback?.id || null, setActiveStyledDefId ] as const;
}

function useValidClassIds( appliedClassesIds: string[] ) {
	const providers = useProviders();
	const allKnownIds = new Set(
		providers.flatMap( ( provider ) => provider.actions.all().map( ( style ) => style.id ) )
	);
	return appliedClassesIds.filter( ( id ) => allKnownIds.has( id ) );
}

function useFirstAppliedClass( appliedClassesIds: string[] ) {
	const { element } = useElement();
	const stylesDefs = getElementStyles( element.id ) ?? {};

	return Object.values( stylesDefs ).find( ( styleDef ) => appliedClassesIds.includes( styleDef.id ) );
}

function useActiveAndAppliedClassId( id: StyleDefinitionID | null, appliedClassesIds: string[] ) {
	const isClassApplied = !! id && appliedClassesIds.includes( id );

	return isClassApplied ? id : null;
}
