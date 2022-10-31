const NAMESPACE = 'kit-elements-defaults';

export async function loadElementsDefaults() {
	$e.data.cache.storage.removeItem( NAMESPACE );

	return $e.data.get( `${ NAMESPACE }/index` );
}

export function getElementDefaults( type ) {
	const defaults = $e.data.cache.storage.getItem( NAMESPACE ) || {};

	return defaults[ type ] || {};
}

export async function updateElementDefaults( type, settings ) {
	await $e.data.update( `${ NAMESPACE }/index`, { settings }, { type } );
	await loadElementsDefaults();
}

export async function deleteElementDefaults( type ) {
	await $e.data.delete( `${ NAMESPACE }/index`, { type } );
	await loadElementsDefaults();
}
