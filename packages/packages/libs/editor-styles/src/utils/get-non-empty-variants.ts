import { type StyleDefinition, type StyleDefinitionVariant } from '../types';

export function getNonEmptyVariants( style: StyleDefinition ) {
	return style.variants.filter(
		( { props, custom_css: customCss }: StyleDefinitionVariant ) =>
			Object.keys( props ).length > 0 || Boolean( customCss?.raw )
	);
}
