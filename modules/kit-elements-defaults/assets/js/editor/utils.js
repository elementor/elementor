export function isPopulatedObject( obj ) {
	return obj &&
		'object' === typeof obj &&
		Object.keys( obj ).length > 0;
}
