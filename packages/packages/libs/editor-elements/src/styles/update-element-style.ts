import { mergeProps } from '@elementor/editor-props';
import { getVariantByMeta, type StyleDefinition, type StyleDefinitionVariant } from '@elementor/editor-styles';

import { StyleNotFoundError } from '../errors';
import { type ElementID } from '../types';
import { mutateElementStyles } from './mutate-element-styles';

export type UpdateElementStyleArgs = {
	elementId: ElementID;
	styleId: StyleDefinition[ 'id' ];
	meta: StyleDefinitionVariant[ 'meta' ];
	props: StyleDefinitionVariant[ 'props' ];
	custom_css?: StyleDefinitionVariant[ 'custom_css' ];
};

export function updateElementStyle( args: UpdateElementStyleArgs ) {
	mutateElementStyles( args.elementId, ( styles ) => {
		const style = styles[ args.styleId ];

		if ( ! style ) {
			throw new StyleNotFoundError( { context: { styleId: args.styleId } } );
		}

		const variant = getVariantByMeta( style, args.meta );
		const customCss = ( 'custom_css' in args ? args.custom_css : variant?.custom_css ) ?? null;

		if ( variant ) {
			variant.props = mergeProps( variant.props, args.props );
			variant.custom_css = customCss?.raw ? customCss : null;
		} else {
			style.variants.push( { meta: args.meta, props: args.props, custom_css: customCss } );
		}

		return styles;
	} );
}
