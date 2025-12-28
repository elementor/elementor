<?php
/**
 * Test sync from command line
 * Run: wp eval-file wp-content/plugins/elementor/modules/variables/test-sync-cli.php
 */

if ( ! defined( 'WP_CLI' ) && php_sapi_name() !== 'cli' ) {
	die( 'This script must be run from command line or WP-CLI' );
}

use Elementor\Plugin;
use Elementor\Core\Settings\Page\Manager as PageManager;
use Elementor\Modules\Variables\Storage\Variables_Repository;

echo "=== V4 to V3 Sync Test ===\n\n";

try {
	if ( ! class_exists( 'Elementor\Plugin' ) ) {
		die( "Elementor not loaded\n" );
	}
	
	$kit = Plugin::$instance->kits_manager->get_active_kit();
	echo "Kit ID: " . $kit->get_id() . "\n";
	
	$repository = new Variables_Repository( $kit );
	$collection = $repository->load();
	
	echo "Total variables: " . $collection->count() . "\n";
	
	$color_vars = [];
	foreach ( $collection->all() as $variable ) {
		$var_type = $variable->type();
		if ( ( $var_type === 'global-color-variable' || $var_type === 'color' ) && ! $variable->is_deleted() ) {
			$color_vars[] = [
				'id' => $variable->id(),
				'label' => $variable->label(),
				'value' => $variable->value(),
			];
			echo "Found color: " . $variable->label() . " = " . $variable->value() . "\n";
		}
	}
	
	if ( empty( $color_vars ) ) {
		die( "\nNo color variables found!\n" );
	}
	
	echo "\nPreparing V3 format...\n";
	$variable_colors = [];
	foreach ( $color_vars as $color_var ) {
		$variable_colors[] = [
			'_id' => $color_var['id'],
			'title' => $color_var['label'],
			'color' => $color_var['value'],
		];
	}
	
	echo "Loading kit settings...\n";
	$kit_settings = $kit->get_meta( PageManager::META_KEY );
	if ( ! $kit_settings ) {
		$kit_settings = [];
	}
	
	$kit_settings['variable_colors'] = $variable_colors;
	
	echo "Saving via Page Settings Manager...\n";
	$page_settings_manager = \Elementor\Core\Settings\Manager::get_settings_managers( 'page' );
	$result = $page_settings_manager->save_settings( $kit_settings, $kit->get_id() );
	
	if ( $result ) {
		echo "✓ Save successful\n";
	} else {
		echo "✗ Save returned false, trying direct method...\n";
		$result = update_post_meta( $kit->get_id(), PageManager::META_KEY, $kit_settings );
		echo $result ? "✓ Direct save successful\n" : "✗ Direct save failed\n";
	}
	
	// Verify
	wp_cache_delete( $kit->get_id(), 'post_meta' );
	$verified = get_post_meta( $kit->get_id(), PageManager::META_KEY, true );
	
	if ( isset( $verified['variable_colors'] ) && ! empty( $verified['variable_colors'] ) ) {
		echo "\n✓ SUCCESS! Synced " . count( $verified['variable_colors'] ) . " colors to V3\n";
		echo "\nGo to Site Settings → Global Colors → Variables section to see them!\n";
	} else {
		echo "\n✗ FAILED - variables not saved to database\n";
	}
	
	Plugin::$instance->files_manager->clear_cache();
	echo "✓ Cache cleared\n";
	
} catch ( Exception $e ) {
	echo "\n✗ ERROR: " . $e->getMessage() . "\n";
	echo $e->getTraceAsString() . "\n";
}

