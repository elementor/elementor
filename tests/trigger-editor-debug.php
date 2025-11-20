<?php
define( 'WP_USE_THEMES', false );
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );
define( 'WP_DEBUG_DISPLAY', false );

require_once __DIR__ . '/../../../../wp-load.php';

$post_id = isset( $argv[1] ) ? (int) $argv[1] : 60820;

error_log( '[ELEMENTOR-CSS DEBUG] Starting editor debug test for post: ' . $post_id );

try {
	$document = \Elementor\Plugin::$instance->documents->get( $post_id );
	
	if ( ! $document ) {
		error_log( '[ELEMENTOR-CSS DEBUG] Document not found for post: ' . $post_id );
		exit( 1 );
	}
	
	error_log( '[ELEMENTOR-CSS DEBUG] Document found: ' . $document->get_name() );
	
	$elements_data = $document->get_elements_data();
	error_log( '[ELEMENTOR-CSS DEBUG] Raw elements count: ' . count( $elements_data ) );
	
	if ( ! empty( $elements_data ) ) {
		error_log( '[ELEMENTOR-CSS DEBUG] First element elType: ' . ( $elements_data[0]['elType'] ?? 'N/A' ) );
		error_log( '[ELEMENTOR-CSS DEBUG] First element id: ' . ( $elements_data[0]['id'] ?? 'N/A' ) );
	}
	
	$config = $document->get_config();
	error_log( '[ELEMENTOR-CSS DEBUG] Config elements count: ' . ( isset( $config['elements'] ) ? count( $config['elements'] ) : 0 ) );
	
	if ( empty( $config['elements'] ) && ! empty( $elements_data ) ) {
		error_log( '[ELEMENTOR-CSS DEBUG] WARNING: Elements data exists but config elements is empty!' );
	}
	
	error_log( '[ELEMENTOR-CSS DEBUG] Test completed successfully' );
	
} catch ( \Exception $e ) {
	error_log( '[ELEMENTOR-CSS DEBUG] Exception: ' . $e->getMessage() );
	error_log( '[ELEMENTOR-CSS DEBUG] Stack trace: ' . $e->getTraceAsString() );
	exit( 1 );
}




