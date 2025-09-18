import * as React from 'react';
import { type BreakpointId, type BreakpointNode, getBreakpointsTree } from '@elementor/editor-responsive';
import { getVariantByMeta } from '@elementor/editor-styles';

import { useElement } from '../contexts/element-context';
import { useStyle } from '../contexts/style-context';
import { useCustomCss } from '../hooks/use-custom-css';
import { getStylesProviderThemeColor } from '../utils/get-styles-provider-color';
import { StyleIndicator } from './style-indicator';

export const CustomCssIndicator = () => {
	const { customCss } = useCustomCss();
	const { id: styleId, provider, meta } = useStyle();
	const {
		element: { id: elementId },
	} = useElement();

	const style = React.useMemo(
		() => ( styleId && provider ? provider.actions.get( styleId, { elementId } ) : null ),
		[ styleId, provider, elementId ]
	);

	const hasContent = Boolean( customCss?.raw?.trim() );

	const hasInheritedContent = React.useMemo( () => {
		if ( hasContent || ! style || ! meta ) {
			return false;
		}

		const target = ( meta.breakpoint ?? 'desktop' ) as BreakpointId;
		const root = getBreakpointsTree();
		const state = meta.state;

		function search( node: BreakpointNode, ancestorHasCss: boolean ): boolean | undefined {
			if ( ! style ) {
				return undefined;
			}

			const hasHere = Boolean(
				getVariantByMeta( style, {
					breakpoint: node.id as BreakpointId,
					state,
				} )?.custom_css?.raw?.trim()
			);

			if ( node.id === target ) {
				return ancestorHasCss;
			}

			for ( const child of node.children ?? [] ) {
				const res = search( child, ancestorHasCss || hasHere );
				if ( res !== undefined ) {
					return res;
				}
			}
			return undefined;
		}

		return Boolean( search( root, false ) );
	}, [ hasContent, style, meta ] );

	if ( ! hasContent ) {
		if ( hasInheritedContent ) {
			return <StyleIndicator />;
		}
		return null;
	}

	return <StyleIndicator getColor={ provider ? getStylesProviderThemeColor( provider.getKey() ) : undefined } />;
};
