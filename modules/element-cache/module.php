<?php
namespace Elementor\Modules\ElementCache;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as ExperimentsManager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	public function get_name() {
		return 'element-cache';
	}

	public function __construct() {
		parent::__construct();

		$this->register_experiments();
		$this->register_shortcode();
	}

	private function register_experiments() {
		Plugin::$instance->experiments->add_feature( [
			'name' => 'e_element_cache',
			'title' => esc_html__( 'Element Cache', 'elementor' ),
			'tag' => esc_html__( 'Performance', 'elementor' ),
			'description' => esc_html__( 'Enable Element Cache to improve the performance of your site by caching the rendered content of Elementor widgets.', 'elementor' ),
			'release_status' => ExperimentsManager::RELEASE_STATUS_DEV,
			'default' => ExperimentsManager::STATE_INACTIVE,
		] );

		add_shortcode( 'yakir-test', function ( $atts ) {
			return 'Yakir Test----' . current_time( 'timestamp' );
		} );
	}

	private function register_shortcode() {
		add_shortcode( 'elementor-element', function ( $atts ) {
			if ( empty( $atts['data'] ) ) {
				return '';
			}

			$widget_data = json_decode( base64_decode( $atts['data'] ), true );

			if ( empty( $widget_data ) || ! is_array( $widget_data ) ) {
				return '';
			}

			ob_start();

			$element = Plugin::$instance->elements_manager->create_element_instance( $widget_data );

			if ( $element ) {
				$element->print_element();
			}

			return ob_get_clean();
		} );
	}
}
