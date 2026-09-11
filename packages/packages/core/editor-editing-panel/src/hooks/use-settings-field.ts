import { getElementSettingsVariants, getSettingsVariantByMeta } from '@elementor/editor-elements';
import { type PropKey, type PropValue, responsiveFallbackChain } from '@elementor/editor-props';

export function getInheritedSettingsValue( {
	bind,
	breakpoint,
	elementId,
	desktopValue,
	activeBreakpoints,
}: {
	bind: PropKey;
	breakpoint: string;
	elementId: string;
	desktopValue: PropValue | null | undefined;
	activeBreakpoints?: string[];
} ): PropValue | null {
	const variants = getElementSettingsVariants( elementId );
	const chain = responsiveFallbackChain( breakpoint );

	for ( const key of chain ) {
		if ( key === breakpoint ) {
			continue;
		}

		if ( 'desktop' !== key && activeBreakpoints && ! activeBreakpoints.includes( key ) ) {
			continue;
		}

		if ( 'desktop' === key ) {
			return desktopValue ?? null;
		}

		const inherited = getSettingsVariantByMeta( variants, key )?.props?.[ bind ];

		if ( inherited !== null && inherited !== undefined ) {
			return inherited;
		}
	}

	return desktopValue ?? null;
}
