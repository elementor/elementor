import { type StyleDefinition, type StyleDefinitionVariant } from '../types';

export function getVariantByMeta( style: StyleDefinition, meta: StyleDefinitionVariant[ 'meta' ] ) {
	return style.variants.find( ( variant ) => {
		return variant.meta.breakpoint === meta.breakpoint && variant.meta.state === meta.state;
	} );
}
