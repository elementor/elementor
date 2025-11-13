<?php
require_once __DIR__ . '/../../../../wp-load.php';

$post_id = 60820;

$document = \Elementor\Plugin::$instance->documents->get( $post_id );

if ( ! $document ) {
	echo "Document not found\n";
	exit;
}

echo "=== Testing get_elements_data() ===\n";
$elements_data = $document->get_elements_data();
echo "Elements count: " . count( $elements_data ) . "\n";
echo "First element elType: " . ( $elements_data[0]['elType'] ?? 'N/A' ) . "\n";

echo "\n=== Testing get_elements_raw_data() ===\n";
$raw_data = $document->get_elements_raw_data();
echo "Raw data count: " . count( $raw_data ) . "\n";
if ( ! empty( $raw_data ) ) {
	echo "First element keys: " . implode( ', ', array_keys( $raw_data[0] ) ) . "\n";
	echo "First element elType: " . ( $raw_data[0]['elType'] ?? 'N/A' ) . "\n";
}

echo "\n=== Testing get_config() ===\n";
$config = $document->get_config();
echo "Config has elements: " . ( isset( $config['elements'] ) ? 'YES (' . count( $config['elements'] ) . ')' : 'NO' ) . "\n";

