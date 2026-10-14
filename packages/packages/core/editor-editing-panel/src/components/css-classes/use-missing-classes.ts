import { type ClassesPropValue } from '@elementor/editor-props';
import { useProviders } from '@elementor/editor-styles-repository';

import { useClassesProp } from '../../contexts/classes-prop-context';
import { usePanelElementSetting } from '../../contexts/element-context';

export function useMissingClassesIds(): string[] {
	const providers = useProviders();
	const currentClassesProp = useClassesProp();
	const appliedIds = usePanelElementSetting< ClassesPropValue >( currentClassesProp )?.value ?? [];

	const allKnownIds = new Set(
		providers.flatMap( ( provider ) => provider.actions.all().map( ( style ) => style.id ) )
	);

	return appliedIds.filter( ( id ) => ! allKnownIds.has( id ) );
}
