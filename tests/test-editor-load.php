<?php
define( 'WP_USE_THEMES', false );
require_once __DIR__ . '/../../../../wp-load.php';

if ( ! defined( 'WP_DEBUG_LOG' ) ) {
	define( 'WP_DEBUG_LOG', true );
}

$post_id = isset( $argv[1] ) ? (int) $argv[1] : 60820;

echo "Testing editor load for post ID: $post_id\n";

$document = \Elementor\Plugin::$instance->documents->get( $post_id );

if ( ! $document ) {
	echo "ERROR: Document not found\n";
	exit( 1 );
}

echo "Document found: " . $document->get_name() . "\n";

try {
	$config = $document->get_config();
	echo "Config retrieved successfully\n";
	echo "Elements count: " . ( isset( $config['elements'] ) ? count( $config['elements'] ) : 0 ) . "\n";
	
	if ( empty( $config['elements'] ) ) {
		echo "WARNING: No elements in config!\n";
		$elements_data = $document->get_elements_data();
		echo "Raw elements data count: " . count( $elements_data ) . "\n";
		if ( ! empty( $elements_data ) ) {
			echo "First element elType: " . ( $elements_data[0]['elType'] ?? 'N/A' ) . "\n";
		}
	} else {
		echo "First element keys: " . implode( ', ', array_keys( $config['elements'][0] ) ) . "\n";
	}
} catch ( \Exception $e ) {
	echo "ERROR: " . $e->getMessage() . "\n";
	exit( 1 );
}

echo "\nCheck debug.log for detailed error messages\n";




