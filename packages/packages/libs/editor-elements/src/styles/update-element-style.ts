import { mergeProps } from '@elementor/editor-props';
import { getVariantByMeta, type StyleDefinition, type StyleDefinitionVariant } from '@elementor/editor-styles';

import { StyleNotFoundError } from '../errors';
import { type ElementID } from '../types';
import { mutateElementStyles } from './mutate-element-styles';

type PropsVariant = Extract<StyleDefinitionVariant, { props: unknown }>;
type CssVariant = Extract<StyleDefinitionVariant, { css: string }>;

export type UpdateElementStyleArgs = {
	elementId: ElementID;
	styleId: StyleDefinition[ 'id' ];
	meta: StyleDefinitionVariant[ 'meta' ];
	props: PropsVariant[ 'props' ];
	custom_css?: PropsVariant[ 'custom_css' ];
	css?: string;
};

export function updateElementStyle( args: UpdateElementStyleArgs ) {
	mutateElementStyles( args.elementId, ( styles ) => {
		const style = styles[ args.styleId ];

		if ( ! style ) {
			throw new StyleNotFoundError( { context: { styleId: args.styleId } } );
		}

		const variant = getVariantByMeta( style, args.meta );

		if ( 'css' in args && args.css !== undefined ) {
			if ( variant ) {
				( variant as CssVariant ).css = args.css;
			} else {
				style.variants.push( { meta: args.meta, css: args.css } as StyleDefinitionVariant );
			}
		} else {
			const propsVariant = variant as PropsVariant | undefined;
			const customCss = ( 'custom_css' in args ? args.custom_css : propsVariant?.custom_css ) ?? null;

			if ( propsVariant ) {
				propsVariant.props = mergeProps( propsVariant.props ?? {}, args.props );
				propsVariant.custom_css = customCss?.raw ? customCss : null;
			} else {
				style.variants.push( { meta: args.meta, props: args.props, custom_css: customCss } );
			}
		}

		return styles;
	} );
}
