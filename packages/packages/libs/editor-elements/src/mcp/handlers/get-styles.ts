import { getElementStyles } from '../../sync/get-element-styles';

export function handleGetStyles( elementId: string ): Record< string, unknown > | null {
	const styles = getElementStyles( elementId );

	if ( ! styles ) {
		return null;
	}

	// Convert to plain object for JSON serialization
	return Object.fromEntries(
		Object.entries( styles ).map( ( [ id, style ] ) => [
			id,
			{
				id: style.id,
				label: style.label,
				type: style.type,
				variants: style.variants.map( ( variant ) => ( {
					meta: variant.meta,
					props: variant.props,
					custom_css: variant.custom_css,
				} ) ),
			},
		] )
	);
}
