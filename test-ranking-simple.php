<?php
// Simpler test without WordPress
define( 'ABSPATH', __DIR__ . '/' );

require_once __DIR__ . '/includes/autoloader.php';

use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Catalog;
use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Search;
use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Matcher;

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
echo str_repeat('=', 80) . "\n\n";

foreach ( $test_queries as $query ) {
	try {
		$result = Icon_Search::search( [ 'queries' => [ $query ], 'per_page' => 5 ] );
		$matches = $result['results'][0]['matches'] ?? [];
		$total = $result['results'][0]['total'] ?? 0;
		
		echo "Query: \"$query\" ($total total matches)\n";
		echo "Top 5:\n";
		
		foreach ( $matches as $idx => $match ) {
			echo sprintf(
				"  %d. %s (matched_on: %s, library: %s)\n",
				$idx + 1,
				$match['name'],
				$match['matched_on'],
				$match['library']
			);
		}
		
		if ( empty( $matches ) ) {
			echo "  (no matches)\n";
		}
		
		echo "\n";
	} catch ( \Exception $e ) {
		echo "Error for query \"$query\": " . $e->getMessage() . "\n\n";
	}
}
