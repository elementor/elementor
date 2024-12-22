export function getVariantByMeta( variants, meta ) {
	return variants.find( ( variant ) => {
		return variant.meta.breakpoint === meta.breakpoint && variant.meta.state === meta.state;
	} );
}

export function getVariantsWithoutMeta( variants, meta ) {
	return variants.filter( ( variant ) => {
		return variant.meta.breakpoint !== meta.breakpoint || variant.meta.state !== meta.state;
	} );
}
