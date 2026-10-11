<?php
// Test ranking script
define( 'ABSPATH', __DIR__ . '/' );
define( 'ELEMENTOR_PATH', __DIR__ . '/' );
define( 'ELEMENTOR_VERSION', '4.4.0' );

require_once __DIR__ . '/includes/autoloader.php';

use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Search;
use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Catalog;
use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Matcher;

Icon_Catalog::reset();
Icon_Matcher::reset();

$queries = [
	'cart',
	'shopping',
	'email',
	'user',
	'fa-solid fa-star',
	'free shipping',
	'arrow right',
	'star',
	'home',
	'trash',
	'phone',
	'search',
	'close',
	'arrow',
];

echo "Current Ranking Results:\n";
echo str_repeat( '=', 80 ) . "\n\n";

foreach ( $queries as $query ) {
	$response = Icon_Search::search( [ 'queries' => [ $query ] ] );
	$matches = $response['results'][0]['matches'] ?? [];
	
	echo "Query: '$query'\n";
	$top3 = array_slice( $matches, 0, 3 );
	foreach ( $top3 as $i => $match ) {
		echo sprintf( "  %d. %s (matched_on: %s, score would be internal)\n", $i + 1, $match['value'], $match['matched_on'] );
	}
	echo "\n";
}
