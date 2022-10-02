export default function loadDefaultValues() {
	$e.data.cache.storage.removeItem( 'kit-elements-defaults' );

	return $e.data.get( 'kit-elements-defaults/index' );
}
