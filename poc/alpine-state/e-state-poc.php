<?php
/**
 * Plugin Name: E-State POC (throwaway, ED-26112)
 * Description: Delivers server-resolved state through existing Core hooks and a footer JSON, then runs the Alpine runtime. Served at /?e-state-poc=1 on local environments only.
 */

namespace Elementor\Poc\EState;

use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Types_Mapping;
use Elementor\Modules\AtomicWidgets\Elements\Base\Render_Context;
use Elementor\Modules\AtomicWidgets\Elements\Loader\Frontend_Assets_Loader;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const QUERY_VAR = 'e-state-poc';
const CONTEXT_KEY = 'e-state-poc';
const DATA_SCRIPT_ID = 'e-state-poc-data';
const RUNTIME_HANDLE = 'e-state-poc-runtime';
const SELFTEST_HANDLE = 'e-state-poc-selftest';
const TAG_STATE_KEY = 'e-state-poc-key';
const TAG_SITE_NAME = 'e-state-poc-site-name';
const FOOTER_PRIORITY = 1;
const ENQUEUE_PRIORITY = 20;

// phpcs:ignore WordPress.Security.NonceVerification.Recommended
if ( ! isset( $_GET[ QUERY_VAR ] ) || 'local' !== wp_get_environment_type() ) {
	return;
}

require_once __DIR__ . '/state-map.php';

function is_cache_mode(): bool {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	return isset( $_GET['cache'] );
}

function collector( ?array $entry = null, bool $reset = false ): array {
	static $entries = [];

	if ( $reset ) {
		$entries = [];
	}

	if ( null !== $entry ) {
		$entries[] = $entry;
	}

	return $entries;
}

function hook_log( ?string $line = null, bool $reset = false ): array {
	static $lines = [];

	if ( $reset ) {
		$lines = [];
	}

	if ( null !== $line ) {
		$lines[] = $line;
	}

	return $lines;
}

function to_prop_type( string $type ) {
	return 'number' === $type ? Number_Prop_Type::make() : String_Prop_Type::make();
}

function resolve_root_values( array $root ): array {
	$schema = Dynamic_Prop_Types_Mapping::make()->get_extended_schema(
		array_map( __NAMESPACE__ . '\to_prop_type', $root['schema'] )
	);

	$resolved = Render_Props_Resolver::for_settings()->resolve( $schema, $root['stored'] );

	return array_merge( $resolved, $root['plain'] );
}

add_action( 'elementor/dynamic_tags/register', function ( $dynamic_tags ) {
	require_once __DIR__ . '/tags.php';

	$dynamic_tags->register( new State_Key_Tag() );
	$dynamic_tags->register( new Site_Name_Tag() );
} );

add_action( 'elementor/frontend/before_render', function ( $element ) {
	$id = $element->get_id();
	$config = get_state_map()[ $id ] ?? null;

	hook_log( 'before:' . $id );

	if ( ! $config || empty( $config['root'] ) ) {
		return;
	}

	$values = resolve_root_values( $config['root'] );

	Render_Context::push( CONTEXT_KEY, [
		'id' => $id,
		'values' => $values,
	] );
} );

function find_state_text_key( array $settings ): ?string {
	foreach ( $settings as $value ) {
		$is_state_tag = is_array( $value ) && 'dynamic' === ( $value['$$type'] ?? null ) &&
			TAG_STATE_KEY === ( $value['value']['name'] ?? null );

		if ( $is_state_tag ) {
			return $value['value']['settings']['key']['value'] ?? null;
		}
	}

	return null;
}

add_action( 'elementor/frontend/after_render', function ( $element ) {
	$id = $element->get_id();
	$config = get_state_map()[ $id ] ?? null;

	hook_log( 'after:' . $id );

	$text_key = find_state_text_key( $element->get_raw_data()['settings'] ?? [] );

	if ( $text_key ) {
		collector( [
			'dataId' => $id,
			'text' => $text_key,
		] );
	}

	if ( ! $config ) {
		return;
	}

	if ( empty( $config['root'] ) ) {
		collector( array_merge( [ 'dataId' => $id ], $config ) );
		return;
	}

	$context = Render_Context::get( CONTEXT_KEY );
	Render_Context::pop( CONTEXT_KEY );

	collector( [
		'dataId' => $id,
		'root' => [
			'schema' => $config['root']['schema'],
			'values' => $context['values'] ?? [],
			'derived' => $config['root']['derived'],
			'actions' => $config['root']['actions'],
			'max' => $config['root']['max'] ?? null,
		],
	] );
} );

add_action( 'wp_enqueue_scripts', function () {
	if ( ! wp_script_is( Frontend_Assets_Loader::ALPINEJS_HANDLE, 'registered' ) ) {
		( new Frontend_Assets_Loader() )->register_scripts();
	}

	$base_url = ELEMENTOR_URL . 'poc/alpine-state/';
	$version = (string) filemtime( __DIR__ . '/runtime.js' );

	wp_enqueue_script( RUNTIME_HANDLE, $base_url . 'runtime.js', [ Frontend_Assets_Loader::ALPINEJS_HANDLE ], $version, true );
	wp_enqueue_script( SELFTEST_HANDLE, $base_url . 'selftest.js', [ RUNTIME_HANDLE ], (string) filemtime( __DIR__ . '/selftest.js' ), true );
}, ENQUEUE_PRIORITY );

add_action( 'wp_footer', function () {
	$payload = [
		'entries' => collector(),
		'hookLog' => hook_log(),
		'cacheMode' => is_cache_mode(),
	];

	printf(
		'<script type="application/json" id="%1$s">%2$s</script>',
		esc_attr( DATA_SCRIPT_ID ),
		wp_json_encode( $payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG )
	);
}, FOOTER_PRIORITY );

function render_tree(): string {
	$root = Plugin::$instance->elements_manager->create_element_instance( get_tree() );

	if ( ! $root ) {
		return '<p>POC: the root element could not be created.</p>';
	}

	ob_start();
	$root->print_element();

	return ob_get_clean();
}

function render_cached_request(): string {
	add_filter( 'elementor/element/should_render_shortcode', '__return_true' );
	$cached_html = render_tree();
	remove_filter( 'elementor/element/should_render_shortcode', '__return_true' );

	collector( null, true );
	hook_log( null, true );

	return do_shortcode( $cached_html );
}

add_action( 'template_redirect', function () {
	$html = is_cache_mode() ? render_cached_request() : render_tree();
	?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<title>E-State POC</title>
	<style>
		.e-state-poc-page { font-family: sans-serif; padding: 24px; }
		.e-state-poc-page [data-e-item] { display: inline-block; padding: 4px 12px; border: 1px solid #999; cursor: pointer; }
		.e-state-poc-page [data-e-item].is-selected { border-color: #d00; background: #fee; }
		.e-state-poc-page .is-max { outline: 2px solid #d00; }
		#e-state-poc-results { white-space: pre-wrap; background: #f4f4f4; padding: 12px; }
	</style>
	<?php wp_head(); ?>
</head>
<body class="e-state-poc-page">
	<h1>E-State POC<?php echo is_cache_mode() ? ' (simulated cached request)' : ''; ?></h1>
	<?php echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	<h2>Self-test</h2>
	<pre id="e-state-poc-results">pending</pre>
	<?php wp_footer(); ?>
</body>
</html>
	<?php
	exit;
} );
