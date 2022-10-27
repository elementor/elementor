export function isPopulatedObject( obj ) {
	return obj &&
		'object' === typeof obj &&
		! Array.isArray( obj ) &&
		Object.keys( obj ).length > 0;
}
