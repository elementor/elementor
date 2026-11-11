import * as React from 'react';
import { useElement, useStyle } from '@elementor/editor-editing-panel';
import { useProviders } from '@elementor/editor-styles-repository';

import { AngieGenerateButton } from '../angie-generate-button';
import { ANGIE_PROMPTS } from '../prompts';

const useActiveClassLabel = (): string | null => {
	const { element } = useElement();
	const { id: activeClassId } = useStyle();
	const providers = useProviders();

	if ( ! activeClassId ) {
		return null;
	}

	for ( const provider of providers ) {
		const styles = provider.actions.all( { elementId: element.id } ) ?? [];
		const match = styles.find( ( style ) => style.id === activeClassId );

		if ( match?.label ) {
			return match.label;
		}
	}

	return null;
};

export const AngieClassSelectorAction = () => {
	const { element } = useElement();
	const activeClassLabel = useActiveClassLabel();

	if ( ! activeClassLabel ) {
		return null;
	}

	return (
		<AngieGenerateButton prompt={ ANGIE_PROMPTS.classSelector( element.id, activeClassLabel ) } />
	);
};
