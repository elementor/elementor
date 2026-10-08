<?php
/**
 * Debug test for specific icons
 */

// Stub Custom_Icon_Resolver first
namespace Elementor\Modules\AtomicWidgets\PropsResolver\Custom_Icon_Svg {
	class Resolver {
		const MAX_LIBRARY_ICONS = 250;
		public static function get_libraries() {
			return [];
		}
		public static function resolve_library_values( $library ) {
			return [ 'values' => [], 'truncated' => false, 'total' => 0 ];
		}
	}
}

namespace Elementor\Modules\AtomicWidgets\PropsResolver {
	define( 'Elementor\Modules\AtomicWidgets\PropsResolver\ELEMENTOR_ASSETS_PATH', __DIR__ . '/../assets/' );
}

namespace {
	define( 'ABSPATH', __DIR__ . '/../' );
	define( 'ELEMENTOR_ASSETS_PATH', ABSPATH . 'assets/' );
	
	function apply_filters( $hook, $value, ...$args ) {
		if ( $hook === 'elementor/atomic-widgets/font-awesome-7/json-base-path' ) {
			return ABSPATH . 'assets/lib/font-awesome-7/json/';
		}
		return $value;
	}
	
	function sanitize_text_field( $str ) {
		return trim( strip_tags( $str ) );
	}
	
	function trailingslashit( $string ) {
		return rtrim( $string, '/\\' ) . '/';
	}
	
	function __( $text, $domain = 'default' ) {
		return $text;
	}
	
	function esc_html__( $text, $domain = 'default' ) {
		return htmlspecialchars( $text, ENT_QUOTES, 'UTF-8' );
	}
	
	function wp_json_file_decode( $filename, $options = [] ) {
		if ( ! is_readable( $filename ) ) {
			return null;
		}
		$data = file_get_contents( $filename );
		return json_decode( $data, true );
	}
	
	require_once ABSPATH . 'modules/atomic-widgets/props-resolver/font-awesome-7-icon-resolver.php';
	require_once ABSPATH . 'modules/atomic-widgets/props-resolver/icon-catalog.php';
	require_once ABSPATH . 'modules/atomic-widgets/props-resolver/icon-matcher.php';
	require_once ABSPATH . 'modules/atomic-widgets/props-resolver/icon-search.php';
	
	use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Catalog;
	use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Matcher;
	
	$targets = ['freebsd', 'free-code-camp', 'truck-fast', 'arrow-right'];
	$query = 'free shipping';
	$normalized = Icon_Matcher::normalize( $query );
	$tokens = Icon_Matcher::tokenize( $normalized );
	
	echo "Query: \"$query\"\n";
	echo "Normalized: \"$normalized\"\n";
	echo "Tokens: " . implode(', ', $tokens) . "\n\n";
	
	foreach ( Icon_Catalog::get_entries() as $entry ) {
		if ( ! in_array( $entry['name'], $targets ) ) {
			continue;
		}
		
		echo "Icon: {$entry['name']}\n";
		$result = Icon_Matcher::match( $entry, $normalized, $tokens );
		if ( $result ) {
			echo "  Score: {$result['score']}, Matched on: {$result['matched_on']}\n";
		} else {
			echo "  No match\n";
		}
		echo "\n";
	}
}
