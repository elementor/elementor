<?php
/**
 * Standalone harness to test icon search ranking without WordPress.
 * Run: php dev/test-icon-ranking.php
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

// Define stubs and load classes in global namespace
namespace {
	define( 'ABSPATH', __DIR__ . '/../' );
	define( 'ELEMENTOR_ASSETS_PATH', ABSPATH . 'assets/' );
	
	// Stub WordPress functions
	function apply_filters( $hook, $value, ...$args ) {
		if ( $hook === 'elementor/atomic-widgets/font-awesome-7/json-base-path' ) {
			return ABSPATH . 'assets/lib/font-awesome-7/json/';
		}
		if ( $hook === 'elementor/atomic-widgets/icons/search-results' ) {
			return $value;
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
	
	// Load classes
	require_once ABSPATH . 'modules/atomic-widgets/props-resolver/font-awesome-7-icon-resolver.php';
	require_once ABSPATH . 'modules/atomic-widgets/props-resolver/icon-catalog.php';
	require_once ABSPATH . 'modules/atomic-widgets/props-resolver/icon-matcher.php';
	require_once ABSPATH . 'modules/atomic-widgets/props-resolver/icon-search.php';
	
	use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Catalog;
	use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Matcher;
	use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Search;
	
	Icon_Catalog::reset();
	Icon_Matcher::reset();
	
	$test_queries = [
		'free shipping',
		'right arrow',
		'arrow right',
		'add to cart',
		'cart cart cart',
		'home',
		'facebook',
		'magnifying glass',
		'serach',
		'עגלת קניות',
		'🛒',
		'!!!',
		'fa-home',
		'shopping-cart',
	];
	
	echo "Icon Search Ranking Test\n";
	echo str_repeat('=', 100) . "\n\n";
	
	foreach ( $test_queries as $query ) {
		$result = Icon_Search::search( [ 'queries' => [ $query ], 'per_page' => 5 ] );
		
		if ( isset( $result['error'] ) ) {
			printf( "Query: \"%s\"\n  Error: %s\n\n", $query, $result['error'] );
			continue;
		}
		
		$matches = $result['results'][0]['matches'] ?? [];
		$total = $result['results'][0]['total'] ?? 0;
		
		printf( "Query: \"%s\" (%d total matches)\n", $query, $total );
		echo "Top 5:\n";
		
		if ( empty( $matches ) ) {
			echo "  (no matches)\n";
		} else {
			foreach ( $matches as $idx => $match ) {
				printf(
					"  %d. %-30s matched_on: %-12s library: %s\n",
					$idx + 1,
					$match['name'],
					$match['matched_on'],
					$match['library']
				);
			}
		}
		
		echo "\n";
	}
	
	echo str_repeat('=', 100) . "\n";
	echo "Test complete\n";
}
