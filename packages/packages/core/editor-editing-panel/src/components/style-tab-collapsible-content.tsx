import * as React from 'react';
import { type PropsWithChildren } from 'react';
import { CollapsibleContent } from '@elementor/editor-ui';

import { StylesInheritanceSectionIndicators } from '../styles-inheritance/components/styles-inheritance-section-indicators';

type Props = PropsWithChildren< { fields?: string[] } >;

export const StyleTabCollapsibleContent = ( { fields = [], children }: Props ) => {
	return <CollapsibleContent titleEnd={ getStylesInheritanceIndicators( fields ) }>{ children }</CollapsibleContent>;
};

export function getStylesInheritanceIndicators( fields: string[] ) {
	if ( fields.length === 0 ) {
		return null;
	}

	return ( isOpen: boolean ) => ( ! isOpen ? <StylesInheritanceSectionIndicators fields={ fields } /> : null );
}
