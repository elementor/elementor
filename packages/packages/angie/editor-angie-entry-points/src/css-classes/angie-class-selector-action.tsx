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

/** ED-26281 — Classes AI entry point (styles prompt when only local is active). */
export const AngieClassSelectorAction = () => {
	const { element } = useElement();
	const activeClassLabel = useActiveClassLabel();

	// Always show one Angie control next to Class Manager. Prefer a named-class
	// prompt when available; otherwise use the generic styles prompt (local / no label).
	const prompt = activeClassLabel
		? ANGIE_PROMPTS.classSelector( element.id, activeClassLabel )
		: ANGIE_PROMPTS.styleTab( { elementId: element.id } );

	return <AngieGenerateButton prompt={ prompt } />;
};
