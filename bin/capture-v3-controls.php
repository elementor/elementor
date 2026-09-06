<?php
/**
 * Captures a live V3 widget's controls to a JSON fixture the MCP V3 parity test suite reads.
 *
 * The core PHPUnit run does not boot the WordPress runtime, so widget controls that the MCP
 * mapper needs to introspect are checked in as JSON. This script exists to (re-)generate
 * those checked-in dumps in one place instead of hand-authoring them.
 *
 * Usage (WP-CLI, from any WordPress install with Elementor active):
 *
 *     wp eval-file wp-content/plugins/elementor/bin/capture-v3-controls.php -- <widget-type> [<widget-type>...]
 *
 * Or against the whole MCP V3 allowlist:
 *
 *     wp eval-file wp-content/plugins/elementor/bin/capture-v3-controls.php -- --allowlist
 *
 * Each captured widget is written to:
 *
 *     tests/phpunit/elementor/modules/mcp/abilities/appliers/v3/fixtures/controls/<widget-type>.json
 *
 * shape: `{ "controls": { <setting-key>: <control-config>, ... } }`. The shared Advanced-tab
 * controls live in `advanced-shared.json` and are merged in by the fixture loader — do not
 * duplicate them per widget.
 *
 * @package Elementor
 */

use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	fwrite( STDERR, "This script must be executed through wp eval-file.\n" );
	exit( 1 );
}

if ( ! defined( 'ELEMENTOR_VERSION' ) ) {
	fwrite( STDERR, "Elementor is not active on this WordPress install.\n" );
	exit( 1 );
}

$fixtures_dir = __DIR__ . '/../tests/phpunit/elementor/modules/mcp/abilities/appliers/v3/fixtures/controls';

if ( ! is_dir( $fixtures_dir ) ) {
	fwrite( STDERR, sprintf( "Fixtures directory not found: %s\n", $fixtures_dir ) );
	exit( 1 );
}

$args = array_values( array_filter( $argv ?? [], static fn( $arg ) => 0 !== strpos( (string) $arg, '--wp-' ) ) );
array_shift( $args ); // drop the script path

if ( empty( $args ) ) {
	fwrite( STDERR, "No widget types provided. Pass one or more widget types, or --allowlist.\n" );
	exit( 1 );
}

$widget_types = in_array( '--allowlist', $args, true )
	? Widget_Context_Helper::get_allowlisted_v3_types()
	: $args;

$widgets_manager = Plugin::$instance->widgets_manager;
$elements_manager = Plugin::$instance->elements_manager;

foreach ( $widget_types as $widget_type ) {
	$instance = $widgets_manager->get_widget_types( $widget_type )
		?? $elements_manager->get_element_types( $widget_type );

	if ( ! $instance || ! method_exists( $instance, 'get_controls' ) ) {
		fwrite( STDERR, sprintf( "Skipped `%s`: not a registered V3 widget/element.\n", $widget_type ) );
		continue;
	}

	if ( method_exists( $instance, 'get_stack' ) ) {
		$instance->get_stack();
	}

	$controls = (array) $instance->get_controls();

	// Advanced-tab controls are identical across every V3 widget/element; they are stored
	// separately in `advanced-shared.json` and merged in by the fixture loader. Drop them
	// from the per-widget capture so the fixtures stay minimal and diffs stay meaningful.
	$shared_advanced = shared_advanced_keys( $fixtures_dir );

	$filtered = array_diff_key( $controls, array_flip( $shared_advanced ) );

	$fixture_path = $fixtures_dir . '/' . $widget_type . '.json';
	$json = json_encode(
		[ 'controls' => $filtered ],
		JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
	);

	if ( false === $json ) {
		fwrite( STDERR, sprintf( "Skipped `%s`: json_encode failed.\n", $widget_type ) );
		continue;
	}

	file_put_contents( $fixture_path, $json . "\n" );

	fwrite( STDOUT, sprintf( "Captured `%s` (%d controls) → %s\n", $widget_type, count( $filtered ), $fixture_path ) );
}

/**
 * @return string[]
 */
function shared_advanced_keys( string $fixtures_dir ): array {
	$path = $fixtures_dir . '/advanced-shared.json';

	if ( ! is_readable( $path ) ) {
		return [];
	}

	$decoded = json_decode( (string) file_get_contents( $path ), true );

	return is_array( $decoded['controls'] ?? null ) ? array_keys( $decoded['controls'] ) : [];
}
