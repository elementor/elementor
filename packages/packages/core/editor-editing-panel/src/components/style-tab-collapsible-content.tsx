import * as React from 'react';
import { type PropsWithChildren } from 'react';

import { useStyle } from '../contexts/style-context';
import { useCustomCss } from '../hooks/use-custom-css';
import { StylesInheritanceSectionIndicators } from '../styles-inheritance/components/styles-inheritance-section-indicators';
import { getStylesProviderThemeColor } from '../utils/get-styles-provider-color';
import { CollapsibleContent } from './collapsible-content';
import { StyleIndicator } from './style-indicator';
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

export const CustomCssIndicator = () => {
	const { customCss } = useCustomCss();
	const { provider: currentStyleProvider } = useStyle();
	const getColor = currentStyleProvider ? getStylesProviderThemeColor( currentStyleProvider.getKey() ) : undefined;
	return customCss?.raw ? <StyleIndicator getColor={ getColor } /> : null;
};

export function getCustomCssIndicator() {
	return ( isOpen: boolean ) => ( ! isOpen ? <CustomCssIndicator /> : null );
}
