<?php
namespace Elementor\Modules\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Plugin;

class Module extends BaseModule {
	private $variables_route;
	private $classes_route;
	private $widgets_route;
	public function get_name() {
		return 'css-converter';
	}
	public function __construct( $variables_route = null, $classes_route = null, $widgets_route = null ) {
		parent::__construct();
		$this->variables_route = $variables_route;
		$this->classes_route = $classes_route;
		$this->widgets_route = $widgets_route;
		$this->ensure_fresh_property_mapper_registry();
		$this->initialize_routes_in_non_test_environments( $variables_route, $classes_route, $widgets_route );

		$this->register_base_styles_override_hooks();
		$this->register_editor_debug_hooks();
	}

	private function register_base_styles_override_hooks(): void {
		add_action( 'elementor/editor/before_enqueue_scripts', [ $this, 'enqueue_base_styles_override_script' ], 10 );
	}

	public function enqueue_base_styles_override_script(): void {
		$plugin_file = dirname( dirname( __DIR__ ) ) . '/elementor.php';
		wp_enqueue_script(
			'css-converter-base-styles-override',
			plugins_url( 'modules/atomic-widgets/assets/js/editor/css-converter-base-styles-override.js', $plugin_file ),
			[ 'jquery', 'elementor-editor' ],
			'1.0.0',
			true
		);
	}
	private function is_test_environment(): bool {
		return defined( 'WP_TESTS_DOMAIN' ) ||
				defined( 'PHPUNIT_COMPOSER_INSTALL' ) ||
				isset( $_ENV['PHPUNIT_RUNNING'] ) ||
				( function_exists( 'wp_doing_ajax' ) && wp_doing_ajax() && $this->is_phpunit_ajax_request() );
	}
	private function is_phpunit_ajax_request(): bool {
		return $this->has_phpunit_action_in_post();
	}
	private function has_phpunit_action_in_post(): bool {
		return isset( $_POST['action'] ) && 'phpunit' === $_POST['action'];
	}
	private function reset_property_mapper_registry(): void {
		\Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Class_Property_Mapper_Factory::reset();
	}
	private function init_routes(): void {
		if ( ! $this->can_initialize_routes() ) {
			return;
		}
		$this->load_required_dependencies();
		$this->initialize_global_classes_override();
		$this->initialize_classes_route();
		$this->initialize_variables_route();
		$this->initialize_atomic_widgets_route();
	}
	private function can_initialize_routes(): bool {
		return function_exists( 'error_log' );
	}
	private function load_required_dependencies(): void {
		$this->load_files_not_handled_by_elementor_autoloader();
	}

	private function load_files_not_handled_by_elementor_autoloader(): void {
		$this->load_critical_dependencies();
	}

	private function load_critical_dependencies(): void {
		$critical_files = [
			'/exceptions/class-conversion-exception.php',
			'/exceptions/css-parse-exception.php',
			'/parsers/css-parser.php',
			'/parsers/parsed-css.php',
		];

		foreach ( $critical_files as $file ) {
			require_once __DIR__ . $file;
		}
	}
	private function initialize_global_classes_override(): void {
		require_once __DIR__ . '/services/styles/css-converter-global-classes-override.php';
		$override_service = \Elementor\Modules\CssConverter\Services\Styles\CSS_Converter_Global_Classes_Override::make();
		$override_service->register_hooks();
	}
	private function initialize_classes_route(): void {
		require_once __DIR__ . '/routes/classes-route.php';
		$this->classes_route = new \Elementor\Modules\CssConverter\Routes\Classes_Route();
	}
	private function initialize_variables_route(): void {
		require_once __DIR__ . '/routes/variables-route.php';
		$this->variables_route = new \Elementor\Modules\CssConverter\Routes\Variables_Route();
	}

	private function initialize_atomic_widgets_route(): void {
		require_once __DIR__ . '/routes/atomic-widgets-route.php';
		new \Elementor\Modules\CssConverter\Routes\Atomic_Widgets_Route();
	}
	public function get_variables_route() {
		return $this->variables_route;
	}
	public function set_variables_route( $variables_route ): void {
		$this->variables_route = $variables_route;
	}
	public function get_classes_route() {
		return $this->classes_route;
	}
	public function set_classes_route( $classes_route ): void {
		$this->classes_route = $classes_route;
	}


	private function page_has_css_converter_widgets( int $post_id ): bool {
		$document = \Elementor\Plugin::$instance->documents->get( $post_id );
		if ( ! $document ) {
			return false;
		}
		$elements_data = $document->get_elements_data();
		return $this->traverse_elements_for_css_converter_widgets( $elements_data );
	}
	private function traverse_elements_for_css_converter_widgets( array $elements_data ): bool {
		foreach ( $elements_data as $element_data ) {
			if ( $this->element_has_css_converter_flag( $element_data ) ) {
				return true;
			}
			if ( isset( $element_data['elements'] ) && is_array( $element_data['elements'] ) ) {
				if ( $this->traverse_elements_for_css_converter_widgets( $element_data['elements'] ) ) {
					return true;
				}
			}
		}
		return false;
	}

	public function debug_editor_widget_loading() {
		$post_id = get_the_ID();

		if ( ! $post_id ) {
			return;
		}

		$elementor_data = $this->get_elementor_post_data( $post_id );
		if ( ! $elementor_data ) {
			return;
		}

		$data = is_string( $elementor_data ) ? json_decode( $elementor_data, true ) : $elementor_data;
		if ( ! $data || ! is_array( $data ) ) {
			return;
		}

		$widget_types = $this->extract_widget_types_from_data( $data );
		$unique_types = array_unique( $widget_types );

		$converted_types = $this->filter_converted_widget_types( $unique_types );

		if ( ! empty( $converted_types ) ) {

			$this->verify_converted_widgets_are_registered( $converted_types );
		}
	}

	private function ensure_fresh_property_mapper_registry(): void {
		$this->reset_property_mapper_registry();
	}

	private function initialize_routes_in_non_test_environments( $variables_route, $classes_route, $widgets_route ): void {
		if ( ! $this->is_test_environment() && ! $variables_route && ! $classes_route && ! $widgets_route ) {
			$this->init_routes();
		}
	}


	private function register_editor_debug_hooks(): void {
		add_action( 'elementor/editor/before_enqueue_scripts', [ $this, 'debug_editor_widget_loading' ], 5 );
	}

	private function element_has_css_converter_flag( array $element_data ): bool {
		return isset( $element_data['editor_settings']['css_converter_widget'] ) && $element_data['editor_settings']['css_converter_widget'];
	}

	private function get_elementor_post_data( int $post_id ) {
		return get_post_meta( $post_id, '_elementor_data', true );
	}

	private function extract_widget_types_from_data( array $data ): array {
		$widget_types = [];
		array_walk_recursive( $data, function( $value, $key ) use ( &$widget_types ) {
			if ( 'widgetType' === $key ) {
				$widget_types[] = $value;
			}
		} );
		return array_unique( $widget_types );
	}

	private function filter_converted_widget_types( array $widget_types ): array {
		return array_filter( $widget_types, function( $type ) {
			return strpos( $type, '-converted' ) !== false;
		} );
	}

	private function verify_converted_widgets_are_registered( array $converted_types ): void {
		if ( empty( $converted_types ) ) {
			return;
		}

		foreach ( $converted_types as $type ) {
			$this->check_widget_registration( $type );
		}
	}

	private function check_widget_registration( string $type ): void {
		$widget = Plugin::$instance->widgets_manager->get_widget_types( $type );
	}
}
