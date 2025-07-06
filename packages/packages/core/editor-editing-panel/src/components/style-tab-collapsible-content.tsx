import * as React from 'react';
import { type PropsWithChildren } from 'react';
import { isExperimentActive } from '@elementor/editor-v1-adapters';

import { StylesInheritanceSectionIndicators } from '../styles-inheritance/components/styles-inheritance-section-indicators';
import { EXPERIMENTAL_FEATURES } from '../sync/experiments-flags';
import { CollapsibleContent } from './collapsible-content';
type Props = PropsWithChildren< { fields?: string[] } >;

export const StyleTabCollapsibleContent = ( { fields = [], children }: Props ) => {
	return <CollapsibleContent titleEnd={ getStylesInheritanceIndicators( fields ) }>{ children }</CollapsibleContent>;
};

export function getStylesInheritanceIndicators( fields: string[] ) {
	const isUsingFieldsIndicators = isExperimentActive( EXPERIMENTAL_FEATURES.V_3_30 );

	if ( fields.length === 0 || ! isUsingFieldsIndicators ) {
		return null;
	}

	return ( isOpen: boolean ) => ( ! isOpen ? <StylesInheritanceSectionIndicators fields={ fields } /> : null );
}
